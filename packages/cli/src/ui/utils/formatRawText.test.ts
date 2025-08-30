import { describe, it, expect } from 'vitest';
import { formatRawText } from './formatRawText.js';
import { MarkdownRenderMode } from '../types.js';

describe('formatRawText – non-markdown text regression', () => {
  const plain = 'This is a plain log line without markdown.';

  it('returns unchanged text in Rendered mode', () => {
    const out = formatRawText(plain, MarkdownRenderMode.Rendered);
    expect(out).toBe(plain);
  });

  it('returns unchanged text in Raw mode', () => {
    const out = formatRawText(plain, MarkdownRenderMode.Raw);
    expect(out).toBe(plain);
  });

  it('does not inject ANSI codes for plain text', () => {
    const out = formatRawText(plain, MarkdownRenderMode.Raw);
    // No ESC char present
    expect(out).not.toMatch(/\u001b\[/);
  });
});
