#!/usr/bin/env bun

import { existsSync, mkdirSync, readdirSync, statSync, renameSync, cpSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

// Configuration
const REMOTE_URL = "https://github.com/conradkoh/opencode-config.git";
const SOURCE_PATHS = ["tool", "skill", "plugin", "command", "prompts"];
const SPECIAL_FILES = ["package.json", "bun.lock", "update.ts"];
const BACKUP_DIR = ".backup";

// Get current timestamp for backups
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '');
}

// Logging functions
function log(level: string, message: string): void {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  console.log(`[${timestamp}] [${level}] ${message}`);
}

const logInfo = (msg: string) => log("INFO", msg);
const logWarn = (msg: string) => log("WARN", msg);
const logError = (msg: string) => log("ERROR", msg);
const logSuccess = (msg: string) => log("SUCCESS", msg);

// Execute shell command with logging
function exec(command: string, cwd?: string): string {
  try {
    return execSync(command, { 
      cwd: cwd || process.cwd(), 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (error: any) {
    throw new Error(`Command failed: ${command}\n${error.stderr || error.message}`);
  }
}

// Merge package.json dependencies
function mergePackageJson(sourceFile: string, destFile: string, backupDir: string): void {
  logInfo("Merging package.json...");
  
  const source = JSON.parse(readFileSync(sourceFile, 'utf-8'));
  const dest = existsSync(destFile) ? JSON.parse(readFileSync(destFile, 'utf-8')) : {};
  
  // Backup existing package.json
  if (existsSync(destFile)) {
    const backupPath = join(backupDir, 'package.json');
    mkdirSync(dirname(backupPath), { recursive: true });
    cpSync(destFile, backupPath);
    logInfo(`Backed up package.json to ${backupPath}`);
  }
  
  // Merge dependencies
  const merged = { ...dest };
  
  if (source.dependencies) {
    merged.dependencies = { ...(merged.dependencies || {}), ...source.dependencies };
  }
  
  if (source.devDependencies) {
    merged.devDependencies = { ...(merged.devDependencies || {}), ...source.devDependencies };
  }
  
  // Preserve other fields from source
  for (const key of Object.keys(source)) {
    if (key !== 'dependencies' && key !== 'devDependencies') {
      merged[key] = source[key];
    }
  }
  
  writeFileSync(destFile, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  logSuccess("package.json merged successfully");
}

// Copy directory with conflict resolution (rename existing files to backup directory)
function copyDirectory(src: string, dest: string, backupDir: string): void {
  if (!existsSync(src)) {
    logWarn(`Source directory does not exist: ${src}`);
    return;
  }
  
  mkdirSync(dest, { recursive: true });
  
  const entries = readdirSync(src);
  
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath, join(backupDir, entry));
    } else {
      // If file exists, backup to .backup directory before copying
      if (existsSync(destPath)) {
        const structuredBackupPath = join(backupDir, entry);
        mkdirSync(dirname(structuredBackupPath), { recursive: true });
        cpSync(destPath, structuredBackupPath);
        logInfo(`Backed up: ${destPath} -> ${structuredBackupPath}`);
      }
      
      cpSync(srcPath, destPath);
    }
  }
}

// Main update function
async function update(): Promise<void> {
  const WORK_DIR = process.cwd();
  const TIMESTAMP = getTimestamp();
  
  logInfo("==========================================");
  logInfo("OpenCode Update Script Started");
  logInfo("==========================================");
  logInfo(`Working directory: ${WORK_DIR}`);
  logInfo(`Remote URL: ${REMOTE_URL}`);
  logInfo(`Source paths: ${SOURCE_PATHS.join(', ')}`);
  logInfo(`Special files: ${SPECIAL_FILES.join(', ')}`);
  
  // Create temporary directory
  logInfo("Creating temporary directory for clone...");
  const TEMP_DIR = join(tmpdir(), `opencode-update-${TIMESTAMP}`);
  mkdirSync(TEMP_DIR, { recursive: true });
  logInfo(`Temporary directory created: ${TEMP_DIR}`);
  
  try {
    // Clone repository
    logInfo(`Fetching latest files from remote: ${REMOTE_URL}`);
    exec(`git clone --depth 1 "${REMOTE_URL}" "${TEMP_DIR}"`);
    logSuccess("Repository cloned successfully");
    
    // Create backup directory
    const BACKUP_PATH = join(WORK_DIR, BACKUP_DIR, TIMESTAMP);
    mkdirSync(BACKUP_PATH, { recursive: true });
    logInfo(`Backup directory: ${BACKUP_PATH}`);
    
    // Process special files (package.json, bun.lock, update.ts)
    for (const file of SPECIAL_FILES) {
      const srcFile = join(TEMP_DIR, file);
      const destFile = join(WORK_DIR, file);
      
      if (!existsSync(srcFile)) {
        logWarn(`${file} not found in remote repository, skipping`);
        continue;
      }
      
      logInfo(`==========================================`);
      logInfo(`Processing special file: ${file}`);
      logInfo(`==========================================`);
      
      if (file === 'package.json') {
        mergePackageJson(srcFile, destFile, BACKUP_PATH);
      } else if (file === 'bun.lock') {
        // Simply copy bun.lock (will be regenerated on bun install anyway)
        if (existsSync(destFile)) {
          const backupPath = join(BACKUP_PATH, file);
          cpSync(destFile, backupPath);
          logInfo(`Backed up ${file} to ${backupPath}`);
        }
        cpSync(srcFile, destFile);
        logSuccess(`${file} updated successfully`);
      } else if (file === 'update.ts') {
        // Self-update the script
        if (existsSync(destFile)) {
          const backupPath = join(BACKUP_PATH, file);
          cpSync(destFile, backupPath);
          logInfo(`Backed up ${file} to ${backupPath}`);
        }
        cpSync(srcFile, destFile);
        // Preserve executable permission
        execSync(`chmod +x "${destFile}"`);
        logSuccess(`${file} updated successfully (self-update)`);
      }
    }
    
    // Process each source path
    for (const sourcePath of SOURCE_PATHS) {
      logInfo(`==========================================`);
      logInfo(`Processing directory: ${sourcePath}`);
      logInfo(`==========================================`);
      
      const srcDir = join(TEMP_DIR, sourcePath);
      const destDir = join(WORK_DIR, sourcePath);
      const pathBackupDir = join(BACKUP_PATH, sourcePath);
      
      if (!existsSync(srcDir)) {
        logWarn(`Source directory does not exist: ${srcDir}, skipping`);
        continue;
      }
      
      logInfo(`Source: ${srcDir}`);
      logInfo(`Destination: ${destDir}`);
      
      // Copy with conflict resolution
      copyDirectory(srcDir, destDir, pathBackupDir);
      
      const fileCount = readdirSync(destDir).length;
      logSuccess(`Directory updated successfully (${fileCount} items)`);
    }
    
    // Run bun install to update dependencies
    logInfo("==========================================");
    logInfo("Running bun install to update dependencies...");
    logInfo("==========================================");
    try {
      const output = exec('bun install', WORK_DIR);
      logSuccess("Dependencies updated successfully");
    } catch (error) {
      logWarn("bun install failed, you may need to run it manually");
    }
    
    logInfo("==========================================");
    logSuccess("Update completed successfully!");
    logInfo("==========================================");
    logInfo(`Backup location: ${BACKUP_PATH}`);
    logInfo("==========================================");
    
  } catch (error: any) {
    logError(`Update failed: ${error.message}`);
    throw error;
  } finally {
    // Cleanup temporary directory
    logInfo(`Cleaning up temporary directory: ${TEMP_DIR}`);
    try {
      rmSync(TEMP_DIR, { recursive: true, force: true });
      logInfo("Cleanup completed");
    } catch (error) {
      logWarn("Failed to cleanup temporary directory (non-fatal)");
    }
  }
}

// Run the update
update().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
