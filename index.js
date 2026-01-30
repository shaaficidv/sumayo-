import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  Events,
  InteractionType
} from "discord.js";

import Canvas from "canvas";
import QRCode from "qrcode";
import fs from "fs";

// ================= CONFIG =================
const CLIENT_ID = "YOUR_CLIENT_ID";
const GUILD_ID = "YOUR_GUILD_ID";
// BOT TOKEN HALKAN HA KU QORIN ❌
// process.env.BOT_TOKEN ayaa la isticmaalayaa
// ==========================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ========== SLASH COMMAND ==========
const commands = [
  new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Create your ID Card")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Slash command registered");
  } catch (err) {
    console.error(err);
  }
})();

// ========== INTERACTIONS ==========
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    // -------- SLASH COMMAND --------
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "verify") {

        const modal = new ModalBuilder()
          .setCustomId("verify_modal")
          .setTitle("User Verification");

        const nameInput = new TextInputBuilder()
          .setCustomId("name")
          .setLabel("Magacaaga")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const ageInput = new TextInputBuilder()
          .setCustomId("age")
          .setLabel("Da'da")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const countryInput = new TextInputBuilder()
          .setCustomId("country")
          .setLabel("Wadanka")
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

    // -------- MODAL SUBMIT --------
    if (interaction.type === InteractionType.ModalSubmit) {
      if (interaction.customId === "verify_modal") {

        await interaction.deferReply({ ephemeral: true });

        const name = interaction.fields.getTextInputValue("name");
        const age = interaction.fields.getTextInputValue("age");
        const country = interaction.fields.getTextInputValue("country");
        const gender = interaction.fields.getTextInputValue("gender");

        // ===== CANVAS =====
        const canvas = Canvas.createCanvas(800, 500);
        const ctx = canvas.getContext("2d");

        // Background image (link aad siisay)
        const bg = await Canvas.loadImage(
          "https://i.postimg.cc/pTnVxtj9/ee49ee427eb7fb2217cc5bce7ed191ee.jpg"
        );
        ctx.drawImage(bg, 0, 0, 800, 500);

        ctx.fillStyle = "#00ffff";
        ctx.font = "28px Sans";
        ctx.fillText("USER ID CARD", 30, 50);

        ctx.font = "20px Sans";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Name: ${name}`, 30, 120);
        ctx.fillText(`Age: ${age}`, 30, 160);
        ctx.fillText(`Country: ${country}`, 30, 200);
        ctx.fillText(`Gender: ${gender}`, 30, 240);

        ctx.fillText(`User: ${interaction.user.tag}`, 30, 300);
        ctx.fillText(`Server: ${interaction.guild.name}`, 30, 340);

        // ===== QR CODE =====
        const qrData = `User: ${interaction.user.id}`;
        const qrImg = await QRCode.toDataURL(qrData);
        const qr = await Canvas.loadImage(qrImg);
        ctx.drawImage(qr, 550, 120, 200, 200);

        // Save
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync("idcard.png", buffer);

        await interaction.editReply({
          content: "✅ ID Card waa la sameeyay",
          files: ["idcard.png"]
        });

        fs.unlinkSync("idcard.png");
      }
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Error dhacay",
        ephemeral: true
      });
    }
  }
});

// ========== READY ==========
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);
