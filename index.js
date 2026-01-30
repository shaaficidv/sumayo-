const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const QRCode = require('qrcode');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Sawirkaaga template-ka ah
const bgUrl = "https://i.postimg.cc/pTnVxtj9/ee49ee427eb7fb2217cc5bce7ed191ee.jpg";

async function generateIDCard(interaction, data) {
    const background = await loadImage(bgUrl);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000'; 

    // 1. Qorista Macluumaadka (Name, Age, Country)
    ctx.font = 'bold 45px sans-serif';
    ctx.fillText(`Name: ${data.name}`, 130, 330);
    ctx.fillText(`Age: ${data.age}`, 130, 400);
    ctx.fillText(`Country: ${data.country}`, 130, 470);

    // 2. User Avatar
    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 512 }));
    ctx.drawImage(avatar, 130, 160, 160, 160);

    // 3. QR Code
    const qrBuffer = await QRCode.toBuffer(`User ID: ${interaction.user.id}`);
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 600, 330, 220, 220);

    // 4. Server Logo
    const guildIcon = interaction.guild.iconURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const logo = await loadImage(guildIcon);
    ctx.drawImage(logo, 130, 750, 150, 150);

    return canvas.toBuffer('image/png');
}
// ... (Halkan ku dar qaybtii kale ee interaction-ka ee modal-ka)
client.login(process.env.TOKEN);
