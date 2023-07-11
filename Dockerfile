FROM node:18

WORKDIR /app/dadbot-cluster-client
COPY dadbot-cluster-client/package.json .
RUN npm i
COPY dadbot-cluster-client .
RUN npm run build

WORKDIR /app/dadbot
COPY dadbot/package.json .
RUN npm i
COPY dadbot .
RUN npm run build

CMD [ "node", "." ]
