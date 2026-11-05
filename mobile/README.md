# Manzu Pharmacy (mobile)

Expo app for the Manzu pharmacy portal. It talks to the `med-version` branch of `manzu-b`. See [PLAN.md](./PLAN.md) for scope, screen mapping, backend gaps and milestones.

## Run

```sh
cp .env.example .env       # set EXPO_PUBLIC_API_URL to the manzu-b base URL
npm install
npx expo start             # scan the QR code with Expo Go, or press a / i
```

On a phone, `EXPO_PUBLIC_API_URL` must be reachable from the device. Use your machine's LAN IP or a tunnel, not `localhost`.

## Checks

```sh
npm run typecheck
npm run lint               # also fails on forbidden endpoints (PLAN.md §4)
```

## Layout

- `src/app/` — Expo Router routes only
- `src/features/<feature>/` — api, types, hooks, screens per feature
- `src/components/ui/` — design system components
- `src/theme/` — tokens taken from the web portal
- `src/api/` — fetch client, error normalisation, React Query and the offline cache
