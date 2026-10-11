# WORKZY

WORKZY is a mobile-first local services marketplace for Chennai. This version is intentionally local-only: profiles, worker listings, bookings, reviews, reports, and catalogue changes are stored in the current browser's IndexedDB.

## Run locally

Requirements: Bun.

```sh
bun install
bun run dev
```

No environment file, database, or external account is needed. `bun run build` creates a static production build.

## Try from a phone

Run `bun run dev:lan` on the Mac, then use **Share to phone** in WORKZY to show a QR code, or open `http://<mac-wifi-ip>:5173/` in the phone's browser. Find the Mac's current Wi-Fi IP in macOS System Settings → Wi-Fi → Details, and keep both devices on the same Wi-Fi. Each browser has separate local data, so create or sign in to test accounts on the phone itself. Demo worker login: `demo.meena@workzy.local` / `workzy-demo`.

Some mobile browsers restrict precise location on local HTTP pages; service-area selection remains available if the location prompt is blocked.

## Local mode boundaries

- Each browser profile has its own data. There is no cloud sync or cross-device sharing.
- Authentication is local to this browser. Passwords are PBKDF2-hashed before storage, but client-side roles are not a secure access boundary. Do not use real customer credentials or personal data in this mode.
- A local admin account can be created from the registration screen for testing; this is not protected administrator provisioning.
- Clearing site data removes local accounts and marketplace records. Export/import and recovery are not provided.
- No real workers or reviews are preloaded. The initial categories, languages, and Chennai areas are catalogue options only.
- Eight sample worker accounts are added to make the directory and booking workflow explorable. They are always labelled `Demo · not verified`, have no sample reviews, and must not be mistaken for real providers. Demo login: `demo.meena@workzy.local` / `workzy-demo`; the same password works with all `demo.*@workzy.local` worker accounts.
- Real worker profiles remain out of customer search until a local admin approves them. Demo profiles are the clearly labelled exception so the directory and booking flow can be explored. Approval is a product workflow, not identity or background verification.
- The location panel opens Google Maps searches for a selected Chennai area. The optional current-location button asks permission only when tapped and opens Google Maps at the device coordinates. It does not calculate worker distances because worker profiles store service areas, not coordinates. Google Maps URLs need no API key; an embedded Maps API view would require a Google Cloud API key.
- Payments are arranged directly between the customer and worker. WORKZY does not process payments or expose phone numbers.

## Main flows

- Create customer, worker, or local admin accounts; sign in, sign out, and reset a local password with the account email and phone.
- Workers create service profiles, rates, language and area selections, availability, and profile photos.
- A local admin reviews worker profiles and manages categories, languages, service areas, user status, and reports.
- Customers search approved workers, filter the directory, request bookings, and review completed work.
- Workers accept/reject requests and complete accepted bookings. Booking transitions, reports, reviews, and notifications are stored locally.
