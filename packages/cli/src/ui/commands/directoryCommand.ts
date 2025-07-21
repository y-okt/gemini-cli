/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SlashCommand, CommandContext, CommandKind } from './types.js';
import process from 'node:process';

const addSubcommand: SlashCommand = {
  name: 'add',
  description: 'Add a directory to the workspace',
  kind: CommandKind.BUILT_IN,
  action: (context: CommandContext, args: string) => {
    const config = context.services.config;
    if (!config) {
      return {
        type: 'message' as const,
        messageType: 'info' as const,
        content: 'No configuration available',
      };
    }

    // Check if running in a restrictive sandbox profile
    const sandboxConfig = config.getSandbox();
    const seatbeltProfile = process.env.SEATBELT_PROFILE;

    if (
      sandboxConfig &&
      sandboxConfig.command === 'sandbox-exec' &&
      seatbeltProfile &&
      seatbeltProfile.startsWith('restrictive-')
    ) {
      return {
        type: 'message' as const,
        messageType: 'error' as const,
        content:
          'The /directory add command is not supported in restrictive sandbox profiles. Please use --include-directories when starting the session instead.',
      };
    }

    const directory = args.trim();
    if (!directory) {
      return {
        type: 'message' as const,
        messageType: 'info' as const,
        content: 'Please provide a directory path: /directory add <path>',
      };
    }

    try {
      const workspaceContext = config.getWorkspaceContext();
      workspaceContext.addDirectory(directory);

      return {
        type: 'message' as const,
        messageType: 'info' as const,
        content: `Added directory to workspace: ${directory}`,
      };
    } catch (_error) {
      return {
        type: 'message' as const,
        messageType: 'error' as const,
        content: `Failed to add directory: ${_error instanceof Error ? _error.message : String(_error)}`,
      };
    }
  },
};

const showSubcommand: SlashCommand = {
  name: 'show',
  description: 'Show all workspace directories',
  kind: CommandKind.BUILT_IN,
  action: (context: CommandContext) => {
    const config = context.services.config;
    if (!config) {
      return {
        type: 'message' as const,
        messageType: 'info' as const,
        content: 'No configuration available',
      };
    }

    try {
      const workspaceContext = config.getWorkspaceContext();
      const directories = workspaceContext.getDirectories();

      if (directories.length === 0) {
        return {
          type: 'message' as const,
          messageType: 'info' as const,
          content: 'No directories in workspace',
        };
      }

      const message = `Workspace directories:\n${directories.map((dir, index) => `  ${index + 1}. ${dir}`).join('\n')}`;

      return {
        type: 'message' as const,
        messageType: 'info' as const,
        content: message,
      };
    } catch (_error) {
      return {
        type: 'message' as const,
        messageType: 'error' as const,
        content: `Failed to list directories: ${_error instanceof Error ? _error.message : String(_error)}`,
      };
    }
  },
};

export const directoryCommand: SlashCommand = {
  name: 'directory',
  altNames: ['dir'],
  description: 'Manage workspace directories',
  kind: CommandKind.BUILT_IN,
  subCommands: [addSubcommand, showSubcommand],
  action: (context: CommandContext, args: string) => {
    const [subcommandName, ...subcommandArgs] = args.trim().split(/\s+/);
    const subcommand = directoryCommand.subCommands?.find(
      (cmd) => cmd.name === subcommandName,
    );

    if (subcommand?.action) {
      return subcommand.action(context, subcommandArgs.join(' '));
    }

    // Show help if no subcommand is provided or subcommand is invalid
    return {
      type: 'message' as const,
      messageType: 'info' as const,
      content: `Invalid subcommand. Available commands:
  /directory add <path>  - Add a directory to the workspace
  /directory show        - Show all workspace directories`,
    };
  },
};
