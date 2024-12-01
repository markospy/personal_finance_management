ARG NODE_VERSION=latest

FROM node:${NODE_VERSION} as base
WORKDIR /usr/local/app
EXPOSE 5173


FROM base as developer
RUN npm install -g pnpm
COPY ./app .
RUN pnpm install
CMD ["pnpm","run", "dev"]


FROM base as deploy
RUN npm install -g pnpm
COPY ./app .
RUN pnpm install
CMD ["pnpm","run", "start"]