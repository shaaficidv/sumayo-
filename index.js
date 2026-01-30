const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const QRCode = require('qrcode');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] 
});

// Link-ga sawirkaaga cusub
const bgUrl = "https://i.postimg.cc/pTnVxtj9/ee49ee427eb7fb2217cc5bce7ed191ee.jpg";

client.once('ready', () => {
    console.log(`✅ Sumayo- Pro is Online!`);
});

async function generateIDCard(interaction, data, idCode) {
    const background = await loadImage(bgUrl);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    // 1. Sawir Background-ka
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // 2. Habaynta Qoraalka (Font-ka weyneey si uu u muuqdo)
    ctx.fillStyle = '#000000'; 
    
    // Server Name (Dusha sare dhexda)
    ctx.font = 'bold 60px sans-serif';
    ctx.fillText(interaction.guild.name, canvas.width / 2 - 150, 150);

    // Macluumaadka User-ka (Bidixda)
    ctx.font = 'bold 45px sans-serif';
    ctx.fillText(`Name: ${data.name}`, 150, 350);
    ctx.fillText(`Age: ${data.age}`, 150, 430);
    ctx.fillText(`Country: ${data.country}`, 150, 510);
    ctx.fillText(`Gender: ${data.gender}`, 150, 590);

    // 3. User Avatar (Meesha "avater;" ku qoran tahay)
    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 512 }));
    ctx.drawImage(avatar, 150, 180, 180, 180);

    // 4. Server Logo (Bidix hoose)
    const guildIcon = interaction.guild.iconURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const logo = await loadImage(guildIcon);
    ctx.drawImage(logo, 120, 780, 150, 150);

    // 5. QR Code (Midigta dhexda)
    const qrBuffer = await QRCode.toBuffer(`User: ${interaction.user.id}`);
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 650, 350, 250, 250);

    // 6. Magaca Bot-ka (Midig hoose)
    ctx.font = 'bold 35px sans-serif';
    ctx.fillText("Sumayo- Pro", 650, 800);

    return canvas.toBuffer('image/png');
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'verify_setup') {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Server Verification')
            .setDescription('Guji badanka si aad u hesho ID Card-kaaga.')
            .setColor('#D4AF37');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_v').setLabel('Get ID Card').setStyle(ButtonStyle.Success)
        );
        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.isButton() && interaction.customId === 'open_v') {
        const modal = new ModalBuilder().setCustomId('v_modal').setTitle('Verification Form');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_name').setLabel("Magaca").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_age').setLabel("Da'da").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_country').setLabel("Wadanka").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('v_gender').setLabel("Jinsiga").setStyle(TextInputStyle.Short).setRequired(true))
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
            await interaction.user.send({ content: `✅ Waa kan ID-gaagii!`, files: [file] }).catch(() => {});
            await interaction.editReply('✅ Fiiri DM-kaaga, ID-gii waa loo soo diray!');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Cilad ayaa dhacday.');
        }
    }
});

client.login(process.env.TOKEN);
