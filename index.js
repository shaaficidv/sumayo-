require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  AttachmentBuilder
} = require("discord.js");

const { createCanvas, loadImage } = require("@napi-rs/canvas");
const QRCode = require("qrcode");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================= REGISTER SLASH COMMAND ================= */
const commands = [
  new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Create your ID card")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("✅ Slash command registered");
  } catch (e) {
    console.error(e);
  }
})();

/* ================= BOT READY ================= */
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

/* ================= INTERACTION HANDLER ================= */
client.on("interactionCreate", async interaction => {

  /* ---- Slash Command ---- */
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "verify") {

      const modal = new ModalBuilder()
        .setCustomId("verify_modal")
        .setTitle("ID Verification");

      const name = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Your Name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const age = new TextInputBuilder()
        .setCustomId("age")
        .setLabel("Age")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const country = new TextInputBuilder()
        .setCustomId("country")
        .setLabel("Country")
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

  /* ---- Modal Submit ---- */
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "verify_modal") {

      await interaction.deferReply({ ephemeral: true });

      const name = interaction.fields.getTextInputValue("name");
      const age = interaction.fields.getTextInputValue("age");
      const country = interaction.fields.getTextInputValue("country");
      const gender = interaction.fields.getTextInputValue("gender");

      /* ===== CREATE CANVAS ===== */
      const canvas = createCanvas(900, 500);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon border
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Logo
      const logo = await loadImage(
        "https://i.postimg.cc/jj2r8Qvy/cd48f1f2f2280a1c08226a5471bbfb96.jpg"
      );
      ctx.drawImage(logo, 40, 40, 120, 120);

      // Text
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "bold 32px Sans";
      ctx.fillText("USER ID CARD", 220, 70);

      ctx.font = "22px Sans";
      ctx.fillText(`Name: ${name}`, 220, 140);
      ctx.fillText(`Age: ${age}`, 220, 180);
      ctx.fillText(`Country: ${country}`, 220, 220);
      ctx.fillText(`Gender: ${gender}`, 220, 260);

      // QR Code
      const qr = await QRCode.toDataURL(interaction.user.id);
      const qrImg = await loadImage(qr);
      ctx.drawImage(qrImg, 680, 120, 160, 160);

      const buffer = canvas.toBuffer("image/png");
      const attachment = new AttachmentBuilder(buffer, { name: "id-card.png" });

      await interaction.editReply({
        content: "✅ Your ID Card is ready",
        files: [attachment]
      });
    }
  }
});

/* ================= LOGIN ================= */
client.login(process.env.DISCORD_TOKEN);
