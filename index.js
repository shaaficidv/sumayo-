const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const QRCode = require('qrcode');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.once('ready', () => {
    console.log(`✅ Sumayo- Pro is Online!`);
    client.application.commands.set([
        { 
            name: 'verify_setup', 
            description: 'Dhig nidaamka Verification-ka', 
            options: [
                { name: 'channel', type: 7, description: 'Channel-ka', required: true },
                { name: 'message', type: 3, description: 'Fariinta Embed-ka', required: true },
                { name: 'button_text', type: 3, description: 'Qoraalka Badanka', required: true }
            ]
        }
    ]);
});

async function generateIDCard(interaction, data, idCode) {
    const canvas = createCanvas(700, 400);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 700, 400);

    const guildIcon = interaction.guild.iconURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const logo = await loadImage(guildIcon);
    ctx.drawImage(logo, 570, 20, 100, 100);

    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, 40, 80, 140, 140);

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`MAGACA: ${data.name}`, 210, 130);
    ctx.fillText(`ID: ${idCode}`, 210, 330);

    const qrBuffer = await QRCode.toDataURL(`https://discord.com/users/${interaction.user.id}`);
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 530, 250, 130, 130);

    return canvas.toBuffer();
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.commandName === 'verify_setup') {
        const channel = interaction.options.getChannel('channel');
        const embed = new EmbedBuilder().setTitle('Verify').setDescription(interaction.options.getString('message')).setColor('Blue');
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('start_v').setLabel(interaction.options.getString('button_text')).setStyle(ButtonStyle.Success));
        await channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: '✅ Setup Done', ephemeral: true });
    }

    if (interaction.customId === 'start_v') {
        const modal = new ModalBuilder().setCustomId('v_form').setTitle('Verify');
        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Magacaaga').setStyle(TextInputStyle.Short).setRequired(true)));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'v_form') {
        await interaction.deferReply({ ephemeral: true });
        const idCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const buffer = await generateIDCard(interaction, { name: interaction.fields.getTextInputValue('name') }, idCode);
        const file = new AttachmentBuilder(buffer, { name: 'id.png' });
        await interaction.user.send({ content: `✅ Verified ID: ${idCode}`, files: [file] }).catch(() => {});
        await interaction.editReply('✅ Check your DM!');
    }
});

client.login(process.env.TOKEN);

