FROM node:10

WORKDIR /
COPY asteroids-server ./
WORKDIR asteroids-server

RUN yarn
RUN yarn build

EXPOSE 3001
CMD ["node", "dist/server.js"]
