const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const QRCode = require('qrcode');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] 
});

const bgUrl = "https://i.postimg.cc/jj2r8Qvy/cd48f1f2f2280a1c08226a5471bbfb96.jpg";

client.once('ready', () => {
    console.log(`✅ Sumayo- Pro is Online!`);
});

async function generateIDCard(interaction, data, idCode) {
    const background = await loadImage(bgUrl);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    // 1. Sawir Background-ka
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // 2. Qoraalka Macluumaadka User-ka (Dhexda)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`Magaca: ${String(data.name)}`, 80, 420);
    ctx.fillText(`Da'da: ${String(data.age)}`, 80, 480);
    ctx.fillText(`Wadanka: ${String(data.country)}`, 80, 540);
    ctx.fillText(`Jinsiga: ${String(data.gender)}`, 80, 600);
    ctx.fillText(`ID: ${idCode}`, 80, 660);

    // 3. Magaca Server-ka (Khadka Beneficiary name)
    ctx.font = '30px sans-serif';
    ctx.fillText(String(interaction.guild.name), 460, 755); 

    // 4. Magaca Bot-ka (Khadka Signature)
    ctx.font = 'italic bold 32px sans-serif';
    ctx.fillText("Sumayo- Pro Bot", 100, 925);

    // 5. User Avatar (Sawirka bidixda sare)
    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.drawImage(avatar, 70, 70, 220, 220);

    // 6. Server Logo (Logo-ga midigta sare)
    const guildIcon = interaction.guild.iconURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const logo = await loadImage(guildIcon);
    ctx.drawImage(logo, 800, 70, 180, 180);

    // 7. QR Code (Midigta hoose)
    const qrBuffer = await QRCode.toBuffer(`User: ${interaction.user.tag}\nID: ${idCode}`);
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 780, 780, 220, 220);

    return canvas.toBuffer('image/png');
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'verify_setup') {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Server Verification')
            .setDescription('Guji badanka hoose si aad u hesho ID Card-kaaga.')
            .setColor('#D4AF37');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_v').setLabel('Get ID Card').setStyle(ButtonStyle.Success)
        );
        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.isButton() && interaction.customId === 'open_v') {
        const modal = new ModalBuilder().setCustomId('v_modal').setTitle('ID Card Details');
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
            const file = new AttachmentBuilder(buffer, { name: 'id-card.png' });
            await interaction.user.send({ content: `✅ Waa kan ID-gaaga!`, files: [file] }).catch(() => {});
            await interaction.editReply('✅ ID Card-kaagii waa diyaar, fiiri DM-kaaga!');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Cilad ayaa dhacday intii ID-ga la diyaarinayay.');
        }
    }
});

client.login(process.env.TOKEN);
