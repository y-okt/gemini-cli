/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { directoryCommand, expandHomeDir } from './directoryCommand.js';
import { Config, WorkspaceContext } from '@google/gemini-cli-core';
import { CommandContext } from './types.js';
import { MessageType } from '../types.js';
import * as os from 'os';
import * as path from 'path';

describe('directoryCommand', () => {
  let mockContext: CommandContext;
  let mockConfig: Config;
  let mockWorkspaceContext: WorkspaceContext;

  beforeEach(() => {
    mockWorkspaceContext = {
      addDirectory: vi.fn(),
      getDirectories: vi
        .fn()
        .mockReturnValue(['/home/user/project1', '/home/user/project2']),
    } as unknown as WorkspaceContext;

    mockConfig = {
      getWorkspaceContext: () => mockWorkspaceContext,
      isRestrictiveSandbox: vi.fn().mockReturnValue(false),
      getGeminiClient: vi.fn().mockReturnValue({
        refreshEnvironment: vi.fn(),
      }),
    } as unknown as Config;

    mockContext = {
      services: {
        config: mockConfig,
      },
      ui: {
        addItem: vi.fn(),
      },
    } as unknown as CommandContext;
  });

  it('should show an error if no subcommand is provided', () => {
    if (!directoryCommand.action) throw new Error('No action');
    directoryCommand.action(mockContext, '');
    expect(mockContext.ui.addItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: MessageType.ERROR,
        text: 'Invalid subcommand. Available subcommands: add, show',
      }),
      expect.any(Number),
    );
  });

  describe('show', () => {
    it('should display the list of directories', () => {
      if (!directoryCommand.action) throw new Error('No action');
      directoryCommand.action(mockContext, 'show');
      expect(mockWorkspaceContext.getDirectories).toHaveBeenCalled();
      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO,
          text: 'Current workspace directories:\n- /home/user/project1\n- /home/user/project2',
        }),
        expect.any(Number),
      );
    });
  });

  describe('add', () => {
    it('should show an error if no path is provided', () => {
      if (!directoryCommand.action) throw new Error('No action');
      directoryCommand.action(mockContext, 'add');
      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.ERROR,
          text: 'Please provide at least one path to add.',
        }),
        expect.any(Number),
      );
    });

    it('should call addDirectory and show a success message for a single path', async () => {
      const newPath = '/home/user/new-project';
      if (!directoryCommand.action) throw new Error('No action');
      await directoryCommand.action(mockContext, `add ${newPath}`);
      expect(mockWorkspaceContext.addDirectory).toHaveBeenCalledWith(newPath);
      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO,
          text: `Successfully added directories:\n- ${newPath}`,
        }),
        expect.any(Number),
      );
    });

    it('should call addDirectory for each path and show a success message for multiple paths', async () => {
      const newPath1 = '/home/user/new-project1';
      const newPath2 = '/home/user/new-project2';
      if (!directoryCommand.action) throw new Error('No action');
      await directoryCommand.action(mockContext, `add ${newPath1},${newPath2}`);
      expect(mockWorkspaceContext.addDirectory).toHaveBeenCalledWith(newPath1);
      expect(mockWorkspaceContext.addDirectory).toHaveBeenCalledWith(newPath2);
      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO,
          text: `Successfully added directories:\n- ${newPath1}\n- ${newPath2}`,
        }),
        expect.any(Number),
      );
    });

    it('should show an error if addDirectory throws an exception', async () => {
      const error = new Error('Directory does not exist');
      vi.mocked(mockWorkspaceContext.addDirectory).mockImplementation(() => {
        throw error;
      });
      const newPath = '/home/user/invalid-project';
      if (!directoryCommand.action) throw new Error('No action');
      await directoryCommand.action(mockContext, `add ${newPath}`);
      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.ERROR,
          text: `Error adding '${newPath}': ${error.message}`,
        }),
        expect.any(Number),
      );
    });

    it('should handle a mix of successful and failed additions', async () => {
      const validPath = '/home/user/valid-project';
      const invalidPath = '/home/user/invalid-project';
      const error = new Error('Directory does not exist');
      vi.mocked(mockWorkspaceContext.addDirectory).mockImplementation(
        (path) => {
          if (path === invalidPath) {
            throw error;
          }
        },
      );

      if (!directoryCommand.action) throw new Error('No action');
      await directoryCommand.action(
        mockContext,
        `add ${validPath},${invalidPath}`,
      );

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO,
          text: `Successfully added directories:\n- ${validPath}`,
        }),
        expect.any(Number),
      );

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.ERROR,
          text: `Error adding '${invalidPath}': ${error.message}`,
        }),
        expect.any(Number),
      );
    });
  });
  it('should correctly expand a Windows-style home directory path', () => {
    const windowsPath = '%userprofile%\\Documents';
    const expectedPath = path.win32.join(os.homedir(), 'Documents');
    const result = expandHomeDir(windowsPath);
    expect(path.win32.normalize(result)).toBe(
      path.win32.normalize(expectedPath),
    );
  });
});
