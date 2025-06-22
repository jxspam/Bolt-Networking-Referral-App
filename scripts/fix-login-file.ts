#!/usr/bin/env node
/**
 * Fix Login.tsx syntax issues
 * 
 * This script replaces the problematic Login.tsx file with a fixed version
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function fixLoginFile() {
  const loginFilePath = path.resolve(rootDir, 'client', 'src', 'pages', 'Login.tsx');
  const fixedFilePath = path.resolve(rootDir, 'client', 'src', 'pages', 'Login.tsx.fixed');
  
  try {
    console.log('Checking for fixed Login.tsx file...');
    
    // Check if the fixed file exists
    try {
      await fs.access(fixedFilePath);
    } catch (error) {
      console.error('Fixed file not found. Please run this script from the project root directory.');
      process.exit(1);
    }
    
    // Backup the original file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${loginFilePath}.backup-${timestamp}`;
    console.log(`Backing up original file to ${backupPath}`);
    await fs.copyFile(loginFilePath, backupPath);
    
    // Replace with the fixed version
    console.log('Replacing Login.tsx with fixed version...');
    const fixedContent = await fs.readFile(fixedFilePath, 'utf8');
    await fs.writeFile(loginFilePath, fixedContent, 'utf8');
    
    console.log('✅ Login.tsx has been fixed successfully!');
    console.log(`Original file backed up to: ${backupPath}`);
  } catch (error) {
    console.error('Error fixing Login.tsx:', error);
    process.exit(1);
  }
}

fixLoginFile()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
