ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app
EXPOSE 5173
RUN npm install -g pnpm


FROM base as developer
COPY ./app/package.json ./app/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile
# El motivo de copiar estos archivos es que se han hecho algunas configuraciones manuales al instalar dependencias como Tailwind entre otras. No podia simplemente hacer un ```COPY ./app .``` porque no se debe suscribir la carpeta nodes_modules. En el futuro buscare una mejor manera de hacer esto.
COPY ./app/src ./src
COPY ./app/components.json ./app/.env ./app/index.html ./app/postcss.config.js ./app/tailwind.config.js ./app/tsconfig.app.json ./app/tsconfig.json ./app/tsconfig.node.json ./app/vite.config.ts ./app/eslint.config.js ./
CMD ["pnpm","run", "dev", "--host", "0.0.0.0", "--port", "5173"]


FROM base as deploy
COPY ./app/package.json ./app/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile
# El motivo de copiar estos archivos es que se han hecho algunas configuraciones manuales al instalar dependencias como Tailwind entre otras. No podia simplemente hacer un COPY ./app .``` porque no se debe suscribir la carpeta nodes_modules. En el futuro buscare una mejor manera de hacer esto.
COPY ./app/src ./src
COPY ./app/src/ ./app/components.json ./app/index.html ./app/postcss.config.js ./app/tailwind.config.js ./app/tsconfig.app.json ./app/tsconfig.json ./app/tsconfig.node.json ./app/vite.config.ts ./app/eslint.config.js ./
CMD ["pnpm","run", "start"]