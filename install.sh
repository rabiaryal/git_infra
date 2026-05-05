#!/bin/bash

echo "🚀 Starting GPT-Infra Installation..."

# 1. Handle Environment Variables (.env)
if [ ! -f .env ]; then
    echo "📄 .env file not found. Creating from .env.example..."
    cp .env.example .env
    
    # Optional: Prompt user to enter their API Key immediately
    read -p "🔑 Enter your Gemini API Key (or press Enter to skip): " api_key
    if [ ! -z "$api_key" ]; then
        # Use sed to replace the placeholder with the actual key in the .env file
        # Note: on Mac, sed -i requires an empty string ""
        sed -i "" "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$api_key/" .env
        echo "✅ API Key saved to .env"
    fi
else
    echo "✅ .env file already exists. Skipping creation."
fi

# 2. Install local dependencies
echo "📦 Installing NPM packages..."
npm install

# 3. Make the main file executable
echo "🔑 Setting permissions..."
chmod +x main.js

# 4. Link the command globally
echo "🔗 Linking command to system..."
# Use sudo if your Mac permissions require it, usually not needed for npm link
npm link

# 5. Run the initial setup/check
echo "🛠️ Running initial system check..."
git-infra setup

echo "✅ Installation Complete! You can now use 'git-infra' from anywhere."