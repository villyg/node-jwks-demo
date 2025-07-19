FROM node:slim
WORKDIR /app
COPY index.js .
COPY package*.json .
RUN npm install
CMD ["node", "index.js"]