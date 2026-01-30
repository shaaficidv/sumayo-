require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionType,
  AttachmentBuilder
} = require("discord.js");

const Canvas = require("canvas");
const QRCode = require("qrcode");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ===== SLASH COMMAND REGISTER ===== */
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const command = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify & generate ID Card");

  await client.application.commands.create(command);
});

/* ===== INTERACTION HANDLER ===== */
client.on("interactionCreate", async (interaction) => {

  /* === SLASH COMMAND === */
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "verify") {

      const modal = new ModalBuilder()
        .setCustomId("verifyModal")
        .setTitle("User Verification");

      const name = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Magaca")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const age = new TextInputBuilder()
        .setCustomId("age")
        .setLabel("Dada")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const country = new TextInputBuilder()
        .setCustomId("country")
        .setLabel("Wadanka")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const gender = new TextInputBuilder()
        .setCustomId("gender")
        .setLabel("Gender")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(name),
        new ActionRowBuilder().addComponents(age),
        new ActionRowBuilder().addComponents(country),
        new ActionRowBuilder().addComponents(gender)
      );

      await interaction.showModal(modal);
    }
  }

  /* === MODAL SUBMIT === */
  if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === "verifyModal") {

      const name = interaction.fields.getTextInputValue("name");
      const age = interaction.fields.getTextInputValue("age");
      const country = interaction.fields.getTextInputValue("country");
      const gender = interaction.fields.getTextInputValue("gender");

      /* ===== CANVAS ID CARD ===== */
      const canvas = Canvas.createCanvas(800, 450);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0a0f1e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon border
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 780, 430);

      // Logo
      const logo = await Canvas.loadImage(
        "https://i.postimg.cc/jj2r8Qvy/cd48f1f2f2280a1c08226a5471bbfb96.jpg"
      );
      ctx.drawImage(logo, 30, 30, 120, 120);

      // Text
      ctx.fillStyle = "#00ffff";
      ctx.font = "28px Sans";
      ctx.fillText("USER ID CARD", 300, 60);

      ctx.font = "22px Sans";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Name: ${name}`, 200, 140);
      ctx.fillText(`Age: ${age}`, 200, 180);
      ctx.fillText(`Country: ${country}`, 200, 220);
      ctx.fillText(`Gender: ${gender}`, 200, 260);

      ctx.fillText(`User: ${interaction.user.tag}`, 200, 300);
      ctx.fillText(`Server: ${interaction.guild.name}`, 200, 340);

      /* ===== QR CODE ===== */
      const qrData = `https://discord.com/users/${interaction.user.id}`;
      const qrImage = await QRCode.toDataURL(qrData);
      const qr = await Canvas.loadImage(qrImage);
      ctx.drawImage(qr, 580, 140, 160, 160);

      const attachment = new AttachmentBuilder(
        canvas.toBuffer(),
        { name: "id-card.png" }
      );

      await interaction.reply({
        content: "✅ Verification complete — ID Card generated!",
        files: [attachment]
      });
    }
  }
});

/* ===== LOGIN ===== */
client.login(process.env.BOT_TOKEN);
