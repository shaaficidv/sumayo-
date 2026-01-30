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

// Function-ka dhisaya ID Card-ka
async function generateIDCard(interaction, data, idCode) {
    const canvas = createCanvas(750, 450);
    const ctx = canvas.getContext('2d');

    // 1. Background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, 750, 450);

    // 2. Server Logo (Geeska sare)
    const guildIcon = interaction.guild.iconURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const logo = await loadImage(guildIcon);
    ctx.drawImage(logo, 630, 20, 100, 100);

    // 3. User Avatar
    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, 40, 50, 150, 150);

    // 4. Qoraalka macluumaadka (Safe String Conversion)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(String(interaction.guild.name).toUpperCase(), 220, 60);

    ctx.font = '24px sans-serif';
    ctx.fillText(`NAME: ${String(data.name)}`, 220, 130);
    ctx.fillText(`AGE: ${String(data.age)}`, 220, 175);
    ctx.fillText(`COUNTRY: ${String(data.country)}`, 220, 220);
    ctx.fillText(`GENDER: ${String(data.gender)}`, 220, 265);

    ctx.fillStyle = '#f1c40f'; // Midab dahabi ah ID-ga
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`PRIVATE ID: ${String(idCode)}`, 220, 330);

    // 5. QR Code
    const qrBuffer = await QRCode.toDataURL(`https://discord.com/users/${interaction.user.id}`);
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 580, 280, 140, 140);

    return canvas.toBuffer();
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.commandName === 'verify_setup') {
        const channel = interaction.options.getChannel('channel');
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Server Verification')
            .setDescription(interaction.options.getString('message'))
            .setColor('Blue')
            .setFooter({ text: 'Guji badanka hoose si aad is-verify ugu sameyso' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_verify').setLabel(interaction.options.getString('button_text')).setStyle(ButtonStyle.Success)
        );

        await channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: '✅ Verification System waa la dhigay.', ephemeral: true });
    }

    if (interaction.customId === 'open_verify') {
        const modal = new ModalBuilder().setCustomId('verify_modal_pro').setTitle('Verification Form');

        const nInput = new TextInputBuilder().setCustomId('v_name').setLabel("Full Name").setStyle(TextInputStyle.Short).setRequired(true);
        const aInput = new TextInputBuilder().setCustomId('v_age').setLabel("Age").setStyle(TextInputStyle.Short).setRequired(true);
        const cInput = new TextInputBuilder().setCustomId('v_country').setLabel("Country").setStyle(TextInputStyle.Short).setRequired(true);
        const gInput = new TextInputBuilder().setCustomId('v_gender').setLabel("Gender (Male/Female)").setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nInput),
            new ActionRowBuilder().addComponents(aInput),
            new ActionRowBuilder().addComponents(cInput),
            new ActionRowBuilder().addComponents(gInput)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'verify_modal_pro') {
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
            const file = new AttachmentBuilder(buffer, { name: 'sumayo-id.png' });

            // DM User
            await interaction.user.send({ 
                content: `✅ **Verification Successful!**\nWaa kan ID Card-kaaga rasmiga ah.`, 
                files: [file] 
            }).catch(() => console.log("User DM is closed"));

            // Admin Logs
            const logCh = interaction.guild.channels.cache.find(c => c.name === 'verify-logs') || 
                          await interaction.guild.channels.create({ name: 'verify-logs', permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }] });
            
            await logCh.send({ content: `Verified: ${interaction.user.tag}\nID: ${idCode}`, files: [file] });

            await interaction.editReply('✅ Verification dhameystiran! Fiiri DM-kaaga.');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Cilad ayaa dhacday intii ID-ga la diyaarinayay.');
        }
    }
});

client.login(process.env.TOKEN);
