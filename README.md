<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="packages/client/public/assets/listseerr-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="packages/client/public/assets/listseerr-light.png">
  <img alt="Listseerr" src="packages/client/public/assets/listseerr-light.png" width="150">
</picture>

# Listseerr

**Automatically sync your favorite Movie & TV lists to Jellyseerr**

[![CI](https://github.com/guillevc/listseerr/actions/workflows/ci.yaml/badge.svg)](https://github.com/guillevc/listseerr/actions/workflows/ci.yaml)
[![GitHub Release](https://img.shields.io/github/v/release/guillevc/listseerr?include_prereleases)](https://github.com/guillevc/listseerr/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

> [!IMPORTANT]
> This project is in its early development stages.
> Although I try to fix everything I encounter as I am using the tool myself, you may encounter some bugs or areas for improvement.
>
> If you have something to share, please go ahead — it will be greatly appreciated! You can [open an issue](https://github.com/guillevc/listseerr/issues/new) if you found a bug or want to share an idea.

## How It Works

Point Listseerr at your favorite curated lists, and it automatically requests those movies and shows in Jellyseerr. Set it and forget it!

> [!NOTE]
> Listseerr won't request previously rejected or already available media in your Plex/Jellyfin instance.
> This avoids having to reject multiple times the same media and lets you focus on what's new.

```mermaid
flowchart LR
    subgraph Providers[List Providers]
        T[Trakt.tv]
        M[MDBList]
        O[More...]
    end

    L[Listseerr] -->|fetches lists| Providers
    L -->|requests media| J[Jellyseerr]
    U[User] -->|approves/rejects requests| J
    J --> A["Your *arr stack"]

    style T fill:#A02F6F,stroke:#8a2860,color:#fff
    style M fill:#205EA6,stroke:#1a4e8a,color:#fff
    style O fill:#555555,stroke:#333333,color:#fff,stroke-dasharray: 5 5
    style L fill:#24837B,stroke:#1d6b65,color:#fff
    style J fill:#5E409D,stroke:#4d3580,color:#fff
    style U fill:#66800B,stroke:#526608,color:#fff
    style A fill:#1C1B1A,stroke:#000000,color:#fff
    style Providers fill:#1C1B1A,stroke:#000000,color:#fff
```

## Screenshots

<!-- Screenshots coming soon -->

_Screenshots coming soon_

## Features

- **🔄 Automatic Syncing** — Keep your Jellyseerr requests in sync with your favorite lists
- **📋 Multiple List Providers** — Import from Trakt, Letterboxd, IMDB, and more
- **⏰ Scheduled Processing** — Set it once, runs automatically on your schedule
- **🐳 Docker Ready** — Up and running in minutes with Docker Compose
- **🖥️ Self-Hosted** — Your data stays on your server
- **🌙 Dark & Light Theme** — Easy on the eyes, day or night

## Supported Providers

| Provider                        | Status       |
| ------------------------------- | ------------ |
| 🎬 **Trakt**                    | ✅ Supported |
| 📝 **MDBList**                  | ✅ Supported |
| ⭐ **StevenLu**                 | ✅ Supported |
| ⭐ **IMDB**                     | Planned      |
| 🎥 **Letterboxd**               | Planned      |
| 🎞️ **TheMovieDB**               | Planned      |
| 🎞️ **TVDB**                     | Planned      |
| 🎞️ **AniList**                  | Planned      |
| 🎞️ **StevenLu List variations** | Planned      |

🗳️ **Want another provider?** [Request or vote for new providers](https://github.com/guillevc/listseerr/discussions/1#discussion-9264033)

## Quick Start

The fastest way to get started is with Docker Compose.

### 1. Create your project directory

```bash
mkdir listseerr && cd listseerr
```

### 2. Create a `compose.yaml` file

```yaml
services:
  listseerr:
    image: ghcr.io/guillevc/listseerr:latest
    container_name: listseerr
    user: ${PUID:-1000}:${PGID:-1000}
    ports:
      - '3000:3000'
    environment:
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - LOG_LEVEL=info
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### 3. Generate an encryption key and create `.env`

```bash
# Generate a secure encryption key
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" > .env
```

### 4. Start Listseerr

```bash
docker compose up -d
```

🎉 **That's it!** Open [http://localhost:3000](http://localhost:3000) and start adding your lists.

## Running Locally

<details>
<summary><strong>🛠️ Development Mode</strong></summary>

### Prerequisites

- [Bun](https://bun.sh) (v1.1.3+)

> [!TIP]
> If you are a [mise](https://mise.jdx.dev/) user, you can `cd` into the root of the project and run `mise install`.
> It will install the version defined in `.bun-version`.

### Setup

```bash
# Clone the repository
git clone https://github.com/guillevc/listseerr.git
cd listseerr

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.dev
# Edit .env.dev and set your ENCRYPTION_KEY (generate with: openssl rand -hex 32)

# Run database migrations
bun run db:migrate
```

### Start Development Servers

You'll need two terminal windows:

**Terminal 1 — Backend:**

```bash
bun run dev:server
```

**Terminal 2 — Frontend:**

```bash
bun run dev:client
```

- Frontend: [http://localhost:5173](http://localhost:5173) (with hot reload)
- Backend API: [http://localhost:3000](http://localhost:3000)

</details>

<details>
<summary><strong>🚀 Production Mode (Local Build)</strong></summary>

```bash
# Install dependencies
bun install

# Build the application
bun run build

# Set up environment
cp .env.example .env
# Edit .env and configure your settings

# Start the server
bun run start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

</details>

<details>
<summary><strong>🐳 Building Docker Image Locally</strong></summary>

```bash
# Build the image
docker build -t listseerr .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e ENCRYPTION_KEY=$(openssl rand -hex 32) \
  -v ./data:/app/data \
  --name listseerr \
  listseerr
```

</details>

## Configuration

These are the required ENV variables for running the project. All other settings can be tuned from the web app Settings page.

| Variable         | Description                                                                                        | Default                  |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| `ENCRYPTION_KEY` | **Required.** 32-byte hex key for encrypting API credentials. Generate with `openssl rand -hex 32` | —                        |
| `PORT`           | Server port                                                                                        | `3000`                   |
| `DATABASE_PATH`  | Path to SQLite database file                                                                       | `/app/data/listseerr.db` |
| `LOG_LEVEL`      | Logging verbosity (`debug`, `info`, `warn`, `error`)                                               | `info`                   |
| `PUID` / `PGID`  | User/Group ID for Docker volume permissions                                                        | `1000`                   |

## Roadmap

- [x] Core list syncing functionality
- [x] Multiple provider support (Trakt, MDBList, StevenLu)
- [x] Dark/Light theme
- [x] Docker support
- [x] Scheduled automatic syncing
- [x] Sync history and logs
- [ ] More list providers
- [ ] Notifications (Discord, webhooks)

Have an idea? [Share it in Discussions](https://github.com/guillevc/listseerr/discussions/categories/ideas)!

## License

[MIT](LICENSE)
