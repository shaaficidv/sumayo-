const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. Samee website yar si Koyeb uusan u damin bot-ka
const app = express();
app.get('/', (req, res) => res.send('Bot-ka waa nool yahay!'));
app.listen(process.env.PORT || 3000);

// 2. Setup-ka Bot-ka
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot-ka ${client.user.tag} waa diyaar!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Haddii fariintu link leedahay, tirtir
  const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  if (linkRegex.test(message.content)) {
    try {
      await message.delete();
      message.channel.send(`Hey ${message.author}, halkan linki loo ma ogola!`).then(msg => {
        setTimeout(() => msg.delete(), 5000);
      });
    } catch (err) {
      console.log("Error tirtirista: ", err);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
