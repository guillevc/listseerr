<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/icons/listseerr-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="docs/icons/listseerr-light.png">
  <img alt="Listseerr" src="docs/icons/listseerr-light.png" width="150">
</picture>

# Listseerr

**Request movies & shows in Jellyseerr from your favorite lists**

[![CI](https://github.com/guillevc/listseerr/actions/workflows/ci.yaml/badge.svg)](https://github.com/guillevc/listseerr/actions/workflows/ci.yaml)
[![GitHub Release](https://img.shields.io/github/v/release/guillevc/listseerr?include_prereleases)](https://github.com/guillevc/listseerr/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

> [!IMPORTANT]
> This project is in early development. I use it daily and fix issues as I find them, but you may encounter bugs.
>
> Feedback is welcome! [Open an issue](https://github.com/guillevc/listseerr/issues/new) to report bugs or share ideas.

## How It Works

Point Listseerr at your favorite curated lists and it automatically requests those movies and shows in Jellyseerr. Set it and forget it.

> [!TIP]
> Create a dedicated Jellyseerr user without auto-approve permissions. This lets you review requests before approval to avoid media bloat.

> [!NOTE]
> Listseerr skips previously rejected or already available media, so you won't see duplicate requests.

```
┌──────────┐     ┌───────────┐         ┌───────────┐     ┌───────────┐
│  Trakt   │◀────│           │         │           │     │   *arr    │
├──────────┤     │           │ request │ Jellyseerr│────▶│   stack   │
│ StevenLu │◀────│ Listseerr │────────▶│           │     └───────────┘
├──────────┤     │           │         └───────────┘
│  MDBList │◀────│           │               ▲
├──────────┤     └───────────┘               │ approve
│  More... │◀────┘                     ┌─────┴─────┐
└──────────┘                           │   User    │
                                       └───────────┘
```

## Screenshots

_Coming soon_

## Features

- **Multiple List Providers** — Trakt, MDBList, StevenLu, and more
- **Scheduled Processing** — Set it once, runs automatically
- **Docker Ready** — Up and running in minutes
- **Self-Hosted** — Your data stays on your server
- **Dark & Light Theme** — Easy on the eyes, day or night

## Supported Providers

> [!NOTE]
> Listseerr fetches list data directly from each provider's API. Most require a free API key.
>
> Using official APIs ensures reliable integration and faster processing.

| Provider                | Status       | Requirements                                        |
| ----------------------- | ------------ | --------------------------------------------------- |
| **Trakt**               | ✅ Supported | [Free API key](https://trakt.tv/oauth/applications) |
| **MDBList**             | ✅ Supported | [Free API key](https://mdblist.com/preferences/)    |
| **StevenLu**            | ✅ Supported | None                                                |
| **StevenLu variations** | 🗓️ Planned   | None                                                |
| **IMDB**                | 🗓️ Planned   | —                                                   |
| **Letterboxd**          | 🗓️ Planned   | —                                                   |
| **TheMovieDB**          | 🗓️ Planned   | —                                                   |
| **TVDB**                | 🗓️ Planned   | —                                                   |

**Want another provider?** [Request or vote here](https://github.com/guillevc/listseerr/discussions/1)

## Quick Start

> [!TIP]
> Download the config files directly:
>
> ```bash
> mkdir listseerr && cd listseerr
> wget https://raw.githubusercontent.com/guillevc/listseerr/master/deploy/compose.yaml
> wget https://raw.githubusercontent.com/guillevc/listseerr/master/deploy/.env.example -O .env
> ```

### 1. Create `compose.yaml`

```yaml
services:
  listseerr:
    image: ghcr.io/guillevc/listseerr:latest
    container_name: listseerr
    user: ${PUID:-1000}:${PGID:-1000}
    ports:
      - 3000:${PORT:-3000}
    env_file:
      - .env
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### 2. Create `.env`

```properties
PUID=1000
PGID=1000

PORT=3000
LOG_LEVEL=info

# Generate with `openssl rand -hex 32`
ENCRYPTION_KEY=
```

### 3. Start Listseerr

```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) and start adding lists.

## Configuration

| Variable         | Description                                                                            | Docker                   | Local                 |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------ | --------------------- |
| `ENCRYPTION_KEY` | **Required.** Generate with `openssl rand -hex 32`                                     | —                        | —                     |
| `PORT`           | Server port                                                                            | `3000`                   | `3000`                |
| `DATABASE_PATH`  | Path to SQLite database                                                                | `/app/data/listseerr.db` | `./data/listseerr.db` |
| `LOG_LEVEL`      | Logging level (`debug`, `info`, `warn`, `error`)                                       | `info`                   | `debug`               |
| `TZ`             | Timezone ([IANA format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)) | `UTC`                    | System                |
| `PUID` / `PGID`  | User/Group ID for Docker volumes                                                       | `1000`                   | N/A                   |

Override defaults via `.env` file or Docker environment variables.

## Running Locally

**Prerequisites:** [Bun](https://bun.sh) (version in `.bun-version`)

> [!TIP]
> [mise](https://mise.jdx.dev/) users can run `mise install` to set up Bun automatically.

<details>
<summary><strong>Development</strong></summary>

```bash
git clone https://github.com/guillevc/listseerr.git
cd listseerr
bun install

cp .env.example .env.dev
# Edit .env.dev and set ENCRYPTION_KEY

# Run both server and client
bun run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

</details>

<details>
<summary><strong>Production</strong></summary>

```bash
bun install
bun run build

cp .env.example .env
# Edit .env and set ENCRYPTION_KEY

bun run start
```

</details>

<details>
<summary><strong>Docker</strong></summary>

```bash
docker build -t listseerr .

cp .env.docker.example .env.docker
# Edit .env.docker

docker compose up -d
```

</details>

## Password Recovery

**Docker:**

```bash
docker exec -it listseerr bun /app/dist/reset-password.js
```

**Local:**

```bash
bun run password:reset
```

## Roadmap

- [x] Multiple provider support (Trakt, MDBList, StevenLu)
- [x] Scheduled automatic processing
- [x] Dark/Light theme
- [x] Docker support
- [ ] More list providers
- [ ] Notifications

Have an idea? [Open an issue](https://github.com/guillevc/listseerr/issues/new)

## Acknowledgments

- Color scheme: [Flexoki](https://stephango.com/flexoki) by Steph Ango

## License

[MIT](LICENSE)
