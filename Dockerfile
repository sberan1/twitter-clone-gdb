FROM node:lts-slim

RUN apt-get update -y && apt-get install -y openssl
ENV NODE_ENV=development

# Rest of your Dockerfile...
WORKDIR /app

COPY package*.json ./
RUN rm -rf node_modules
RUN rm -rf build
COPY . .
RUN npm install
RUN npx vite build

EXPOSE 5173

CMD [ "sh", "entrypoint.sh" ]