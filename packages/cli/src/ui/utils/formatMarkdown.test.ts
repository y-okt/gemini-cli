import { describe, it, expect } from 'vitest';
import { formatMarkdown } from './formatMarkdown.js';

// Local mirror of enum to keep test type-sound without cross-module dependency.
type MarkdownRenderMode = 'rendered' | 'raw';

describe('formatMarkdown – non-markdown text regression', () => {
  const plain = 'This is a plain log line without markdown.';

  it('returns unchanged text in Rendered mode', () => {
    const out = formatMarkdown(plain, 'rendered' as unknown as MarkdownRenderMode);
    expect(out).toBe(plain);
  });

  it('returns unchanged text in Raw mode', () => {
    const out = formatMarkdown(plain, 'raw' as unknown as MarkdownRenderMode);
    expect(out).toBe(plain);
  });

  it('does not inject ANSI codes for plain text', () => {
    const out = formatMarkdown(plain, 'raw' as unknown as MarkdownRenderMode);
    // No ESC char present
    expect(out).not.toMatch(/\u001b\[/);
  });
});
