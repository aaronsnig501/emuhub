FROM node:20-alpine AS builder
WORKDIR /app

ARG SELF_HOSTED=true
ENV NODE_ENV=production
ENV SELF_HOSTED=${SELF_HOSTED}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV SELF_HOSTED=true
ENV EMUHUB_ROMS_DIR=/data/roms
ENV EMUHUB_SAVES_DIR=/data/saves

RUN mkdir -p /data/roms /data/saves

COPY --from=builder /app/build ./build

VOLUME ["/data/roms", "/data/saves"]
EXPOSE 3000

CMD ["node", "build"]
