import React from 'react';
import { render } from 'ink-testing-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiMessage } from './GeminiMessage.js';
import { SettingsContext } from '../../contexts/SettingsContext.js';
import { LoadedSettings } from '../../../config/settings.js';

const TestWrapper: React.FC<{text: string}> = ({ text }) => {
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
      <SettingsContext.Provider value={{ settings: mockSettings, recomputeSettings: vi.fn() }}>
        <TestWrapper text={markdown} />
      </SettingsContext.Provider>,
    );

    const initial = lastFrame();
    expect(initial).toContain('\u001b');

    stdin.write('\u0013');

    const toggled = lastFrame();
    expect(toggled).toContain('**bold**');
  });

  it('toggles back to rendered mode on second shortcut press', () => {
    const markdown = '**bold**';
    const { lastFrame, stdin } = render(
      <SettingsContext.Provider value={{ settings: mockSettings, recomputeSettings: vi.fn() }}>
        <TestWrapper text={markdown} />
      </SettingsContext.Provider>,
    );

    const initial = lastFrame();
    expect(initial).toContain('\u001b');

    stdin.write('\u0013');
    const raw = lastFrame();
    expect(raw).toContain('**bold**');
    stdin.write('\u0013');
    const renderedAgain = lastFrame();
    expect(renderedAgain).toContain('\u001b');
  });

  it('syntax highlights raw markdown (e.g., headings)', () => {
    const md = '# Title';
    const { lastFrame, stdin } = render(
      <SettingsContext.Provider value={{ settings: mockSettings, recomputeSettings: vi.fn() }}>
        <TestWrapper text={md} />
      </SettingsContext.Provider>,
    );

    stdin.write('\u0013');
    const raw = lastFrame();
    expect(raw).toMatch(/\u001b\[.*m/);
  });
});
