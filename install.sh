#!/bin/bash

echo "🚀 Starting GPT-Infra Installation..."

# 1. Install local dependencies
echo "📦 Installing NPM packages..."
npm install

# 2. Make the main file executable (Crucial for Mac/Linux)
echo "🔑 Setting permissions..."
chmod +x main.js

# 3. Link the command globally
echo "🔗 Linking command to system..."
npm link

# 4. Run the initial setup/check
echo "🛠️ Running initial system check..."
git-infra setup

echo "✅ Installation Complete! You can now use 'git-infra' from anywhere."