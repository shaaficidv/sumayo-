const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const QRCode = require('qrcode');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// --- ID CARD GENERATOR FUNCTION ---
async function createIDCard(interaction, name, age, country, gender, randomID) {
    const canvas = Canvas.createCanvas(700, 400);
    const ctx = canvas.getContext('2d');

    // 1. Background (Midabka ka dambeeya)
    ctx.fillStyle = '#1e1e2e'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Server Logo (Logada Serverka)
    const guildIconURL = interaction.guild.iconURL({ extension: 'png', size: 1024 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const serverLogo = await Canvas.loadImage(guildIconURL);
    
    // Sawirka Logada oo goobada ah (O cml)
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 60, 40, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(serverLogo, 560, 20, 80, 80);
    ctx.restore();

    // 3. User Avatar (Sawirka qofka)
    const avatarURL = interaction.user.displayAvatarURL({ extension: 'png', size: 1024 });
    const userAvatar = await Canvas.loadImage(avatarURL);
    ctx.drawImage(userAvatar, 50, 80, 120, 120);

    // 4. Qoraalka Macluumaadka
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(interaction.guild.name.toUpperCase(), 200, 65); // Magaca Serverka

    ctx.font = '22px sans-serif';
    ctx.fillText(`MAGACA: ${name}`, 200, 130);
    ctx.fillText(`DA'DA: ${age}`, 200, 170);
    ctx.fillText(`WADANKA: ${country}`, 200, 210);
    ctx.fillText(`JINSIGA: ${gender}`, 200, 250);
    
    ctx.fillStyle = '#f1c40f'; // Midab dahabi ah ID-ga
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`PRIVATE ID: ${randomID}`, 200, 310);

    // 5. QR Code (Wuxuu geynayaa Profile-ka User-ka)
    const qrData = await QRCode.toDataURL(`https://discord.com/users/${interaction.user.id}`);
    const qrImage = await Canvas.loadImage(qrData);
    ctx.drawImage(qrImage, 520, 250, 120, 120);

    return canvas.toBuffer();
}

client.on('interactionCreate', async (interaction) => {
    // ... (Halkan ku dar qaybtii Modal-ka ee hore) ...

    if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
        await interaction.deferReply({ ephemeral: true });

        const name = interaction.fields.getTextInputValue('name');
        const age = interaction.fields.getTextInputValue('age');
        const country = interaction.fields.getTextInputValue('country');
        const gender = interaction.fields.getTextInputValue('gender');
        const randomID = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create the Card
        const buffer = await createIDCard(interaction, name, age, country, gender, randomID);
        const attachment = new AttachmentBuilder(buffer, { name: 'sumayo-id-card.png' });

        // DM User
        try {
            await interaction.user.send({ 
                content: `✅ **Verification Successful!**\nYour ID: \`${randomID}\` (Keep this private)`, 
                files: [attachment] 
            });
        } catch (e) { console.log("DM is closed"); }

        // Send to Private Admin Log Channel
        const logChannelName = `verify-${interaction.user.username}`;
        let logChannel = interaction.guild.channels.cache.find(c => c.name === logChannelName);
        
        if (!logChannel) {
            logChannel = await interaction.guild.channels.create({
                name: logChannelName,
                permissionOverwrites: [{ id: interaction.guild.id, deny: ['ViewChannel'] }]
            });
        }
        await logChannel.send({ content: `New Verified User: ${interaction.user.tag}\nID: ${randomID}`, files: [attachment] });

        await interaction.editReply({ content: 'Verification-kaaga waa la gudbiyay! Fiiri DM-kaaga.' });
    }
});

client.login(process.env.TOKEN);
