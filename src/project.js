import { execSync } from 'child_process';
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

export async function createNewRepo(repoName) {
    try {
        // 1. SELF-AWARENESS CHECK
        // Get the name of the folder you are currently sitting in
        const currentFolderName = path.basename(process.cwd());
        
        if (currentFolderName === repoName) {
            console.log(chalk.magenta(`🎯 Detection: You are already inside '${repoName}'. Using current directory.`));
        } else {
            // If you are NOT in the folder, check if it exists or create it
            const folderExists = await fs.pathExists(repoName);
            if (!folderExists) {
                console.log(chalk.blue(`📁 Creating local folder: ${repoName}`));
                await fs.ensureDir(repoName);
            }
            process.chdir(repoName);
        }

        // 2. GIT INITIALIZATION (Ensures we have a 'main' branch)
        if (!fs.existsSync('.git')) {
            console.log(chalk.blue("🔧 Initializing Git repository..."));
            execSync('git init', { stdio: 'ignore' });
            execSync('git branch -M main', { stdio: 'ignore' });
        }

        // 3. THE "NOTHING TO PUSH" FIX
        // We must have at least one commit for 'gh repo create --push' to work.
        const hasCommits = execSync('git rev-list -n 1 --all 2>/dev/null', { encoding: 'utf8' }).trim() !== "";
        
        if (!hasCommits) {
            console.log(chalk.yellow("📦 No commits found. Creating initial commit from existing files..."));
            execSync('git add .');
            // We use a try/catch here in case the folder is literally empty
            try {
                execSync('git commit -m "initial commit: system setup"');
            } catch (e) {
                await fs.writeFile('README.md', `# ${repoName}\nCreated via git-infra`);
                execSync('git add README.md');
                execSync('git commit -m "initial commit: added readme"');
            }
        }

        // 4. GITHUB CLOUD LINKING
        try {
            execSync(`gh repo view ${repoName}`, { stdio: 'ignore' });
            console.log(chalk.cyan(`🌐 GitHub repo '${repoName}' already exists.`));
        } catch (e) {
            console.log(chalk.blue("🚀 Creating and Pushing to GitHub..."));
            // This flag works perfectly now because we ensured a commit exists above
            execSync(`gh repo create ${repoName} --public --source=. --remote=origin --push`, { stdio: 'inherit' });
        }

        console.log(chalk.bold.green(`\n🏁 Success! '${repoName}' is now a live Git repository.`));

    } catch (err) {
        console.log(chalk.red("❌ Error in project setup:"), err.message);
    }
}