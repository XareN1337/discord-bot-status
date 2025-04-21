# Discord Bot Status Monitor

A Discord bot that monitors the status of another bot. When the monitored bot goes offline, this bot automatically sends a notification to the administrator.

## Features

- Monitors another Discord bot's online/offline status
- Sends notifications to the admin when the monitored bot goes offline
- Sends notifications when the bot comes back online
- Automatically checks status every minute
- Detects status changes in real-time
- Includes the bot's name in notifications for better identification

## Requirements

- Node.js (version 16.9.0 or newer)
- Discord account with bot creation permissions
- Discord Bot Token
- ID of the bot to monitor
- Client ID of your monitoring bot
- ID of the admin who will receive notifications

## Installation

1. Clone this repository:
```
git clone https://github.com/XareN1337/discord-bot-status.git
cd discord-bot-status
```

2. Install dependencies:
```
npm install
```

3. Configure the `.env` file:
```
# Bot token
BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Bot Client ID
CLIENT_ID=YOUR_BOT_CLIENT_ID

# ID of the bot to monitor
MONITORED_BOT_ID=ID_OF_BOT_TO_MONITOR

# ID of the admin to notify
ADMIN_ID=YOUR_ADMIN_USER_ID
```

## How to get the required data

### Bot Token and Client ID
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" tab and click "Add Bot"
4. Click "Reset Token" and copy the token
5. The Client ID can be found on the "General Information" tab

### Bot and Admin IDs
1. Enable Developer Mode in Discord settings (Settings -> Advanced -> Developer Mode)
2. Right-click on the bot/user you want to monitor
3. Select "Copy ID"

## Required Permissions

Your bot needs the following privileged intents:
- Presence Intent - to monitor other bots' status
- Server Members Intent - to access the server member list
- Message Content Intent - to send messages

Enable these intents in the [Discord Developer Portal](https://discord.com/developers/applications) under the Bot tab.

## Running the Bot

Run the bot using the following command:
```
node index.js
```

The bot will output an invite URL in the console when starting up, which you can use to add it to your server.

## Adding the Bot to a Server

1. Use the invite URL generated in the console when the bot starts
2. Alternatively, go to the [Discord Developer Portal](https://discord.com/developers/applications)
3. Navigate to the "OAuth2" -> "URL Generator" tab
4. Select the scopes: `bot` and `applications.commands`
5. Select bot permissions: 
   - Read Messages/View Channels
   - Send Messages
6. Copy the generated URL and open it in a browser
7. Select the server where you want to add the bot and confirm

## Notes

- Both the monitoring bot and the monitored bot must be on the same server
- If the monitored bot is removed from the server, the monitoring bot won't be able to track its status
- The bot automatically generates an invite link on startup
- The bot will send a private message to the admin when the monitored bot's status changes