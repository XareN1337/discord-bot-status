const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkbotstatus')
        .setDescription('Sprawdza status wszystkich monitorowanych botów'),
    
    async execute(interaction) {
        // Get monitored bots from the client (we'll need to pass this data)
        const monitoredBots = interaction.client.monitoredBots;
        
        if (!monitoredBots || monitoredBots.size === 0) {
            return await interaction.reply({
                content: '❌ Brak skonfigurowanych botów do monitorowania.',
                ephemeral: true
            });
        }

        // Create embed with bot status information
        const embed = new EmbedBuilder()
            .setTitle('📊 Status Monitorowanych Botów')
            .setColor(0x0099FF)
            .setTimestamp()
            .setFooter({ text: 'Discord Bot Status Monitor' });

        let description = '';
        let onlineCount = 0;
        let offlineCount = 0;

        // Check current status of each bot
        for (const [botId, botData] of monitoredBots) {
            let status = '🔴 Offline';
            let statusText = 'Offline';
            
            // Try to find the bot in any mutual guild to get current status
            for (const guild of interaction.client.guilds.cache.values()) {
                try {
                    const member = await guild.members.fetch(botId).catch(() => null);
                    if (member && member.presence?.status && member.presence.status !== 'offline') {
                        status = '🟢 Online';
                        statusText = 'Online';
                        onlineCount++;
                        break;
                    }
                } catch (err) {
                    // Continue checking other guilds
                }
            }
            
            if (statusText === 'Offline') {
                offlineCount++;
            }

            const botName = botData.name || `Bot ${botId}`;
            description += `**${botName}**\n`;
            description += `└ ${status} • ID: \`${botId}\`\n\n`;
        }

        embed.setDescription(description);
        embed.addFields(
            { name: '🟢 Online', value: onlineCount.toString(), inline: true },
            { name: '🔴 Offline', value: offlineCount.toString(), inline: true },
            { name: '📊 Łącznie', value: monitoredBots.size.toString(), inline: true }
        );

        await interaction.reply({ embeds: [embed] });
    },
};
