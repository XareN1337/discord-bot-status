# Discord Bot Status Monitor

A Discord bot that monitors the status of multiple bots. When any monitored bot goes offline, this bot automatically sends a notification to the administrator.

## Features

- **Multi-bot monitoring**: Monitor multiple Discord bots simultaneously
- **Real-time notifications**: Sends notifications to the admin when monitored bots go offline/online
- **Slash commands**: Use `/checkbotstatus` to view current status of all monitored bots
- **Automatic monitoring**: Checks status every minute and detects changes in real-time
- **Backward compatibility**: Supports both new multi-bot format and legacy single-bot configuration
- **Rich status display**: Beautiful embed showing detailed status information

## Requirements

- Node.js (version 16.9.0 or newer)
- Discord account with bot creation permissions
- Discord Bot Token
- IDs of the bots to monitor (one or more)
- Client ID of your monitoring bot
- ID of the admin who will receive notifications

## Installation

### Standard Installation

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

# IDs of bots to monitor (comma-separated list)
MONITORED_BOTS=123456789012345678,987654321098765432,555666777888999000

# Legacy support: ID of single bot to monitor (will be used if MONITORED_BOTS is not set)
MONITORED_BOT_ID=ID_OF_BOT_TO_MONITOR

# ID of the admin to notify
ADMIN_ID=YOUR_ADMIN_USER_ID
```

4. Deploy slash commands:
```
npm run deploy-commands
```

### Docker Installation

#### Option 1: Using Docker Compose (Recommended)

1. Download the docker-compose.yml file:
```bash
curl -O https://raw.githubusercontent.com/XareN1337/discord-bot-status/main/docker-compose.yml
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your bot credentials
```

3. Start the bot:
```bash
docker-compose up -d
```

4. Deploy slash commands (one-time setup):
```bash
docker-compose exec discord-bot-monitor npm run deploy-commands
```

#### Option 2: Using Docker directly

Run the bot directly using the pre-built image from Docker Hub:

```bash
docker run -d --name discord-bot-monitor \
  -e BOT_TOKEN=YOUR_BOT_TOKEN_HERE \
  -e CLIENT_ID=YOUR_BOT_CLIENT_ID \
  -e MONITORED_BOTS=123456789012345678,987654321098765432 \
  -e ADMIN_ID=YOUR_ADMIN_USER_ID \
  xaren1337/discord-bot-status:2.0.0
```

For legacy single-bot monitoring:
```bash
docker run -d --name discord-bot-monitor \
  -e BOT_TOKEN=YOUR_BOT_TOKEN_HERE \
  -e CLIENT_ID=YOUR_BOT_CLIENT_ID \
  -e MONITORED_BOT_ID=ID_OF_BOT_TO_MONITOR \
  -e ADMIN_ID=YOUR_ADMIN_USER_ID \
  xaren1337/discord-bot-status:2.0.0
```

#### Option 2: Building the image yourself

1. Clone this repository:
```
git clone https://github.com/XareN1337/discord-bot-status.git
cd discord-bot-status
```

2. Build the Docker image:
```
docker build -t discord-bot-status .
```

3. Run the bot with Docker:
```bash
docker run -d --name discord-bot-monitor \
  -e BOT_TOKEN=YOUR_BOT_TOKEN_HERE \
  -e CLIENT_ID=YOUR_BOT_CLIENT_ID \
  -e MONITORED_BOTS=123456789012345678,987654321098765432 \
  -e ADMIN_ID=YOUR_ADMIN_USER_ID \
  discord-bot-status:2.0.0
```

4. Deploy slash commands:
```bash
docker exec discord-bot-monitor npm run deploy-commands
```

4. To check bot logs:
```
docker logs -f discord-bot-monitor
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

1. Deploy slash commands (required for first-time setup):
```
npm run deploy-commands
```

2. Start the bot:
```
npm start
```
or
```
node index.js
```

The bot will output an invite URL in the console when starting up, which you can use to add it to your server.

## Available Commands

### `/checkbotstatus`
Displays the current status of all monitored bots in a embed format.

**Features:**
- Shows online/offline status for each bot
- Displays bot names and IDs
- Provides summary statistics (total online/offline/total bots)
- Real-time status checking
- Only visible to the command user (ephemeral response)

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

## Configuration Examples

### Multi-bot monitoring (recommended)
```env
MONITORED_BOTS=123456789012345678,987654321098765432,555666777888999000
```

### Single bot monitoring (legacy)
```env
MONITORED_BOT_ID=123456789012345678
```

### Mixed configuration
If both `MONITORED_BOTS` and `MONITORED_BOT_ID` are set, `MONITORED_BOTS` takes precedence.

## Notes

- Both the monitoring bot and the monitored bots must be on the same server
- If a monitored bot is removed from the server, the monitoring bot won't be able to track its status
- The bot automatically generates an invite link on startup
- The bot will send private messages to the admin when monitored bots' status changes
- Slash commands are deployed globally and may take up to 1 hour to appear in all servers
- Use `/checkbotstatus` to get real-time status of all monitored bots