import { execSync } from 'child_process';
import chalk from 'chalk';

export async function runSystemCheck() {
    console.log(chalk.blue("🔍 Checking GitHub Authentication..."));

    try {
        // We check if we are logged in
        execSync('gh auth status', { stdio: 'ignore' });
        console.log(chalk.green("✅ Authenticated with GitHub."));
    } catch (e) {
        console.log(chalk.yellow("\n⚠️  ACTION REQUIRED: GitHub Login Needed"));
        console.log(chalk.white("1. A browser window will open shortly."));
        console.log(chalk.white("2. Enter the code provided by the terminal."));
        console.log(chalk.white("3. The script will continue once login is finished.\n"));
        
        try {
            // 'inherit' is key here: it lets you see the gh auth login prompts 
            // and interact with them directly inside your script.
            execSync('gh auth login -w', { stdio: 'inherit' }); 
            
            // Double check after the login attempt
            execSync('gh auth status', { stdio: 'ignore' });
            console.log(chalk.green("✅ Login successful!"));
        } catch (loginErr) {
            console.log(chalk.red("\n❌ Login failed or was interrupted (Exit Code 130)."));
            console.log(chalk.white("Please run 'gh auth login' manually and then restart the installer."));
            process.exit(1);
        }
    }
}