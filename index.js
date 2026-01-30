import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  InteractionType
} from "discord.js";

import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== BOT READY =====
client.once("ready", async () => {
  console.log("✅ Bot Ready");

  const command = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Create ID Card");

  await client.application.commands.create(command);
});

// ===== INTERACTION =====
client.on("interactionCreate", async (interaction) => {

  // SLASH COMMAND
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "verify") {

      const modal = new ModalBuilder()
        .setCustomId("id_modal")
        .setTitle("Verification Form");

      const name = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Name")
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

  // MODAL SUBMIT
  if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === "id_modal"
  ) {
    await interaction.deferReply();

    const name = interaction.fields.getTextInputValue("name");
    const age = interaction.fields.getTextInputValue("age");
    const country = interaction.fields.getTextInputValue("country");
    const gender = interaction.fields.getTextInputValue("gender");

    // ===== CANVAS =====
    const canvas = createCanvas(900, 1200);
    const ctx = canvas.getContext("2d");

    const template = await loadImage(
      "https://i.postimg.cc/pTnVxtj9/ee49ee427eb7fb2217cc5bce7ed191ee.jpg"
    );
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    // SERVER NAME
    ctx.fillStyle = "#000";
    ctx.font = "bold 42px Serif";
    ctx.textAlign = "center";
    ctx.fillText(interaction.guild.name, 450, 120);

    // AVATAR
    const avatar = await loadImage(
      interaction.user.displayAvatarURL({ extension: "png", size: 256 })
    );
    ctx.drawImage(avatar, 80, 230, 180, 180);

    // USER INFO
    ctx.textAlign = "left";
    ctx.font = "28px Serif";
    ctx.fillText(`Name : ${name}`, 320, 260);
    ctx.fillText(`Age : ${age}`, 320, 310);
    ctx.fillText(`Country : ${country}`, 320, 360);
    ctx.fillText(`Gender : ${gender}`, 320, 410);

    // QR CODE
    const qrData = await QRCode.toDataURL(
      `https://discord.com/users/${interaction.user.id}`
    );
    const qr = await loadImage(qrData);
    ctx.drawImage(qr, 580, 260, 220, 220);

    // SERVER LOGO
    if (interaction.guild.iconURL()) {
      const logo = await loadImage(
        interaction.guild.iconURL({ extension: "png", size: 256 })
      );
      ctx.drawImage(logo, 100, 900, 150, 150);
    }

    // BOT NAME
    ctx.font = "24px Serif";
    ctx.textAlign = "right";
    ctx.fillText(
      interaction.client.user.username,
      820,
      980
    );

    const attachment = new AttachmentBuilder(
      canvas.toBuffer(),
      { name: "id-card.png" }
    );

    await interaction.editReply({
      content: "✅ ID Card created",
      files: [attachment]
    });
  }
});

// ===== LOGIN =====
client.login("PUT_YOUR_BOT_TOKEN_HERE");
