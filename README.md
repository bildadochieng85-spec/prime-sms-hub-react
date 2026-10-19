# PrimeSmsHub

PrimeSmsHub is a web application for private SMS verification using virtual phone numbers. It is built with React and Vite, with Firebase Authentication and Firestore for account and data services, and a backend API for number availability, pricing, and purchases.

## Features

- Create an account, sign in, and verify an email address.
- Browse available services and countries, then view service pricing before purchase.
- Purchase virtual numbers and check for incoming SMS messages.
- Track active numbers and review previous activations.
- Fund a wallet through Paystack and see balances and transaction history.
- Manage account profile details and access customer support information.

The dashboard is designed for desktop and mobile screens. Wallet balances and service prices are shown in Kenyan shillings (KES) by default, while the account wallet balance is stored and processed in USD.

## Requirements

- Node.js (use a current LTS release) and npm.
- A Firebase project with Authentication and Cloud Firestore enabled.
- Access to a PrimeSmsHub API backend.
- A Paystack public key for wallet funding.

## Setup

Clone the repository and install its dependencies:

```bash
npm install
npm run dev
```

Vite starts a local development server and reports its URL in the terminal. Create a local `.env` file when you need to override the default backend or Firebase configuration. Do not commit private credentials or secret keys.

## Configuration

The backend defaults to `https://api.primesmshub.space`. Set either `VITE_API_URL` or `VITE_BACKEND_URL` to use another API host.

Firebase configuration can be set using `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. `VITE_FIREBASE_MEASUREMENT_ID` is optional. The application includes Firebase defaults, but a project must be configured with the required Authentication and Firestore services.

Set `VITE_PAYSTACK_PUBLIC_KEY` to provide the Paystack public key. Payment verification and wallet crediting also depend on the configured backend and Firebase security rules.

## Commands

- `npm run dev` — start the local development server
- `npm run build` — create a production build in `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Production

Run `npm run build` to generate the static production assets in `dist/`. Deploy that directory to a static hosting provider configured for a single-page application, including a fallback to `index.html` for client-side routes. Configure the same required environment variables in the hosting provider before building. Use `npm run preview` to test the production build locally before deployment.
