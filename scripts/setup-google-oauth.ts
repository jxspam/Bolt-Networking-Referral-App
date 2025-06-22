import { supabase } from "../client/src/lib/supabase.js";
import chalk from "chalk";
import readline from "readline";

// Create a readline interface to get user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupGoogleAuth() {
  console.log(chalk.blue.bold("🔑 Setting up Google OAuth for Supabase Authentication"));
  console.log(chalk.yellow("This script will guide you through the process of setting up Google OAuth for your application."));
  
  console.log("\n" + chalk.cyan("Step 1: Create a Google OAuth Client"));
  console.log("  1. Go to the Google Cloud Console: https://console.cloud.google.com/");
  console.log("  2. Create a new project or select an existing one");
  console.log("  3. Go to 'APIs & Services' > 'Credentials'");
  console.log("  4. Click 'Create Credentials' > 'OAuth client ID'");
  console.log("  5. Set up the OAuth consent screen if prompted");
  
  console.log("\n" + chalk.cyan("Step 2: Configure OAuth Client"));
  console.log("  6. Application type: Web application");
  console.log("  7. Name: Network Earnings App (or your app name)");
  
  // Ask for the app URL
  const appUrl = await new Promise((resolve) => {
    rl.question(chalk.green("\nWhat is your application's URL? (e.g. http://localhost:3000): "), resolve);
  });
  
  console.log("\n" + chalk.cyan("Step 3: Add Redirect URIs to your Google OAuth Client"));
  console.log(`  8. Add these redirect URIs to your Google OAuth Client:`);
  console.log(`     - ${appUrl}/auth/callback`);
  console.log(`     - ${new URL("/auth/callback", appUrl as string).href}`);
  console.log(`     - ${appUrl}/login`);
  
  console.log("\n" + chalk.cyan("Step 4: Get your Client ID and Client Secret"));
  console.log("  9. After creating the OAuth client, you'll get a Client ID and Client Secret");
  
  const clientId = await new Promise((resolve) => {
    rl.question(chalk.green("\nEnter your Google OAuth Client ID: "), resolve);
  });
  
  const clientSecret = await new Promise((resolve) => {
    rl.question(chalk.green("Enter your Google OAuth Client Secret: "), resolve);
  });
  
  console.log("\n" + chalk.cyan("Step 5: Configure Supabase Auth Provider Settings"));
  console.log("  10. Go to your Supabase Project Dashboard");
  console.log("  11. Navigate to Authentication > Providers > Google");
  console.log("  12. Toggle to enable Google Auth");
  console.log("  13. Enter your Client ID and Client Secret");
  console.log(`  14. Set the Authorized Redirect URL: ${appUrl}/auth/callback`);
  
  console.log("\n" + chalk.yellow("Would you like to automatically update your .env file with these settings?"));
  const updateEnv = await new Promise((resolve) => {
    rl.question(chalk.green("Update .env file? (yes/no): "), (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
  
  if (updateEnv) {
    console.log(chalk.green("\nAdd these variables to your .env file:"));
    console.log(`\nVITE_GOOGLE_CLIENT_ID=${clientId}`);
    console.log(`VITE_GOOGLE_CLIENT_SECRET=${clientSecret}`);
    console.log(`VITE_APP_URL=${appUrl}`);
  }
  
  console.log("\n" + chalk.green.bold("✅ Setup instructions complete!"));
  console.log(chalk.yellow("Remember to test the authentication flow after completing these steps."));
  
  rl.close();
}

setupGoogleAuth().catch((error) => {
  console.error(chalk.red("Error during setup:"), error);
  rl.close();
});
