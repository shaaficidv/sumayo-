FROM node:22-slim

# Samee meesha uu bot-ku ku jirayo
WORKDIR /app

# Nuqul ka qaad faylasha aasaaska ah
COPY package.json ./

# Rakib library-yada
RUN npm install

# Nuqul ka qaad koodka intiisa kale
COPY . .

# Shid bot-ka
CMD ["node", "index.js"]

