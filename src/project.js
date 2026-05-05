import { execSync } from 'child_process';
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

/**
 * Creates or links a repository with customizable privacy.
 * @param {string} repoName - The name of the repository.
 * @param {string} visibility - 'public' or 'private'.
 */
export async function createNewRepo(repoName, visibility = 'public') {
    try {
        // 1. SELF-AWARENESS & DIRECTORY CHECK
        const currentFolderName = path.basename(process.cwd());
        
        if (currentFolderName === repoName) {
            console.log(chalk.magenta(`🎯 Detection: Using current directory '${repoName}'.`));
        } else {
            const folderExists = await fs.pathExists(repoName);
            if (!folderExists) {
                console.log(chalk.blue(`📁 Creating local folder: ${repoName}`));
                await fs.ensureDir(repoName);
            }
            process.chdir(repoName);
        }

        // 2. SMART GIT INITIALIZATION
        if (!fs.existsSync('.git')) {
            console.log(chalk.blue("🔧 Initializing Git repository..."));
            execSync('git init', { stdio: 'ignore' });
            execSync('git branch -M main', { stdio: 'ignore' });
        }

        // 3. ENSURE INITIAL COMMIT (Fixes the "no commits" error)
        let hasCommits = false;
        try {
            execSync('git rev-parse HEAD', { stdio: 'ignore' });
            hasCommits = true;
        } catch (e) {
            hasCommits = false;
        }

        if (!hasCommits) {
            console.log(chalk.yellow("📦 Creating initial commit..."));
            execSync('git add .');
            
            // Check if folder is empty to avoid empty commit error
            const files = fs.readdirSync('.').filter(f => f !== '.git');
            if (files.length === 0) {
                await fs.writeFile('README.md', `# ${repoName}\nAutomated by Git-Infra`);
                execSync('git add README.md');
            }
            
            execSync('git commit -m "initial commit: system setup"');
        }

        // 4. GITHUB CLOUD LINKING WITH PRIVACY CONTROL
        try {
            execSync(`gh repo view ${repoName}`, { stdio: 'ignore' });
            console.log(chalk.cyan(`🌐 GitHub repo '${repoName}' already exists.`));
        } catch (e) {
            console.log(chalk.blue(`🚀 Creating and Pushing to ${visibility.toUpperCase()} GitHub repo...`));
            
            // The --${visibility} flag handles either --public or --private
            execSync(`gh repo create ${repoName} --${visibility} --source=. --remote=origin --push`, { stdio: 'inherit' });
        }

        console.log(chalk.bold.green(`\n🏁 Success! '${repoName}' is now a live ${visibility} Git repository.`));

    } catch (err) {
        console.log(chalk.red("❌ Error in project setup:"), err.message);
    }
}