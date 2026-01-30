const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    AttachmentBuilder, 
    PermissionFlagsBits 
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const QRCode = require('qrcode');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// Link-ga sawirka template-ka ah ee aad isisay
const bgUrl = "https://i.postimg.cc/jj2r8Qvy/cd48f1f2f2280a1c08226a5471bbfb96.jpg";

client.once('ready', () => {
    console.log(`✅ Sumayo- Pro is Online and Ready!`);
});

/**
 * Function-ka dhisaya ID Card-ka
 */
async function generateIDCard(interaction, data, idCode) {
    // 1. Soo rar sawirka Background-ka ah
    const background = await loadImage(bgUrl);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    // 2. Sawir Template-ka
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Xaqiijinta xogta (Cites: Xallinta StringExpected error)
    const name = String(data.name || "N/A");
    const age = String(data.age || "N/A");
    const country = String(data.country || "N/A");
    const gender = String(data.gender || "N/A");
    const guildName = String(interaction.guild.name || "Server");
    const id = String(idCode || "000000");

    // 3. Qoraalka Macluumaadka User-ka
    ctx.fillStyle = '#000000'; // Madow
    ctx.font = 'bold 34px sans-serif';
    
    ctx.fillText(`Magaca: ${name}`, 80, 420);
    ctx.fillText(`Da'da: ${age}`, 80, 480);
    ctx.fillText(`Wadanka: ${country}`, 80, 540);
    ctx.fillText(`Jinsiga: ${gender}`, 80, 600);
    ctx.fillText(`ID: ${id}`, 80, 660);

    // 4. Beneficiary Name (Magaca Server-ka)
    ctx.font = '30px sans-serif';
    ctx.fillText(guildName, 460, 765); 

    // 5. Management Signature (Magaca Bot-ka)
    ctx.font = 'italic bold 32px sans-serif';
    ctx.fillText("Sumayo- Bot", 100, 935);

    // 6. User Avatar (Profile-ka Userka)
    try {
        const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.drawImage(avatar, 70, 70, 220, 220);
    } catch (e) { console.log("Avatar load error"); }

    // 7. Server Logo (Logo-ga Serverka)
    try {
        const guildIcon = interaction.guild.iconURL({ extension: 'png', size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const logo = await loadImage(guildIcon);
        ctx.drawImage(logo, 800, 70, 180, 180);
    } catch (e) { console.log("Logo load error"); }

    // 8. QR Code (U kaxaynaya Profile-ka User-ka)
    try {
        const qrBuffer = await QRCode.toDataURL(`https://discord.com/users/${interaction.user.id}`);
        const qrImage = await loadImage(qrBuffer);
        ctx.drawImage(qrImage, 780, 780, 220, 220);
    } catch (e) { console.log("QR error"); }

    return canvas.toBuffer('image/png');
}

client.on('interactionCreate', async (interaction) => {
    // 1. Slash Command: /verify_setup
    if (interaction.isChatInputCommand() && interaction.commandName === 'verify_setup') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Server Verification')
            .setDescription('Guji badanka hoose si aad u hesho ID Card-kaaga rasmiga ah.')
            .setColor('#D4AF37');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_verify_modal')
                .setLabel('Get ID Card')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // 2. Button Click: Open Modal
    if (interaction.isButton() && interaction.customId === 'open_verify_modal') {
        const modal = new ModalBuilder()
            .setCustomId('v_modal')
            .setTitle('ID Card Information');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_name').setLabel("Full Name").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_age').setLabel("Age").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_country').setLabel("Country").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_gender').setLabel("Gender").setStyle(TextInputStyle.Short).setRequired(true))
        );

        await interaction.showModal(modal);
    }

    // 3. Modal Submit: Generate ID
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
            const file = new AttachmentBuilder(buffer, { name: 'sumayo-id-card.png' });

            // DM ugu dir user-ka
            await interaction.user.send({ 
                content: `✅ **Verification Successful!** Waa kan ID Card-kaaga rasmiga ah:`, 
                files: [file] 
            }).catch(() => console.log("DM-ka user-ka waa xiran yahay."));

            await interaction.editReply('✅ ID Card-kaagii waa diyaar, fadlan fiiri DM-kaaga (Farriimaha khaaska ah).');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Cilad ayaa dhacday markii ID-ga la diyaarinayay.');
        }
    }
});

client.login(process.env.TOKEN);
