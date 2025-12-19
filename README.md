<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="packages/client/public/assets/listseerr-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="packages/client/public/assets/listseerr-light.png">
  <img alt="Listseerr" src="packages/client/public/assets/listseerr-light.png" width="150">
</picture>

# Listseerr

**Automatically sync your favorite Movie & TV lists to Jellyseerr**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/guillevc/listseerr/actions/workflows/ci.yaml/badge.svg)](https://github.com/guillevc/listseerr/actions/workflows/ci.yaml)
[![GitHub Release](https://img.shields.io/github/v/release/guillevc/listseerr?include_prereleases)](https://github.com/guillevc/listseerr/releases)

</div>

## Screenshots

<!-- Screenshots coming soon -->

_Screenshots coming soon_

## Features

- **🔄 Automatic Syncing** — Keep your Jellyseerr requests in sync with your favorite lists
- **📋 Multiple List Providers** — Import from Trakt, Letterboxd, IMDB, and more
- **🐳 Docker Ready** — Up and running in minutes with Docker Compose
- **🖥️ Self-Hosted** — Your data stays on your server
- **🌙 Dark & Light Theme** — Easy on the eyes, day or night

## Supported Providers

| Provider          | Status       |
| ----------------- | ------------ |
| 🎬 **Trakt**      | ✅ Supported |
| 📝 **MDBList**    | ✅ Supported |
| ⭐ **IMDB**       | ✅ Supported |
| 🎥 **Letterboxd** | Soon         |
| 🎞️ **TheMovieDB** | Soon         |

🗳️ **Want another provider?** [Request or vote for new providers](https://github.com/guillevc/listseerr/discussions/categories/ideas)

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

If you have [mise](https://mise.jdx.dev/) installed, you can cd into the root of the project and run `mise install`.

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

| Variable         | Description                                                                                        | Default                  |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| `ENCRYPTION_KEY` | **Required.** 32-byte hex key for encrypting API credentials. Generate with `openssl rand -hex 32` | —                        |
| `PORT`           | Server port                                                                                        | `3000`                   |
| `DATABASE_PATH`  | Path to SQLite database file                                                                       | `/app/data/listseerr.db` |
| `LOG_LEVEL`      | Logging verbosity (`debug`, `info`, `warn`, `error`)                                               | `info`                   |
| `PUID` / `PGID`  | User/Group ID for Docker volume permissions                                                        | `1000`                   |

## Roadmap

- [x] Core list syncing functionality
- [x] Multiple provider support (Trakt, Letterboxd, MDBList, IMDB, TMDB)
- [x] Dark/Light theme
- [x] Docker support
- [ ] Scheduled automatic syncing
- [ ] Sync history and logs
- [ ] Notifications (Discord, webhooks)
- [ ] More list providers
- [ ] Multi-user support

Have an idea? [Share it in Discussions](https://github.com/guillevc/listseerr/discussions/categories/ideas)!

## Contributing

Contributions are welcome! Whether it's bug fixes, new features, or documentation improvements — all help is appreciated.

- 🐛 **Found a bug?** [Open an issue](https://github.com/guillevc/listseerr/issues/new)
- 💡 **Have an idea?** [Start a discussion](https://github.com/guillevc/listseerr/discussions/new?category=ideas)
- 🔧 **Want to contribute code?** Fork the repo and submit a pull request

---

## License

[MIT](LICENSE)
