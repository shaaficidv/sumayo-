const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const Canvas = require('canvas');
const QRCode = require('qrcode');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.once('ready', () => {
    console.log(`✅ Sumayo- Pro is Online!`);
    client.application.commands.set([
        { 
            name: 'verify_setup', 
            description: 'Dhig nidaamka Verification-ka', 
            options: [
                { name: 'channel', type: 7, description: 'Channel-ka la dhigayo', required: true },
                { name: 'message', type: 3, description: 'Fariinta Embed-ka', required: true },
                { name: 'button_text', type: 3, description: 'Qoraalka Badanka', required: true }
            ]
        },
        { name: 'help', description: 'Sida loo isticmaalo bot-ka' }
    ]);
});

// --- ID Card Generator ---
async function generateIDCard(interaction, data, idCode) {
    const canvas = Canvas.createCanvas(700, 400);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Server Logo (O cml)
    const guildIcon = interaction.guild.iconURL({ extension: 'png', size: 1024 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const logo = await Canvas.loadImage(guildIcon);
    ctx.save();
    ctx.beginPath();
    ctx.arc(620, 70, 50, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, 570, 20, 100, 100);
    ctx.restore();

    // User Avatar
    const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, 40, 80, 140, 140);

    // Text Info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(interaction.guild.name.toUpperCase(), 210, 60);

    ctx.font = '22px sans-serif';
    ctx.fillText(`MAGACA: ${data.name}`, 210, 130);
    ctx.fillText(`DA'DA: ${data.age}`, 210, 175);
    ctx.fillText(`WADANKA: ${data.country}`, 210, 220);
    ctx.fillText(`JINSIGA: ${data.gender}`, 210, 265);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`ID: ${idCode}`, 210, 330);

    // QR Code
    const qrBuffer = await QRCode.toDataURL(`https://discord.com/users/${interaction.user.id}`);
    const qrImage = await Canvas.loadImage(qrBuffer);
    ctx.drawImage(qrImage, 530, 250, 130, 130);

    return canvas.toBuffer();
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.commandName === 'verify_setup') {
        const channel = interaction.options.getChannel('channel');
        const embed = new EmbedBuilder()
            .setTitle('Verification System 🛡️')
            .setDescription(interaction.options.getString('message'))
            .setColor('Blue');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('start_verify').setLabel(interaction.options.getString('button_text')).setStyle(ButtonStyle.Success)
        );

        await channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: '✅ Verification System waa la dhigay.', ephemeral: true });
    }

    if (interaction.customId === 'start_verify') {
        const modal = new ModalBuilder().setCustomId('verify_form').setTitle('Verification Form');
        const fields = [
            { id: 'name', label: 'Magacaaga', style: TextInputStyle.Short },
            { id: 'age', label: 'Da\'daada', style: TextInputStyle.Short },
            { id: 'country', label: 'Wadankaaga', style: TextInputStyle.Short },
            { id: 'gender', label: 'Male / Female', style: TextInputStyle.Short }
        ].map(f => new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(true)));

        modal.addComponents(...fields);
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'verify_form') {
        await interaction.deferReply({ ephemeral: true });
        
        const data = {
            name: interaction.fields.getTextInputValue('name'),
            age: interaction.fields.getTextInputValue('age'),
            country: interaction.fields.getTextInputValue('country'),
            gender: interaction.fields.getTextInputValue('gender')
        };
        const idCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const buffer = await generateIDCard(interaction, data, idCode);
        const file = new AttachmentBuilder(buffer, { name: 'id-card.png' });

        // DM User
        try {
            await interaction.user.send({ content: `✅ **Verify Successful!**\nYour Private ID: \`${idCode}\``, files: [file] });
        } catch (e) { console.log("User DM is closed."); }

        // Log to Admin Channel
        const logChName = `verify-logs`;
        let logCh = interaction.guild.channels.cache.find(c => c.name === logChName);
        if (!logCh) {
            logCh = await interaction.guild.channels.create({
                name: logChName,
                permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }]
            });
        }
        await logCh.send({ content: `Verified: ${interaction.user.tag}\nID: ${idCode}`, files: [file] });

        await interaction.editReply({ content: '✅ Macluumaadkaaga waa la gudbiyay, fiiri DM-kaaga.' });
    }
});

client.login(process.env.TOKEN);
