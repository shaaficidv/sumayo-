const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const QRCode = require('qrcode');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] 
});

// Link-ga sawirkaaga cusub ee quruxda badan
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

    // 2. Habaynta Qoraalka
    ctx.fillStyle = '#000000'; 
    
    // Server Name (Dhexda sare)
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(interaction.guild.name.toUpperCase(), 350, 130);

    // Macluumaadka User-ka (Dhexda bidix)
    ctx.font = 'bold 35px sans-serif';
    ctx.fillText(`Name: ${data.name}`, 130, 330);
    ctx.fillText(`Age: ${data.age}`, 130, 390);
    ctx.fillText(`Country: ${data.country}`, 130, 450);
    ctx.fillText(`Gender: ${data.gender}`, 130, 510);

    // 3. User Avatar (Meesha "avater;" ku qoran tahay)
    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 512 }));
    ctx.drawImage(avatar, 300, 250, 220, 220); // Meesha dhexe ee sawirka

    // 4. QR Code (Midigta dhexda)
    const qrBuffer = await QRCode.toBuffer(`User: ${interaction.user.tag}`);
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, 600, 330, 200, 200);

    // 5. Server Logo (Bidix hoose)
    const guildIcon = interaction.guild.iconURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const logo = await loadImage(guildIcon);
    ctx.drawImage(logo, 130, 750, 150, 150);

    // 6. Magaca Bot-ka (Midig hoose)
    ctx.font = 'italic bold 30px sans-serif';
    ctx.fillText("Sumayo- Pro Bot", 620, 760);

    return canvas.toBuffer('image/png');
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'verify_setup') {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Server Verification')
            .setDescription('Guji badanka hoose si aad u hesho ID Card-kaaga rasmiga ah.')
            .setColor('#D4AF37');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_v').setLabel('Get ID Card').setStyle(ButtonStyle.Success)
        );
        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.isButton() && interaction.customId === 'open_v') {
        const modal = new ModalBuilder().setCustomId('v_modal').setTitle('Verification Form');
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
            const file = new AttachmentBuilder(buffer, { name: 'sumayo-verified.png' });
            await interaction.user.send({ content: `✅ Hambalyo! Waa kan ID-gaaga dhammaystiran!`, files: [file] }).catch(() => {});
            await interaction.editReply('✅ ID-gaagii waa la diyaariyey, fiiri DM-kaaga!');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Cilad ayaa dhacday intii la samaynayay sawirka.');
        }
    }
});

client.login(process.env.TOKEN);
