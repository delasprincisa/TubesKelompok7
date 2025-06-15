FROM node:18-alpine

WORKDIR /app

# Tambahkan dependensi yang dibutuhkan oleh Puppeteer/Chromium di Alpine
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY package*.json ./
RUN npm install

# Beritahu puppeteer untuk tidak mengunduh chromium sendiri, tapi gunakan yang dari sistem
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . .

EXPOSE 3004
CMD ["node", "server.js"]