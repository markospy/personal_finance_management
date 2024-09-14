FROM node:latest AS developer
WORKDIR /usr/local/app
COPY ./app/package.json .
RUN pnpm install
EXPOSE 8081
COPY ./app .
CMD ["npx","expo", "start"]