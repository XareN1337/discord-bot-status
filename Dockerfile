FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy project files
COPY . .

# Deploy slash commands on container start (optional, can be done manually)
# RUN npm run deploy-commands

# Command to run the bot
CMD ["npm", "start"]