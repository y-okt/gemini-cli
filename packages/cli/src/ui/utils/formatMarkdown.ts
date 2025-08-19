import chalk from 'chalk';
import { MarkdownRenderMode } from '../types.js';

/**
 * Very lightweight formatter for raw markdown that applies minimal ANSI colouring
 * for key markdown constructs (headers, bold / italics, inline code).
 * Rendered mode returns text unchanged; full rendering handled elsewhere.
 */
export function formatMarkdown(text: string, mode: MarkdownRenderMode): string {
  if (mode === MarkdownRenderMode.Rendered) {
    return text;
  }

  return text
    .split('\n')
    .map((line) => colorizeLine(line))
    .join('\n');
}

function colorizeLine(line: string): string {
  // Headings
  const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    switch (level) {
      case 1:
        return chalk.cyan.bold(line);
      case 2:
        return chalk.blue.bold(line);
      default:
        return chalk.bold(line);
    }
  }
  // Inline code `code`
  line = line.replace(/`([^`]+)`/g, (_, code) => chalk.yellow(code));
  // Bold **text** or __text__
  line = line.replace(/\*\*([^*]+)\*\*/g, (_, bold) => chalk.bold(bold));
  line = line.replace(/__([^_]+)__/g, (_, bold) => chalk.bold(bold));
  return line;
}
