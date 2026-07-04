# GMP Frontend

GMP is a Next.js frontend for the Global Migration Platform. It connects users, agencies, services, applications, messaging, and the admin panel through the GMP GraphQL API.

## Requirements

- Node.js 20+
- npm
- Running backend API from `GPM-SERVER`

## Setup

Install dependencies:

```bash
npm install
```

Create or update `.env.local`:

```bash
REACT_APP_API_URL=http://localhost:3007/graphql
REACT_APP_API_WS=ws://localhost:3007/graphql
NEXT_PUBLIC_API_URL=http://localhost:3007
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3007/graphql
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Run the development server:

```bash
npm run dev
```

The app usually runs at `http://localhost:3000`. If that port is busy, Next.js will offer another port.

## Useful Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Admin Access

The local backend seeds/refreshes the super admin from backend environment variables:

```bash
ADMIN_EMAIL=admin@gmp.com
ADMIN_PHONE=+10000000000
ADMIN_PASSWORD=Admin@123456
```

Use the login form with the admin email or phone plus password. Super admins are redirected to `/_admin`.

## Agency Flow

1. Register as an agency from `/account/join`.
2. The account is redirected to `/mypage?tab=agency`.
3. Create or update agency details in `My Agency`.
4. Agency cards appear in public agency pages after backend status and verification filters allow them.

## Package Manager

This project uses npm. Keep `package-lock.json` as the source of dependency truth.
