/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SlashCommand, CommandContext, CommandKind } from './types.js';
import { MessageType } from '../types.js';

export const directoryCommand: SlashCommand = {
  name: 'directory',
  altNames: ['dir'],
  description: 'Manage workspace directories',
  kind: CommandKind.BUILT_IN,
  action: (context: CommandContext, args: string) => {
    const {
      ui: { addItem },
      services: { config },
    } = context;
    const [subcommand, ...rest] = args.split(' ');

    if (!config) {
      addItem(
        {
          type: MessageType.ERROR,
          text: 'Configuration is not available.',
        },
        Date.now(),
      );
      return;
    }

    const workspaceContext = config.getWorkspaceContext();

    switch (subcommand) {
      case 'show': {
        const directories = workspaceContext.getDirectories();
        const directoryList = directories.map((dir) => `- ${dir}`).join('\n');
        addItem(
          {
            type: MessageType.INFO,
            text: `Current workspace directories:\n${directoryList}`,
          },
          Date.now(),
        );
        break;
      }
      case 'add': {
        const pathsToAdd = rest
          .join(' ')
          .split(',')
          .filter((p) => p);
        if (pathsToAdd.length === 0) {
          addItem(
            {
              type: MessageType.ERROR,
              text: 'Please provide at least one path to add.',
            },
            Date.now(),
          );
          return;
        }

        if (config.isRestrictiveSandbox()) {
          return {
            type: 'message' as const,
            messageType: 'error' as const,
            content:
              'The /directory add command is not supported in restrictive sandbox profiles. Please use --include-directories when starting the session instead.',
          };
        }

        const added: string[] = [];
        const errors: string[] = [];

        for (const pathToAdd of pathsToAdd) {
          try {
            workspaceContext.addDirectory(pathToAdd.trim());
            added.push(pathToAdd.trim());
          } catch (e) {
            const error = e as Error;
            errors.push(`Error adding '${pathToAdd.trim()}': ${error.message}`);
          }
        }

        if (added.length > 0) {
          const gemini = config.getGeminiClient();
          if (gemini) {
            gemini.refreshEnvironment();
          }
          addItem(
            {
              type: MessageType.INFO,
              text: `Successfully added directories:\n- ${added.join('\n- ')}`,
            },
            Date.now(),
          );
        }

        if (errors.length > 0) {
          addItem(
            {
              type: MessageType.ERROR,
              text: errors.join('\n'),
            },
            Date.now(),
          );
        }
        break;
      }
      default: {
        addItem(
          {
            type: MessageType.ERROR,
            text: 'Invalid subcommand. Available subcommands: add, show',
          },
          Date.now(),
        );
        break;
      }
    }
  },
};
