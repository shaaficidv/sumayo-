const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas'); // LINE-KAN WAA MUHIIM
const QRCode = require('qrcode');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

// Link-ga template-kaaga
const bgUrl = "https://i.postimg.cc/jj2r8Qvy/cd48f1f2f2280a1c08226a5471bbfb96.jpg";

client.once('ready', () => {
    console.log(`✅ Sumayo- Pro is Online!`);
});

client.on('interactionCreate', async (interaction) => {
    // 1. /verify_setup Command
    if (interaction.isChatInputCommand() && interaction.commandName === 'verify_setup') {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Server Verification')
            .setDescription('Guji badanka hoose si aad is-verify ugu sameyso.')
            .setColor('#D4AF37');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_v').setLabel('hdk').setStyle(ButtonStyle.Success)
        );
        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // 2. Button Click
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

    // 3. Modal Submit
    if (interaction.isModalSubmit() && interaction.customId === 'v_modal') {
        await interaction.deferReply({ ephemeral: true });
        
        const name = String(interaction.fields.getTextInputValue('v_name')); // String conversion
        const age = String(interaction.fields.getTextInputValue('v_age'));
        const country = String(interaction.fields.getTextInputValue('v_country'));
        const gender = String(interaction.fields.getTextInputValue('v_gender'));
        const idCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        try {
            const background = await loadImage(bgUrl);
            const canvas = createCanvas(background.width, background.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Qoraalka ID-ga
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 34px sans-serif';
            ctx.fillText(`Magaca: ${name}`, 80, 420);
            ctx.fillText(`Da'da: ${age}`, 80, 480);
            ctx.fillText(`ID: ${idCode}`, 80, 660);

            const buffer = canvas.toBuffer('image/png');
            const file = new AttachmentBuilder(buffer, { name: 'id-card.png' });

            await interaction.user.send({ content: `✅ Waa kan ID-gaaga!`, files: [file] }).catch(() => {});
            await interaction.editReply('✅ ID Card-kaagii waa diyaar!');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Cilad ayaa dhacday.');
        }
    }
});

client.login(process.env.TOKEN);
