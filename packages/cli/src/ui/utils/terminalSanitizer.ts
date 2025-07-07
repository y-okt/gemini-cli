/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import stripAnsi from 'strip-ansi';

/**
 * Sanitizes text content to remove potentially dangerous terminal escape sequences
 * while preserving safe formatting sequences that Ink/React can handle.
 *
 * @param text - The text to sanitize
 * @returns Sanitized text safe for terminal display
 */
export function sanitizeForTerminal(text: string): string {
  if (!text) return text;

  let sanitized = text;

  // Remove potentially dangerous sequences BEFORE using stripAnsi:

  // OSC (Operating System Command) sequences - can change terminal title, etc.
  // Format: ESC ] ... BEL or ESC ] ... ESC \
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/\u001b\].*?(\u0007|\u001b\\)/g, '');

  // APC (Application Program Command) sequences
  // Format: ESC _ ... ESC \
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/\u001b_.*?\u001b\\/g, '');

  // PM (Privacy Message) sequences
  // Format: ESC ^ ... ESC \
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/\u001b\^.*?\u001b\\/g, '');

  // DCS (Device Control String) sequences
  // Format: ESC P ... ESC \
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/\u001bP.*?\u001b\\/g, '');

  // Remove any standalone ESC characters BEFORE stripAnsi to prevent it from
  // incorrectly consuming following characters
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/\u001b(?![[\]_^P])/g, '');

  // Now strip all ANSI escape sequences (color codes, cursor movement, etc.)
  sanitized = stripAnsi(sanitized);

  // Control characters that could affect terminal behavior
  // Keep only safe ones: \t (tab), \n (newline), \r (carriage return)
  sanitized = sanitized.replace(
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
    '',
  );

  // Remove any remaining ESC characters that might have been missed
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/\u001b/g, '');

  return sanitized;
}

/**
 * Sanitizes an array of strings, typically used for code blocks or multi-line content
 *
 * @param lines - Array of strings to sanitize
 * @returns Array of sanitized strings
 */
export function sanitizeLinesForTerminal(lines: string[]): string[] {
  return lines.map((line) => sanitizeForTerminal(line));
}
