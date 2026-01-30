const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const QRCode = require('qrcode');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// Link-ga sawirka aad isisay
const bgUrl = "https://i.postimg.cc/jj2r8Qvy/cd48f1f2f2280a1c08226a5471bbfb96.jpg";

client.once('ready', () => {
    console.log(`✅ Sumayo- Pro is Online with Custom BG!`);
});

async function generateIDCard(interaction, data, idCode) {
    // 1. Soo rar sawirka Background-ka ah
    const background = await loadImage(bgUrl);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    // 2. Sawir Background-ka
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Hubinta macluumaadka (Safe Strings)
    const name = String(data.name || "N/A");
    const age = String(data.age || "N/A");
    const country = String(data.country || "N/A");
    const gender = String(data.gender || "N/A");
    const guildName = String(interaction.guild.name || "Server");

    // 3. Qoraalka Macluumaadka (Dhexda sawirka)
    ctx.fillStyle = '#000000'; // Madow (waayo background-ku waa khafiif)
    ctx.font = 'bold 30px sans-serif';
    
    ctx.fillText(`Magaca: ${name}`, 60, 400);
    ctx.fillText(`Da'da: ${age}`, 60, 450);
    ctx.fillText(`Wadanka: ${country}`, 60, 500);
    ctx.fillText(`Jinsiga: ${gender}`, 60, 550);
    ctx.fillText(`ID: ${idCode}`, 60, 600);

    // 4. Beneficiary Name (Magaca Server-ka)
    ctx.font = '28px sans-serif';
    ctx.fillText(guildName, 480, 765); 

    // 5. Management Signature (Magaca Bot-ka)
    ctx.font = 'italic bold 28px sans-serif';
    ctx.fillText("Sumayo- Bot", 100, 945);

    // 6. User Profile (Avatar) - Geeska sare
    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png' }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 50, 50, 200, 200);
    ctx.restore();

    // 7. Server Logo - Geeska kale
    const guildIcon = interaction.guild.iconURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const logo = await loadImage(guildIcon);
    ctx.drawImage(logo, 850, 50, 150, 150);

    // 8. QR Code
    const qrBuffer = await QRCode.toDataURL(`https://discord.com/users/${interaction.user.id}`);
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 800, 800, 220, 220);

    return canvas.toBuffer();
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'verify_setup') {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Server Verification')
            .setDescription('Guji badanka si aad u hesho ID Card-kaaga rasmiga ah.')
            .setColor('DarkGold');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_v').setLabel('Get ID Card').setStyle(ButtonStyle.Primary)
        );
        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.isButton() && interaction.customId === 'open_v') {
        const modal = new ModalBuilder().setCustomId('v_modal').setTitle('ID Card Form');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_name').setLabel("Full Name").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_age').setLabel("Age").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_country').setLabel("Country").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_gender').setLabel("Gender").setStyle(TextInputStyle.Short).setRequired(true))
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
            const file = new AttachmentBuilder(buffer, { name: 'sumayo-id.png' });
            await interaction.user.send({ content: `✅ Waa kan ID Card-kaaga rasmiga ah!`, files: [file] }).catch(() => {});
            await interaction.editReply('✅ ID-gaagii waa diyaar, fiiri DM-kaaga!');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Cilad ayaa dhacday, hubi in bot-ku leeyahay ogolaanshaha loo baahan yahay.');
        }
    }
});

client.login(process.env.TOKEN);
