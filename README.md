# PrimeSmsHub

PrimeSmsHub is a React and Vite web app for private SMS verification. Users can browse number services, purchase virtual numbers, view received SMS, manage wallet funds, and review transaction history.

## Requirements

- Node.js and npm
- Firebase project for authentication and Firestore
- PrimeSmsHub API backend

## Setup

```bash
npm install
npm run dev
```

The app uses `https://api.primesmshub.space` by default. Set `VITE_API_URL` or `VITE_BACKEND_URL` to use another backend. Firebase settings can be provided with `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, and optionally `VITE_FIREBASE_MEASUREMENT_ID`. Set `VITE_PAYSTACK_PUBLIC_KEY` to configure the Paystack public key.

## Commands

- `npm run dev` — start the local development server
- `npm run build` — create a production build in `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
