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
                { name: 'channel', type: 7, description: 'Channel-ka la dhigayo', required: true },
                { name: 'message', type: 3, description: 'Fariinta Embed-ka', required: true },
                { name: 'button_text', type: 3, description: 'Qoraalka Badanka', required: true }
            ]
        }
    ]);
});

// Function-ka dhisaya ID Card-ka (Safe Strings)
async function generateIDCard(interaction, data, idCode) {
    const canvas = createCanvas(750, 450);
    const ctx = canvas.getContext('2d');

    // Hubinta in xog kasta ay tahay String si looga baxsado ciladda Rust-ka
    const name = String(data.name || "N/A");
    const age = String(data.age || "N/A");
    const country = String(data.country || "N/A");
    const gender = String(data.gender || "N/A");
    const id = String(idCode || "000000");

    // 1. Background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, 750, 450);

    // 2. Server Logo
    try {
        const guildIcon = interaction.guild.iconURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const logo = await loadImage(guildIcon);
        ctx.drawImage(logo, 630, 20, 100, 100);
    } catch (e) { console.log("Logo load error"); }

    // 3. User Avatar
    try {
        const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png' }));
        ctx.drawImage(avatar, 40, 50, 150, 150);
    } catch (e) { console.log("Avatar load error"); }

    // 4. Info Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(String(interaction.guild.name).toUpperCase(), 220, 60);

    ctx.font = '24px sans-serif';
    ctx.fillText(`NAME: ${name}`, 220, 130);
    ctx.fillText(`AGE: ${age}`, 220, 175);
    ctx.fillText(`COUNTRY: ${country}`, 220, 220);
    ctx.fillText(`GENDER: ${gender}`, 220, 265);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`PRIVATE ID: ${id}`, 220, 330);

    // 5. QR Code
    try {
        const qrBuffer = await QRCode.toDataURL(`https://discord.com/users/${interaction.user.id}`);
        const qrImage = await loadImage(qrBuffer);
        ctx.drawImage(qrImage, 580, 280, 140, 140);
    } catch (e) { console.log("QR error"); }

    return canvas.toBuffer();
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.commandName === 'verify_setup') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const channel = interaction.options.getChannel('channel');
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Server Verification')
            .setDescription(interaction.options.getString('message'))
            .setColor('Blue');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_verify').setLabel(interaction.options.getString('button_text')).setStyle(ButtonStyle.Success)
        );

        await channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: '✅ Setup Done!', ephemeral: true });
    }

    if (interaction.customId === 'open_verify') {
        const modal = new ModalBuilder().setCustomId('v_modal').setTitle('Verify Form');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_name').setLabel("Full Name").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_age').setLabel("Age").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_country').setLabel("Country").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_gender').setLabel("Gender (Male/Female)").setStyle(TextInputStyle.Short).setRequired(true))
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'v_modal') {
        await interaction.deferReply({ ephemeral: true });

        const data = {
            name: interaction.fields.getTextInputValue('v_name'),
            age: interaction.fields.getTextInputValue('v_age'),
            country: interaction.fields.getTextInputValue('v_country'),
            gender: interaction.fields.getTextInputValue('v_gender')
        };
        const idCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        try {
            const buffer = await generateIDCard(interaction, data, idCode);
            const file = new AttachmentBuilder(buffer, { name: 'id-card.png' });

            await interaction.user.send({ content: `✅ **Verified!** ID: \`${idCode}\``, files: [file] }).catch(() => {});
            
            const logCh = interaction.guild.channels.cache.find(c => c.name === 'verify-logs') || 
                          await interaction.guild.channels.create({ name: 'verify-logs', permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }] });
            
            await logCh.send({ content: `User: ${interaction.user.tag}\nID: ${idCode}`, files: [file] });

            await interaction.editReply('✅ Verification dhameystiran! Fiiri DM-kaaga.');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Cilad ayaa dhacday, fadlan mar kale isku day.');
        }
    }
});

client.login(process.env.TOKEN);
