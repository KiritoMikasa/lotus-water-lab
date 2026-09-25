# Lotus Water Lab 💧

A self-hosted React/Next.js playground for designing mineral water for filter coffee, tea and sparkling water.

## Deploy

1. Copy `.env.example` to `.env` and set a strong `ADMIN_PASSWORD`.
2. Run:

```bash
docker compose up -d --build
```

3. Open `http://YOUR-SERVER:3000` once to verify it works.
4. Point `lotus.dvsncloud.com` at the container through your Pangolin / Nginx Proxy Manager setup.

The SQLite database lives in `./data/lotus.db` and is persisted by the compose volume.

## Accounts

- **Admin**: configured by `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- **Demo guest**: configured by `GUEST_EMAIL` / `GUEST_PASSWORD`.
- **Guest data** is disposable: it is cleared when the guest signs in and automatically purged after `GUEST_TTL_HOURS` (default 6h). Guests also have profile/experiment limits.
- Admin can create normal or guest accounts, enable/disable them, and delete accounts.

## Chemistry model

The calculator uses the exact stock recipes supplied for this project:

- 9.1 g MgCl₂·6H₂O → 50 ml
- 6.6 g CaCl₂·2H₂O → 50 ml
- 4.5 g KHCO₃ → 50 ml
- 3.8 g NaHCO₃ → 50 ml
- 20 drops = 1 ml
- RO TDS defaults to 12 ppm and is editable.

Elemental-ion calculations are derived from molar masses. Hardness is reported as ppm CaCO₃. Alkalinity is calculated from the bicarbonate stocks. RO TDS is kept separate because a TDS number does not reveal its ion composition.

## Notes for later GitHub/CI/CD

The project is intentionally simple to containerize. A future pipeline can run `npm ci`, `npm run build`, build/push the Docker image and deploy with your preferred self-hosting mechanism. No GitHub secrets are required for the application itself.

## Safety / accuracy note

This is a coffee-water experimentation tool, not a laboratory water-analysis system. The stock recipe values and chemical forms should be verified against the actual labels/purity of the purchased salts before treating calculated concentrations as analytical measurements. Use food-grade / appropriate materials for anything intended for drinking.

### First boot

If `ADMIN_PASSWORD` is empty, the app generates a random first-run admin password and prints it in the container logs. For a public deployment, set a long password in `.env` before first boot. The guest credentials default to `guest@lotus.dvsncloud.com` / `guest`; change `GUEST_PASSWORD` before publishing the demo.
