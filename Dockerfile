FROM node:10

WORKDIR app
COPY asteroids-server ./

RUN yarn
RUN yarn build

EXPOSE 3001
CMD ["node", "dist/server.js"]
