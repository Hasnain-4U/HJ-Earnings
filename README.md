# HJ Earnings V6

Custom backend: Node.js + Express + MySQL + JWT + bcrypt. Firebase is not used.

V6 updates:
- Daily bonus remains one claim per 24 hours.
- User-facing withdrawal history no longer shows the points-to-Rupees conversion.
- Referral code is loaded from the logged-in account and can be copied/shared.
- Admin dashboard includes user/request counts and approve/reject actions.
- Admin link is shown only for accounts whose login role is admin; API still enforces admin permissions server-side.
- Frontend uses same-origin API and no-store cache headers.

Setup: see START-HERE.txt and backend/README.md.
Ad placement update:
- Top and bottom banner containers on user pages.
- Left and right desktop side-rail containers.
- Every container is labeled Advertisement.
- Replace the placeholder inside adSlot() in frontend/script.js with your approved ad-network tag when you have the ad code.
- Do not claim an ad was watched unless your ad provider supplies a real completion/callback; reward endpoints remain server-side.


## Monetization V9
This build uses high-visibility ad slots (top, bottom, wide-screen sidebars, and selected in-content slots). The slots are placeholders until an approved ad network supplies the real ad code. A $1 eCPM is a target, not a guarantee; actual eCPM depends on traffic GEO, format, viewability, demand, and user behavior. Do not encourage ad clicks or manufacture impressions.

## Monetization V10
The frontend now uses reserved, clearly labelled ad slots (top, content, bottom, left, right) with a viewability-first responsive layout. `frontend/ads-config.js` contains the ad-slot configuration and is disabled by default until an approved ad network provides real code for the production domain.

A $1 eCPM target is an optimization target, not a guaranteed payout. Actual eCPM depends on traffic GEO, ad demand, format, viewability, device and network performance.

Do not use ordinary display-ad clicks/views as a condition for points. Rewarded ads, if used, must use a network-supported rewarded format and its completion callback.
