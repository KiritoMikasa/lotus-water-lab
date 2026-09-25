# Deploy checklist

```bash
cp .env.example .env
nano .env

docker compose up -d --build
docker compose logs -f --tail=100
```

The app listens on TCP 3000. In Nginx Proxy Manager, proxy `lotus.dvsncloud.com` to the server on port 3000 and enable your usual TLS certificate. In Pangolin, expose the same upstream according to your existing proxy/tunnel setup.

No application-level base URL needs to be configured for `lotus.dvsncloud.com`; Next.js works behind the reverse proxy.

## Updating

```bash
git pull
docker compose up -d --build
```

The database is persisted under `./data`.
