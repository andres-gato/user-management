# User Management System

A modern React + TypeScript + TailwindCSS application that demonstrates a complete mock user funnel:

- User authentication (sign up, sign in, sign out)
- Profile capture (first name, last name, email)
- Friend invitations via unique referral links
- Referral conversion attribution back to the inviter
- Conversion rate tracking from invite lifecycle events

The project uses `localStorage` as a mock persistence and analytics layer, with unit tests for core services and UI workflows.

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- Vitest + Testing Library
- ESLint + Prettier
- `localStorage` (mock database/session/tracking)

## Core Features

### Authentication + Profile

- Sign up collects:
  - `firstName`
  - `lastName`
  - `email`
  - `password`
- Sign in validates existing credentials
- Sign out clears local session
- Session restore on reload via stored user ID
- Signed-in header shows full profile name + email

### Friend Invitation System

- Signed-in users generate unique invite links
- Each invite link includes a `ref` query code
- Invite list displays status:
  - `Pending`
  - `Redeemed`
- Copy actions:
  - Copy latest generated invite link
  - Copy link for each pending invite row
  - Temporary `Copied` button state for polished UX

### Conversion Attribution + Tracking

- Referral code is captured from URL when the app loads
- On successful referred sign-up:
  - conversion is attributed to inviter
  - invite is marked redeemed
  - `ref` query param is removed from the browser URL
- Stats per referrer:
  - `totalInvites`
  - `redeemedInvites`
  - `conversionRate = redeemedInvites / totalInvites`

## Referral Flow

1. Inviter creates an invite link.
2. Friend opens the link with `?ref=<inviteCode>`.
3. App captures and stores referral code.
4. Friend signs up.
5. System attributes conversion to inviter, redeems invite, and removes `ref` from URL.
6. Conversion metrics update in UI/services.

## Project Structure

```text
src/
  api/
    mockApi.ts
  auth/
    authService.ts
    ui/
      AuthPanel.tsx
      SignInForm.tsx
      SignUpForm.tsx
  invitations/
    inviteService.ts
    ui/
      FriendInvites.tsx
  utils/
    id.ts
    storage.ts
```

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Run Tests

```bash
npm test -- --run
```

## LocalStorage Model

- `um_users`: user records (profile + credentials)
- `um_session_userId`: active user session
- `um_invites`: invite records + redemption metadata
- `um_conversions`: attributed conversion records
- `um_referral_code`: captured referral code from incoming URL

## Test Coverage

The test suite validates:

- Auth service behavior (`signUp`, `signIn`, `signOut`)
- Profile field persistence (`firstName`, `lastName`)
- Duplicate-email and invalid-credential handling
- Invite creation and redemption transitions
- Referral attribution and conversion rate calculations
- Referral query cleanup (`ref` removed after conversion)
- UI behavior for auth and invite copy interactions

## Important Notes

- This is a mock/prototype app. Passwords are stored in plaintext in `localStorage` for demonstration only.
- For production, replace local storage with secure backend services:
  - password hashing
  - server-side auth/session management
  - durable analytics/event pipeline
  - secure invite and conversion attribution logic

