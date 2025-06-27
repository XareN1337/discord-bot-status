const { Client, GatewayIntentBits, Partials, Collection, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.User]
});

// Initialize commands collection
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Configuration from environment variables
const adminId = process.env.ADMIN_ID;
const clientId = process.env.CLIENT_ID;

// Parse monitored bots from environment variables
function parseMonitoredBots() {
    const monitoredBots = new Map();

    // Check for new format (comma-separated list)
    if (process.env.MONITORED_BOTS) {
        const botIds = process.env.MONITORED_BOTS.split(',').map(id => id.trim()).filter(id => id);
        botIds.forEach(botId => {
            monitoredBots.set(botId, {
                name: null,
                wasOnline: false,
                notificationSent: false
            });
        });
    }
    // Fallback to legacy format for backward compatibility
    else if (process.env.MONITORED_BOT_ID) {
        monitoredBots.set(process.env.MONITORED_BOT_ID, {
            name: null,
            wasOnline: false,
            notificationSent: false
        });
    }

    return monitoredBots;
}

// Bot status tracking - Map<botId, {name, wasOnline, notificationSent}>
const monitoredBots = parseMonitoredBots();

function generateInviteUrl() {
    if (!clientId) {
        console.warn('CLIENT_ID not set in .env file. Cannot generate invite URL.');
        return null;
    }
    
    const permissions = '274878286912'; // Basic permissions (Read Messages, Send Messages)
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
    return url;
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Monitoring ${monitoredBots.size} bot(s):`);
    for (const [botId] of monitoredBots) {
        console.log(`- Bot ID: ${botId}`);
    }

    const inviteUrl = generateInviteUrl();
    if (inviteUrl) {
        console.log('\n=== BOT INVITE URL ===');
        console.log(inviteUrl);
        console.log('======================\n');
    }

    checkBotPresence();

    setInterval(checkBotPresence, 60000);
});

async function checkBotPresence() {
    console.log('Checking bot presence...');

    try {
        for (const [botId, botData] of monitoredBots) {
            let botFound = false;
            let botIsOnline = false;

            for (const guild of client.guilds.cache.values()) {
                try {
                    const member = await guild.members.fetch(botId).catch(() => null);
                    if (member) {
                        botFound = true;
                        botData.name = member.user.username || member.user.tag || `Bot ${botId}`;
                        console.log(`Found bot "${botData.name}" (${botId}) in guild: ${guild.name}`);
                        console.log(`Status: ${member.presence?.status || 'offline'}`);

                        if (member.presence?.status && member.presence.status !== 'offline') {
                            botIsOnline = true;

                            // Send online notification if bot was previously offline
                            if (!botData.wasOnline) {
                                await sendOnlineNotification(botId, botData.name);
                            }

                            botData.wasOnline = true;
                            botData.notificationSent = false;
                        }
                        break; // Bot found, no need to check other guilds
                    }
                } catch (err) {
                    console.error(`Error checking bot ${botId} in guild ${guild.name}:`, err);
                }
            }

            // Handle offline bot
            if (!botIsOnline) {
                if (!botData.notificationSent) {
                    await sendOfflineNotification(botId, botData.name);
                    botData.notificationSent = true;
                }
                botData.wasOnline = false;
            }

            if (!botFound) {
                console.log(`Bot ${botId} not found in any mutual guilds. Make sure both bots share at least one server.`);
            }
        }
    } catch (error) {
        console.error('Error checking bot presence:', error);
    }
}

async function sendAdminNotification(message) {
    try {
        console.log(`Attempting to send notification to administrator (ID: ${adminId})`);
        const admin = await client.users.fetch(adminId);
        console.log(`Found administrator user: ${admin.tag || 'Unknown'}`);
        
        await admin.send({
            content: message
        });
        console.log('Notification sent to admin successfully');
    } catch (error) {
        console.error('Failed to send notification to admin:', error);
        console.error('Admin ID used:', adminId);
    }
}

async function sendOfflineNotification(botId, botName) {
    const botNameDisplay = botName ? `"${botName}"` : `(ID: ${botId})`;
    const message = `⚠️ **ALERT:** Monitored bot ${botNameDisplay} is now offline! Please check the bot status.`;
    await sendAdminNotification(message);
}

async function sendOnlineNotification(botId, botName) {
    const botNameDisplay = botName ? `"${botName}"` : `(ID: ${botId})`;
    const message = `✅ **INFO:** Monitored bot ${botNameDisplay} is back online!`;
    await sendAdminNotification(message);
}

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const botId = newPresence.user.id;

    // Check if this is one of our monitored bots
    if (monitoredBots.has(botId)) {
        const botData = monitoredBots.get(botId);
        const botName = botData.name || newPresence.user.username || newPresence.user.tag;

        console.log(`Monitored bot "${botName}" (${botId}) presence changed: ${oldPresence?.status || 'offline'} -> ${newPresence.status || 'offline'}`);

        // Bot went offline
        if (oldPresence?.status && oldPresence.status !== 'offline' &&
            (!newPresence.status || newPresence.status === 'offline')) {

            if (!botData.notificationSent) {
                await sendOfflineNotification(botId, botName);
                botData.notificationSent = true;
            }
            botData.wasOnline = false;
        }
        // Bot came online
        else if ((!oldPresence?.status || oldPresence.status === 'offline') &&
                 newPresence.status && newPresence.status !== 'offline') {

            botData.wasOnline = true;
            botData.notificationSent = false;
            console.log(`Monitored bot "${botName}" is back online`);
            await sendOnlineNotification(botId, botName);
        }

        // Update bot name if we got it
        if (botName && !botData.name) {
            botData.name = botName;
        }
    }
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        // Pass monitored bots data to the command
        interaction.client.monitoredBots = monitoredBots;
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const errorMessage = 'There was an error while executing this command!';

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});

client.login(process.env.BOT_TOKEN).catch(error => {
    console.error('Failed to login to Discord:', error);
});