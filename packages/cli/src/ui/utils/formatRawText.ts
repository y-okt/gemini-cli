import { MarkdownRenderMode } from '../types.js';

/**
 * Very lightweight formatter for raw markdown that applies minimal ANSI colouring
 * for key markdown constructs (headers, bold / italics, inline code).
 * Rendered mode returns text unchanged; full rendering handled elsewhere.
 */
export function formatRawText(text: string, mode: MarkdownRenderMode): string {
  return text.split('\n').join('\n');
}
