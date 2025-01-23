FROM node:16-alpine

WORKDIR /usr/src/app

COPY backend/package*.json ./

RUN npm install

COPY backend/. .

CMD ["npm", "run", "start"]
