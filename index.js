import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionType
} from "discord.js";

import fetch from "node-fetch";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ⚠️ TOKEN HALKAN HA KU QORIN
const TOKEN = process.env.BOT_TOKEN;

// 🔹 CUSTOM SETTINGS
const BOT_NAME = "Cyber Verify Bot";
const BACKGROUND_IMAGE =
  "https://i.postimg.cc/pTnVxtj9/ee49ee427eb7fb2217cc5bce7ed191ee.jpg";

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} online`);

  const cmd = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Create your ID card");

  await client.application.commands.create(cmd);
});

// 🎴 INTERACTIONS
client.on("interactionCreate", async (interaction) => {
  // /verify
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "verify") {
      const modal = new ModalBuilder()
        .setCustomId("verify_modal")
        .setTitle("Verification Form");

      const name = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Your Name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const age = new TextInputBuilder()
        .setCustomId("age")
        .setLabel("Your Age")
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

  // 📥 MODAL SUBMIT
  if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === "verify_modal") {
      const name = interaction.fields.getTextInputValue("name");
      const age = interaction.fields.getTextInputValue("age");
      const country = interaction.fields.getTextInputValue("country");
      const gender = interaction.fields.getTextInputValue("gender");

      const user = interaction.user;
      const avatar = user.displayAvatarURL({ extension: "png", size: 256 });

      // 🔗 IMAGE GENERATION (NO CANVAS)
      const imageURL = `https://image.pollinations.ai/prompt/
Discord ID Card,
Background image ${BACKGROUND_IMAGE},
Name ${name},
Age ${age},
Country ${country},
Gender ${gender},
Bot ${BOT_NAME},
Server logo ${avatar},
QR code for https://discord.com/users/${user.id},
cyberpunk neon style,
high quality
`;

      await interaction.reply({
        content: "✅ Your ID Card is ready",
        embeds: [
          {
            title: "🪪 Verification ID",
            description: `Issued by **${BOT_NAME}**`,
            image: { url: imageURL },
            footer: {
              text: interaction.guild.name,
              icon_url: interaction.guild.iconURL()
            }
          }
        ]
      });
    }
  }
});

client.login(TOKEN);
