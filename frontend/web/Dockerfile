ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app
EXPOSE 5173
RUN npm install -g pnpm


FROM base as developer
COPY ./app/package.json ./app/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile
COPY ./app .
CMD ["pnpm","run", "dev", "--host", "0.0.0.0", "--port", "5173"]


FROM base as deploy
COPY ./app/package.json ./app/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile
COPY ./app .
CMD ["pnpm","run", "start"]