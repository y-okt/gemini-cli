/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'node:path';
import * as os from 'os';
import * as crypto from 'crypto';
import * as fs from 'fs';

export const GEMINI_DIR = '.gemini';
export const GOOGLE_ACCOUNTS_FILENAME = 'google_accounts.json';
const TMP_DIR_NAME = 'tmp';
const HISTORY_DIR_NAME = 'history';

export class Storage {
  private readonly targetDir: string;

  constructor(targetDir: string) {
    this.targetDir = targetDir;
    try {
      this.ensureGlobalGeminiDirExists();
      this.ensureGlobalTempDirExists();
      this.ensureProjectTempDirExists();
      this.ensureGlobalHistoryDirExists();
    } catch (error) {
      throw new Error(
        `Failed to create required Gemini directories. Please check permissions for your home and temp directories. Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getGeminiDir(): string {
    return path.join(this.targetDir, GEMINI_DIR);
  }

  getGlobalGeminiDir(): string {
    const homeDir = os.homedir();
    if (!homeDir) {
      // This is a fallback for testing environments where homedir is not defined.
      return path.join(os.tmpdir(), '.gemini');
    }
    const geminiDir = path.join(homeDir, GEMINI_DIR);
    return geminiDir;
  }

  private ensureGlobalGeminiDirExists(): void {
    fs.mkdirSync(this.getGlobalGeminiDir(), { recursive: true });
  }

  private ensureGlobalHistoryDirExists(): void {
    const historyDir = path.join(this.getGlobalGeminiDir(), HISTORY_DIR_NAME);
    fs.mkdirSync(historyDir, { recursive: true });
  }

  getGlobalTempDir(): string {
    const globalGeminiDir = this.getGlobalGeminiDir();
    const tempDir = path.join(globalGeminiDir, TMP_DIR_NAME);
    return tempDir;
  }

  private ensureGlobalTempDirExists(): void {
    fs.mkdirSync(this.getGlobalTempDir(), { recursive: true });
  }

  getProjectTempDir(): string {
    const hash = this.getFilePathHash(this.getProjectRoot());
    const tempDir = this.getGlobalTempDir();
    return path.join(tempDir, hash);
  }

  private ensureProjectTempDirExists(): void {
    fs.mkdirSync(this.getProjectTempDir(), { recursive: true });
  }

  getOAuthCredsPath(): string {
    return path.join(this.getGlobalGeminiDir(), 'oauth_creds.json');
  }

  getProjectRoot(): string {
    return this.targetDir;
  }

  private getFilePathHash(filePath: string): string {
    return crypto.createHash('sha256').update(filePath).digest('hex');
  }

  getInstallationIdPath(): string {
    return path.join(this.getGlobalGeminiDir(), 'installation_id');
  }

  getGoogleAccountsPath(): string {
    return path.join(this.getGlobalGeminiDir(), GOOGLE_ACCOUNTS_FILENAME);
  }

  getHistoryDir(): string {
    const hash = this.getFilePathHash(this.getProjectRoot());
    const historyDir = path.join(this.getGlobalGeminiDir(), HISTORY_DIR_NAME);
    return path.join(historyDir, hash);
  }

  getGlobalSettingsPath(): string {
    return path.join(this.getGlobalGeminiDir(), 'settings.json');
  }

  getWorkspaceSettingsPath(): string {
    return path.join(this.getGeminiDir(), 'settings.json');
  }

  getUserCommandsDir(): string {
    return path.join(this.getGlobalGeminiDir(), 'commands');
  }

  getProjectCommandsDir(): string {
    return path.join(this.getGeminiDir(), 'commands');
  }

  getMcpOAuthTokensPath(): string {
    return path.join(this.getGlobalGeminiDir(), 'mcp-oauth-tokens.json');
  }

  getProjectTempCheckpointsDir(): string {
    return path.join(this.getProjectTempDir(), 'checkpoints');
  }

  getExtensionsDir(): string {
    return path.join(this.getGeminiDir(), 'extensions');
  }

  getExtensionsConfigPath(): string {
    return path.join(this.getExtensionsDir(), 'gemini-extension.json');
  }
}
