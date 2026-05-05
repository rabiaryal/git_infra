import clipboardy from 'clipboardy';
import chalk from 'chalk';
import fs from 'fs-extra';

export async function publishToMedium(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(chalk.red(`❌ File not found: ${filePath}`));
            return;
        }

        const content = await fs.readFile(filePath, 'utf8');
        
        // Copy the Markdown content to your Mac's clipboard
        await clipboardy.write(content);
        
        console.log(chalk.green("📋 Content copied to clipboard!"));
        console.log(chalk.cyan("✨ You can now paste (Cmd+V) directly into Medium."));
        
    } catch (err) {
        console.log(chalk.red("❌ Error copying to clipboard:"), err.message);
    }
}