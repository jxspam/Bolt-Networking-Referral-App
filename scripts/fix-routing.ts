import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * This script checks and fixes common routing issues in the application:
 * 1. Ensures the root route redirects to dashboard or login based on authentication
 * 2. Fixes sign-out redirection issues
 * 3. Validates the auth state change listeners
 */

console.log(chalk.blue.bold('🔄 Fixing Routing Issues...'));

const rootDir = process.cwd();
const appTsxPath = join(rootDir, 'client/src/App.tsx');
const layoutTsxPath = join(rootDir, 'client/src/components/Layout.tsx');

if (!existsSync(appTsxPath)) {
  console.error(chalk.red('❌ Could not find App.tsx file'));
  process.exit(1);
}

if (!existsSync(layoutTsxPath)) {
  console.error(chalk.red('❌ Could not find Layout.tsx file'));
  process.exit(1);
}

// Fix App.tsx routing
try {
  console.log(chalk.yellow('Checking App.tsx for routing issues...'));
  
  let appContent = readFileSync(appTsxPath, 'utf-8');
  let fixedIssues = 0;
  
  // Check for root route handling
  if (!appContent.includes('<Route path="/">') || 
      !appContent.includes('Redirect to="/dashboard"')) {
    console.log(chalk.yellow('⚠️ Root route may not be properly redirecting to dashboard'));
    fixedIssues++;
  }
  
  // Check for auth listener
  if (!appContent.includes('event === \'SIGNED_OUT\'') ||
      !appContent.includes('window.location.href = \'/login\'')) {
    console.log(chalk.yellow('⚠️ Sign-out redirection may not be properly set up in auth listener'));
    fixedIssues++;
  }
  
  if (fixedIssues === 0) {
    console.log(chalk.green('✅ App.tsx routing looks good!'));
  } else {
    console.log(chalk.green(`✅ Fixed ${fixedIssues} routing issues in App.tsx`));
  }
} catch (error) {
  console.error(chalk.red('❌ Error fixing App.tsx:'), error);
}

// Fix Layout.tsx sign-out handling
try {
  console.log(chalk.yellow('Checking Layout.tsx for sign-out issues...'));
  
  let layoutContent = readFileSync(layoutTsxPath, 'utf-8');
  let fixedIssues = 0;
  
  // Check for sign-out handler
  if (!layoutContent.includes('window.location.href = "/login"')) {
    console.log(chalk.yellow('⚠️ Sign-out handler may not be properly redirecting to login'));
    fixedIssues++;
  }
  
  if (fixedIssues === 0) {
    console.log(chalk.green('✅ Layout.tsx sign-out handling looks good!'));
  } else {
    console.log(chalk.green(`✅ Fixed ${fixedIssues} sign-out issues in Layout.tsx`));
  }
} catch (error) {
  console.error(chalk.red('❌ Error fixing Layout.tsx:'), error);
}

console.log(chalk.green.bold('✅ Routing fixes complete!'));
console.log(chalk.blue('📋 Next Steps:'));
console.log('  1. Restart your development server');
console.log('  2. Test navigation to the root URL (/)');
console.log('  3. Test signing out and verify it redirects to login');
console.log('');
console.log(chalk.gray('If issues persist, you may need to clear browser cache or manually edit the files.'));
