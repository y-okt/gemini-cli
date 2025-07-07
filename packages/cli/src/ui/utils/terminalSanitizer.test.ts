/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeForTerminal,
  sanitizeLinesForTerminal,
} from './terminalSanitizer.js';

describe('terminalSanitizer', () => {
  describe('sanitizeForTerminal', () => {
    it('should preserve normal text', () => {
      expect(sanitizeForTerminal('Hello World')).toBe('Hello World');
      expect(sanitizeForTerminal('Line 1\nLine 2')).toBe('Line 1\nLine 2');
      expect(sanitizeForTerminal('Tab\there')).toBe('Tab\there');
    });

    it('should handle empty or null input', () => {
      expect(sanitizeForTerminal('')).toBe('');
      // Test with type assertion to simulate runtime behavior
      expect(sanitizeForTerminal(null as unknown as string)).toBe(null);
      expect(sanitizeForTerminal(undefined as unknown as string)).toBe(
        undefined,
      );
    });

    it('should remove ANSI color codes', () => {
      expect(sanitizeForTerminal('\u001b[31mRed Text\u001b[0m')).toBe(
        'Red Text',
      );
      expect(sanitizeForTerminal('\u001b[1;32mBold Green\u001b[0m')).toBe(
        'Bold Green',
      );
    });

    it('should remove OSC sequences', () => {
      // Terminal title change
      expect(sanitizeForTerminal('\u001b]0;Evil Title\u0007Normal Text')).toBe(
        'Normal Text',
      );
      expect(sanitizeForTerminal('\u001b]2;Another Title\u001b\\Text')).toBe(
        'Text',
      );
    });

    it('should remove APC sequences', () => {
      expect(sanitizeForTerminal('\u001b_Some APC Command\u001b\\Text')).toBe(
        'Text',
      );
    });

    it('should remove PM sequences', () => {
      expect(sanitizeForTerminal('\u001b^Privacy Message\u001b\\Text')).toBe(
        'Text',
      );
    });

    it('should remove DCS sequences', () => {
      expect(sanitizeForTerminal('\u001bPDevice Control\u001b\\Text')).toBe(
        'Text',
      );
    });

    it('should remove dangerous control characters', () => {
      expect(sanitizeForTerminal('Text\u0000\u0001\u0002')).toBe('Text');
      expect(sanitizeForTerminal('\u000EShift Out\u000F')).toBe('Shift Out');
      expect(sanitizeForTerminal('Bell\u0007Sound')).toBe('BellSound');
    });

    it('should preserve safe whitespace characters', () => {
      expect(sanitizeForTerminal('Line 1\nLine 2')).toBe('Line 1\nLine 2');
      expect(sanitizeForTerminal('Tab\tSeparated')).toBe('Tab\tSeparated');
      expect(sanitizeForTerminal('Carriage\rReturn')).toBe('Carriage\rReturn');
    });

    it('should remove any remaining ESC characters', () => {
      expect(sanitizeForTerminal('Text\u001bLeftover')).toBe('TextLeftover');
    });

    it('should handle complex mixed sequences', () => {
      const input =
        '\u001b[31mRed\u001b[0m\u001b]0;Title\u0007\nNormal\u0000Text\u001b_APC\u001b\\';
      const expected = 'Red\nNormalText';
      expect(sanitizeForTerminal(input)).toBe(expected);
    });
  });

  describe('sanitizeLinesForTerminal', () => {
    it('should sanitize each line in an array', () => {
      const lines = [
        '\u001b[31mRed Line\u001b[0m',
        'Normal Line',
        '\u001b]0;Title\u0007Third Line',
      ];
      const expected = ['Red Line', 'Normal Line', 'Third Line'];
      expect(sanitizeLinesForTerminal(lines)).toEqual(expected);
    });

    it('should handle empty array', () => {
      expect(sanitizeLinesForTerminal([])).toEqual([]);
    });
  });
});
