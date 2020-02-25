FROM node:13.8.0-alpine3.11
EXPOSE 8445
COPY ./index.js ./index.js
COPY ./package.json ./package.json
RUN npm install
CMD ["node", "./index.js"]