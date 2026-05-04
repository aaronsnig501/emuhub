# Self-Hosting EMU·HUB

EMU·HUB can run in a self-hosted Node mode by building the same SvelteKit app with `SELF_HOSTED=true`.

In self-hosted mode the app enables:

- Private ROM upload and management APIs
- A ROM library UI at `/library`
- Persistent ROM storage on your own hardware at `/data/roms`
- A dedicated save-data mount point at `/data/saves`

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SELF_HOSTED=true` | Yes | Enables the Node adapter build and private ROM endpoints |
| `SELF_HOSTED_API_TOKEN` | Yes | Bearer token required for ROM API access |
| `EMUHUB_ROMS_DIR` | No | Override the ROM storage directory. Default: `/data/roms` |
| `EMUHUB_SAVES_DIR` | No | Override the save storage directory. Default: `/data/saves` |
| `PORT` | No | Server port. Default: `3000` |

## Docker run

Build the image:

```sh
docker build --build-arg SELF_HOSTED=true -t emuhub .
```

Run it:

```sh
docker run --rm \
  -p 3000:3000 \
  -e SELF_HOSTED=true \
  -e SELF_HOSTED_API_TOKEN=change-me \
  -v "$(pwd)/roms:/data/roms" \
  -v "$(pwd)/saves:/data/saves" \
  emuhub
```

Then open `http://localhost:3000`.

## docker-compose

```yaml
services:
  emuhub:
    build:
      context: .
      args:
        SELF_HOSTED: "true"
    environment:
      SELF_HOSTED: "true"
      SELF_HOSTED_API_TOKEN: change-me
      EMUHUB_ROMS_DIR: /data/roms
      EMUHUB_SAVES_DIR: /data/saves
    ports:
      - "3000:3000"
    volumes:
      - ./roms:/data/roms
      - ./saves:/data/saves
```

An optional Postgres service is included in the repository `docker-compose.yml` for future server-backed save-state metadata.

## Volume structure

```text
roms/
  pong.ch8
  invaders.rom

saves/
  # reserved for private save-state data
```

## Reverse proxy

### nginx

```nginx
server {
  listen 80;
  server_name emuhub.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Caddy

```caddyfile
emuhub.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

## Updating

1. Pull the latest code.
2. Rebuild the image.
3. Restart the container or compose stack.

```sh
docker compose build --no-cache
docker compose up -d
```

Your mounted `roms/` and `saves/` directories persist across upgrades.
