import { execSync } from 'child_process';
import chalk from 'chalk';
import readline from 'readline-sync';

export async function smartPush(commitMsg) {
    try {
        // 1. Get the current branch name
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        console.log(chalk.blue(`📍 Currently on branch: ${currentBranch}`));

        // 2. Ask the user for the target branch
        let targetBranch = readline.question(
            chalk.yellow(`Where do you want to push? (Press Enter for '${currentBranch}', or type 'main' or a new branch name): `)
        ).trim();

        // Default to current branch if they just press Enter
        if (!targetBranch) targetBranch = currentBranch;

        // 3. Handle Branch Switching/Creation
        const branchExists = execSync(`git branch --list ${targetBranch}`).toString().trim();

        if (!branchExists) {
            const confirmCreate = readline.keyInYN(
                chalk.cyan(`⚠️  Branch '${targetBranch}' does not exist. Create it now? `)
            );

            if (confirmCreate) {
                execSync(`git checkout -b ${targetBranch}`);
                console.log(chalk.green(`✅ Created and switched to new branch: ${targetBranch}`));
            } else {
                console.log(chalk.red("❌ Operation cancelled."));
                return;
            }
        } else if (targetBranch !== currentBranch) {
            execSync(`git checkout ${targetBranch}`);
            console.log(chalk.blue(`🔄 Switched to existing branch: ${targetBranch}`));
        }

        // 4. THE SAFETY GATE: Check if there are actually changes to commit
        // --porcelain gives a stable machine-readable output. Empty string = no changes.
        const hasChanges = execSync('git status --porcelain').toString().trim();

        if (!hasChanges) {
            console.log(chalk.yellow("\nℹ️  No changes detected. Your working tree is clean. Skipping push."));
            return;
        }

        // 5. Perform the Standard Push
        console.log(chalk.blue("📤 Pushing changes..."));
        
        // Stage all changes
        execSync('git add .');
        
        // Commit with the user's message
        execSync(`git commit -m "${commitMsg}"`);
        
        // Push to origin and set upstream (-u)
        // { stdio: 'inherit' } allows you to see the real-time git progress bar
        execSync(`git push -u origin ${targetBranch}`, { stdio: 'inherit' });

        console.log(chalk.bold.green(`\n🚀 Successfully pushed to ${targetBranch}!`));

    } catch (err) {
        // This will now only trigger for real errors (like network issues or auth problems)
        console.log(chalk.red("\n❌ System Error:"), err.message);
    }
}