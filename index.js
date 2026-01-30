const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  InteractionType,
  Events
} = require("discord.js");

const { createCanvas, loadImage } = require("canvas");
const QRCode = require("qrcode");

// ================= CONFIG =================
const TOKEN = process.env.BOT_TOKEN || "PUT_YOUR_TOKEN_HERE";
const SERVER_LOGO =
  "https://i.postimg.cc/jj2r8Qvy/cd48f1f2f2280a1c08226a5471bbfb96.jpg";
const CARD_BG =
  "https://i.postimg.cc/pTnVxtj9/ee49ee427eb7fb2217cc5bce7ed191ee.jpg";
// =========================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const verifyCmd = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Create your ID Card");

  await client.application.commands.create(verifyCmd);
});

// ================= SLASH COMMAND =================
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "verify") {
      const modal = new ModalBuilder()
        .setCustomId("verifyModal")
        .setTitle("User Verification");

      const nameInput = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const ageInput = new TextInputBuilder()
        .setCustomId("age")
        .setLabel("Age")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const countryInput = new TextInputBuilder()
        .setCustomId("country")
        .setLabel("Country")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const genderInput = new TextInputBuilder()
        .setCustomId("gender")
        .setLabel("Gender")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(ageInput),
        new ActionRowBuilder().addComponents(countryInput),
        new ActionRowBuilder().addComponents(genderInput)
      );

      await interaction.showModal(modal);
    }
  }

  // ================= MODAL SUBMIT =================
  if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === "verifyModal"
  ) {
    await interaction.deferReply({ ephemeral: true });

    const name = interaction.fields.getTextInputValue("name");
    const age = interaction.fields.getTextInputValue("age");
    const country = interaction.fields.getTextInputValue("country");
    const gender = interaction.fields.getTextInputValue("gender");

    // ---------- Canvas ----------
    const canvas = createCanvas(800, 1100);
    const ctx = canvas.getContext("2d");

    const bg = await loadImage(CARD_BG);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.font = "28px Arial";

    ctx.fillText(`Name: ${name}`, 80, 300);
    ctx.fillText(`Age: ${age}`, 80, 350);
    ctx.fillText(`Country: ${country}`, 80, 400);
    ctx.fillText(`Gender: ${gender}`, 80, 450);

    ctx.font = "24px Arial";
    ctx.fillText(`Bot: ${client.user.username}`, 80, 900);

    // ---------- Server Logo ----------
    const logo = await loadImage(SERVER_LOGO);
    ctx.drawImage(logo, 550, 820, 180, 180);

    // ---------- QR Code ----------
    const qrCanvas = createCanvas(200, 200);
    await QRCode.toCanvas(
      qrCanvas,
      interaction.user.url || `https://discord.com/users/${interaction.user.id}`
    );
    ctx.drawImage(qrCanvas, 520, 300, 200, 200);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "id-card.png"
    });

    await interaction.editReply({
      content: "✅ ID Card Created!",
      files: [attachment]
    });
  }
});

client.login(TOKEN);
