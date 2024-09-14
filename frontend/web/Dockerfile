FROM node:latest AS developer
WORKDIR /usr/local/app
COPY ./app/package.json .
RUN pnpm install
EXPOSE 5173
COPY ./app .
CMD ["pnpm","run", "dev"]