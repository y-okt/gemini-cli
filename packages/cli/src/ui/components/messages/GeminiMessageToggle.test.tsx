import React from 'react';
import { render } from 'ink-testing-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiMessage } from './GeminiMessage.js';
import { SettingsContext } from '../../contexts/SettingsContext.js';
import { LoadedSettings } from '../../config/settings.js';
import stdin from 'stdin-mock';

// Stub component that forwards key input to GeminiMessage once implementation lands
const TestWrapper: React.FC<{text: string}> = ({ text }) => {
  // We'll import hook once implemented
  return (
    <GeminiMessage text={text} isPending={false} terminalWidth={80} />
  );
};

describe('GeminiMessage markdown toggle', () => {
  const mockSettings = new LoadedSettings(
    { path: '', settings: {} },
    { path: '', settings: {} },
    { path: '', settings: {} },
    [],
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles to raw mode via Ctrl+Shift+M', () => {
    const markdown = '**bold**';
    const { lastFrame, stdin } = render(
      <SettingsContext.Provider value={mockSettings}>
        <TestWrapper text={markdown} />
      </SettingsContext.Provider>,
    );

    // Initially should render bold ANSI (approx). Snapshot for safety.
    const initial = lastFrame();
    expect(initial).toContain('\u001b'); // ansi escape present for bold render

    // Simulate Ctrl+Shift+M (Ctrl+M with shift) -> ascii 0x0d? but ink uses modifiers
    stdin.write('\u0013'); // Placeholder, will replace once key handler defined

    const toggled = lastFrame();
    expect(toggled).toContain('**bold**'); // raw markdown visible
  });

  it('toggles back to rendered mode on second shortcut press', () => {
    const markdown = '**bold**';
    const { lastFrame, stdin } = render(
      <SettingsContext.Provider value={mockSettings}>
        <TestWrapper text={markdown} />
      </SettingsContext.Provider>,
    );

    const initial = lastFrame();
    expect(initial).toContain('\u001b');

    // first toggle to raw
    stdin.write('\u0013');
    const raw = lastFrame();
    expect(raw).toContain('**bold**');
    // second toggle back
    stdin.write('\u0013');
    const renderedAgain = lastFrame();
    expect(renderedAgain).toContain('\u001b');
  });

  it('syntax highlights raw markdown (e.g., headings)', () => {
    const md = '# Title';
    const { lastFrame, stdin } = render(
      <SettingsContext.Provider value={mockSettings}>
        <TestWrapper text={md} />
      </SettingsContext.Provider>,
    );

    stdin.write('\u0013');
    const raw = lastFrame();
    // Expect ANSI color code from RenderInline heading coloration
    expect(raw).toMatch(/\u001b\[.*m/);
  });
});
