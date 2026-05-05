#!/usr/bin/env node

// 1. IMPORTS
import { Command } from 'commander';
import { runSystemCheck } from './src/setup.js';
import { createNewRepo } from './src/project.js';
import { smartPush } from './src/pusher.js';
import { generateDeepReadme } from './src/readmeGen.js';
import { publishToMedium } from './src/publisher.js';
import chalk from 'chalk';
import 'dotenv/config'; 

const program = new Command();

// 2. GLOBAL CONFIGURATION
program
  .name('git-infra')
  .description('Engineer-grade automation for GitHub workflows')
  .version('1.0.1');

// 3. COMMAND DEFINITIONS

// --- SYSTEM SETUP ---
program
  .command('setup')
  .description('Run the system check for Git and GitHub CLI')
  .action(async () => {
    await runSystemCheck();
    console.log(chalk.green("✅ System check complete."));
  });

// --- REPO MANAGEMENT ---
program
  .command('new <name>')
  .description('Create or link a project with GitHub')
  .option('-p, --private', 'Set repository to private') 
  .action(async (name, options) => {
    await runSystemCheck(); 
    const visibility = options.private ? 'private' : 'public';
    await createNewRepo(name, visibility);
  });

program
  .command('push [message...]')
  .description('Smart push with interactive branch selection')
  .action(async (messageArray) => {
    await runSystemCheck();
    const msg = messageArray.length > 0 ? messageArray.join(" ") : "Auto-update";
    await smartPush(msg); 
  });

// --- CONTENT AUTOMATION ---
program
  .command('doc')
  .description('AI Agent generates/overwrites a Medium-style README.md')
  .action(async () => {
    if (!process.env.GEMINI_API_KEY) {
        return console.log(chalk.red("❌ Error: GEMINI_API_KEY not found in .env"));
    }
    await generateDeepReadme();
  });

program
  .command('publish')
  .description('Regenerate README.md and copy the content to clipboard for Medium')
  .action(async () => {
    try {
        // 1. Check for AI Key
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing from your .env file.");
        }

        // 2. Force the rewrite of README.md using AI
        console.log(chalk.yellow("🤖 AI is analyzing code and rewriting README.md..."));
        await generateDeepReadme();

        // 3. Copy to clipboard
        await publishToMedium('README.md');

        console.log(chalk.bold.green("\n🚀 Ready for Medium! The latest README is in your clipboard."));
    } catch (err) {
        console.log(chalk.red(`❌ Failed to prepare content: ${err.message}`));
    }
  });

// --- UTILITIES ---
program
  .command('test-ai')
  .description('Verify Google AI Studio connection')
  .action(async () => {
    console.log(chalk.blue("📡 Pinging Google AI Studio..."));
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("No Key");
        await generateDeepReadme();
        console.log(chalk.green("✅ Connection successful!"));
    } catch (e) {
        console.log(chalk.red("❌ Connection failed. Check your GEMINI_API_KEY in .env."));
    }
  });

// 4. THE START BUTTON
// This handles cases where no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}