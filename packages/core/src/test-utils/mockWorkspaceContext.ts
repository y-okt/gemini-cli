/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi } from 'vitest';
import { WorkspaceContext } from '../utils/workspaceContext.js';

/**
 * Creates a mock WorkspaceContext for testing
 * @param rootDir The root directory to use for the mock
 * @returns A mock WorkspaceContext instance
 */
export function createMockWorkspaceContext(rootDir: string): WorkspaceContext {
  const mockWorkspaceContext = {
    addDirectory: vi.fn(),
    getDirectories: vi.fn().mockReturnValue([rootDir]),
    isPathWithinWorkspace: vi
      .fn()
      .mockImplementation((path: string) => path.startsWith(rootDir)),
  } as unknown as WorkspaceContext;

  return mockWorkspaceContext;
}
