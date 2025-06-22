#!/usr/bin/env node
/**
 * One-Click Setup & Development Script
 * 
 * This script automates the complete setup and launches the development environment
 * with proper error handling and user guidance.
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupAndDevelop() {
  try {
    console.log('\n🚀 Welcome to Network Earnings - Developer Setup\n');
    
    // Step 1: Check if .env exists, create if not
    console.log('📋 Checking environment configuration...');
    try {
      await fs.access(path.join(rootDir, '.env'));
      console.log('✅ .env file found');
    } catch (error) {
      console.log('Creating .env file from example...');
      await fs.copyFile(
        path.join(rootDir, '.env.example'),
        path.join(rootDir, '.env')
      );
      console.log('✅ .env file created - please update with your credentials');
      console.log('\n⚠️ Please edit the .env file with your Supabase credentials before continuing');
      
      await new Promise(resolve => {
        rl.question('Press Enter when you have updated your .env file...', resolve);
      });
    }
    
    // Step 2: Install dependencies
    console.log('\n📦 Installing dependencies...');
    try {
      execSync('npm run install-deps', { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.error('❌ Error installing dependencies:', error.message);
      process.exit(1);
    }
    
    // Step 3: Fix known issues in Login.tsx
    console.log('\n🔧 Checking and fixing Login.tsx...');
    try {
      execSync('npm run fix:login', { stdio: 'inherit' });
      console.log('✅ Login.tsx fixed or already correct');
    } catch (error) {
      console.warn('⚠️ Could not fix Login.tsx automatically:', error.message);
      console.log('You may need to fix it manually later if you encounter errors');
    }
    
    // Step 4: Initialize database
    console.log('\n🗃️ Setting up database...');
    try {
      execSync('npm run init:database', { stdio: 'inherit' });
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Error setting up database:', error.message);
      console.log('Make sure your Supabase credentials are correct in .env');
      process.exit(1);
    }
    
    // Step 5: Check auth setup
    console.log('\n🔐 Verifying authentication setup...');
    try {
      execSync('npm run check:auth', { stdio: 'inherit' });
      console.log('✅ Authentication setup verified');
    } catch (error) {
      console.warn('⚠️ Authentication check failed:', error.message);
      console.log('This may not be critical, you can still continue');
    }
    
    // Step 6: Start development server
    console.log('\n🌐 Starting development servers...');
    console.log('Press Ctrl+C to stop the servers\n');
    
    try {
      execSync('npm run dev:full', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Error starting development servers:', error.message);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupAndDevelop().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
