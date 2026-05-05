#!/usr/bin/env node
import { runSystemCheck } from './src/setup.js';
import { createNewRepo } from './src/project.js';
import { smartPush } from './src/pusher.js';
import chalk from 'chalk';

const [, , command, ...args] = process.argv;

async function init() {
    await runSystemCheck();

    switch (command) {
        case 'setup':
            console.log(chalk.green("✅ System check complete."));
            break;

        case 'new':
            if (!args[0]) return console.log(chalk.red("Provide a repo name!"));
            await createNewRepo(args[0]);
            break;

        case 'push':
            const msg = args.join(" ") || "Auto-update";
            await smartPush(msg, 30); // 30 min delay
            break;

        default:
            console.log(chalk.white(`
Usage:
    git-infra setup        - Run the system check
    git-infra new [name]   - Create a new GitHub repo
    git-infra push [msg]   - Push to branch and merge in 30 mins
            `));
    }
}

init();