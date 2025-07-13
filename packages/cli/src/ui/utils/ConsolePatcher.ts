/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import util from 'util';
import { ConsoleMessageItem } from '../types.js';

type ConsoleMethod = 'log' | 'warn' | 'error' | 'debug';

interface ConsolePatcherParams {
  onNewMessage?: (message: Omit<ConsoleMessageItem, 'id'>) => void;
  debugMode: boolean;
  bufferMode?: boolean;
  filterPatterns?: string[];
}

interface BufferedMessage {
  type: ConsoleMethod;
  args: unknown[];
  timestamp: number;
}

/**
 * ConsolePatcher handles console method interception with optional buffering.
 * It can operate in two modes:
 * 1. Direct mode: Messages are immediately passed to onNewMessage callback
 * 2. Buffer mode: Messages are stored until retrieved via getBufferedMessages()
 */
export class ConsolePatcher {
  private originalConsoleLog = console.log;
  private originalConsoleWarn = console.warn;
  private originalConsoleError = console.error;
  private originalConsoleDebug = console.debug;

  private params: ConsolePatcherParams;
  private buffer: BufferedMessage[] = [];
  private isPatched = false;

  constructor(params: ConsolePatcherParams) {
    this.params = params;
  }

  updateParams(params: Partial<ConsolePatcherParams>): void {
    this.params = { ...this.params, ...params };
  }

  patch() {
    if (this.isPatched) return;
    this.isPatched = true;

    console.log = this.patchConsoleMethod('log', this.originalConsoleLog);
    console.warn = this.patchConsoleMethod('warn', this.originalConsoleWarn);
    console.error = this.patchConsoleMethod('error', this.originalConsoleError);
    console.debug = this.patchConsoleMethod('debug', this.originalConsoleDebug);
  }

  cleanup = () => {
    if (!this.isPatched) return;
    this.isPatched = false;

    console.log = this.originalConsoleLog;
    console.warn = this.originalConsoleWarn;
    console.error = this.originalConsoleError;
    console.debug = this.originalConsoleDebug;
  };

  getBufferedMessages(): ConsoleMessageItem[] {
    const messages = this.buffer.map((msg) => ({
      type: msg.type,
      content: util.format(...msg.args),
      count: 1,
    }));
    this.buffer = [];
    return messages;
  }

  clearBuffer(): void {
    this.buffer = [];
  }

  private formatArgs = (args: unknown[]): string => util.format(...args);

  private shouldCapture(message: string): boolean {
    if (
      !this.params.filterPatterns ||
      this.params.filterPatterns.length === 0
    ) {
      return true; // Capture all messages if no patterns specified
    }
    return this.params.filterPatterns.some((pattern) =>
      message.includes(pattern),
    );
  }

  private patchConsoleMethod =
    (type: ConsoleMethod, originalMethod: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      const formattedMessage = this.formatArgs(args);

      if (this.params.bufferMode && this.params.filterPatterns) {
        if (this.shouldCapture(formattedMessage)) {
          this.buffer.push({
            type,
            args,
            timestamp: Date.now(),
          });
        } else {
          originalMethod.apply(console, args);
        }
        return;
      }

      if (this.params.debugMode) {
        originalMethod.apply(console, args);
      }

      if (type !== 'debug' || this.params.debugMode) {
        if (this.params.bufferMode) {
          this.buffer.push({
            type,
            args,
            timestamp: Date.now(),
          });
        } else if (this.params.onNewMessage) {
          this.params.onNewMessage({
            type,
            content: formattedMessage,
            count: 1,
          });
        }
      }
    };
}

export const earlyConsolePatcher = new ConsolePatcher({
  debugMode: false,
  bufferMode: true,
  filterPatterns: ['MCP STDERR', 'Loaded cached credentials'],
});
