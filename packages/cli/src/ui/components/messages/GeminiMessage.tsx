/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Text, Box } from 'ink';
import { MarkdownDisplay } from '../../utils/MarkdownDisplay.js';
import { MarkdownRenderMode } from '../../types.js';
import { Colors } from '../../colors.js';
import { RenderInline } from '../../utils/InlineMarkdownRenderer.js';
import { formatMarkdown } from '../../utils/formatMarkdown.js';

interface GeminiMessageProps {
  text: string;
  isPending: boolean;
  availableTerminalHeight?: number;
  terminalWidth: number;
  renderMode?: MarkdownRenderMode;
}

export const GeminiMessage: React.FC<GeminiMessageProps> = ({
  text,
  isPending,
  availableTerminalHeight,
  terminalWidth,
  renderMode = MarkdownRenderMode.Rendered,
}) => {
  const prefix = '✦ ';
  const prefixWidth = prefix.length;

  return (
    <Box flexDirection="row">
      <Box width={prefixWidth}>
        <Text color={Colors.AccentPurple}>{prefix}</Text>
      </Box>
      <Box flexGrow={1} flexDirection="column">
        {renderMode === MarkdownRenderMode.Rendered ? (
          <MarkdownDisplay
            text={text}
            isPending={isPending}
            availableTerminalHeight={availableTerminalHeight}
            terminalWidth={terminalWidth}
          />
        ) : (
          <Text wrap="wrap">{formatMarkdown(text, renderMode)}</Text>
        )}
      </Box>
    </Box>
  );
};
