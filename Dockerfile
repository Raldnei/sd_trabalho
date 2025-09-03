FROM node:18-alpine

WORKDIR /app

COPY package.json package.json
RUN npm install

COPY . .

EXPOSE 8080 8888 9999

CMD ["npm", "start"]
