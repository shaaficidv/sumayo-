const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

client.once('ready', () => {
    console.log(`✅ Sumayo- Is Ready!`);
    client.application.commands.set([
        { name: 'tick', description: 'Setup Ticket System', options: [
            { name: 'channel', type: 7, description: 'Channel-ka', required: true },
            { name: 'msg', type: 3, description: 'Embed Message', required: true },
            { name: 'btn', type: 3, description: 'Button Text', required: true },
            { name: 'p_msg', type: 3, description: 'Private Message', required: true }
        ]},
        { name: 'help', description: 'Help Menu' },
        { name: 'add', description: 'Add Bot' }
    ]);
});

// DM Response
client.on('messageCreate', (message) => {
    if (!message.guild && !message.author.bot) {
        message.reply("Fadlan isticmaal `/` si aan kugu shaqeeyo? 🤖");
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.commandName === 'tick') {
        const channel = interaction.options.getChannel('channel');
        const embed = new EmbedBuilder().setTitle('Support').setDescription(interaction.options.getString('msg')).setColor('Blue');
        const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('open_t').setLabel(interaction.options.getString('btn')).setStyle(ButtonStyle.Primary));
        await channel.send({ embeds: [embed], components: [btn] });
        await interaction.reply({ content: '✅ Waa la dhigay!', ephemeral: true });
    }

    if (interaction.customId === 'open_t') {
        const ch = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });
        await ch.send(`@Administrator @Modeletor @Prime_master \n${interaction.user}, Fadlan inta ku qor cawashadaada.`);
        await interaction.reply({ content: `✅ Ticket-kaaga: ${ch}`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);
