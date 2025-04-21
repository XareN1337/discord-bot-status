const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.User]
});

// Configuration from environment variables
const monitoredBotId = process.env.MONITORED_BOT_ID;
const adminId = process.env.ADMIN_ID;
const clientId = process.env.CLIENT_ID;

// Bot status tracking
let botWasOnline = false;
let notificationSent = false;
let monitoredBotName = null;

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
    console.log(`Monitoring bot with ID: ${monitoredBotId}`);
    
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
    let botFound = false;
    let botIsOnline = false;
    
    try {
        for (const guild of client.guilds.cache.values()) {
            try {
                const member = await guild.members.fetch(monitoredBotId).catch(() => null);
                if (member) {
                    botFound = true;
                    monitoredBotName = member.user.username || member.user.tag || `Bot ${monitoredBotId}`;
                    console.log(`Found monitored bot in guild: ${guild.name}`);
                    console.log(`Bot name: ${monitoredBotName}`);
                    console.log(`Status: ${member.presence?.status || 'offline'}`);
                    
                    if (member.presence?.status && member.presence.status !== 'offline') {
                        botIsOnline = true;
                        
                        if (!botWasOnline) {
                            await sendOnlineNotification();
                        }
                        
                        botWasOnline = true;
                        notificationSent = false;
                    }
                }
            } catch (err) {
                console.error(`Error checking bot in guild ${guild.name}:`, err);
            }
        }
        
        if (!botIsOnline) {
            if (!notificationSent) {
                await sendOfflineNotification();
                notificationSent = true;
            }
            botWasOnline = false;
        }
        
        if (!botFound) {
            console.log('Monitored bot not found in any mutual guilds. Make sure both bots share at least one server.');
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

async function sendOfflineNotification() {
    const botNameDisplay = monitoredBotName ? `"${monitoredBotName}"` : `(ID: ${monitoredBotId})`;
    const message = `⚠️ **ALERT:** Monitored bot ${botNameDisplay} is now offline! Please check the bot status.`;
    await sendAdminNotification(message);
}

async function sendOnlineNotification() {
    const botNameDisplay = monitoredBotName ? `"${monitoredBotName}"` : `(ID: ${monitoredBotId})`;
    const message = `✅ **INFO:** Monitored bot ${botNameDisplay} is back online!`;
    await sendAdminNotification(message);
}

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (newPresence.user.id === monitoredBotId) {
        console.log(`Monitored bot presence changed: ${oldPresence?.status || 'offline'} -> ${newPresence.status || 'offline'}`);
        
        if (oldPresence?.status && oldPresence.status !== 'offline' && 
            (!newPresence.status || newPresence.status === 'offline')) {
            
            if (!notificationSent) {
                await sendOfflineNotification();
                notificationSent = true;
            }
            botWasOnline = false;
        } 
        else if ((!oldPresence?.status || oldPresence.status === 'offline') && 
                 newPresence.status && newPresence.status !== 'offline') {
            
            botWasOnline = true;
            notificationSent = false;
            console.log('Monitored bot is back online');
            await sendOnlineNotification();
        }
    }
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});

client.login(process.env.BOT_TOKEN).catch(error => {
    console.error('Failed to login to Discord:', error);
});