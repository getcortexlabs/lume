# Lume

A web frontend supporting the search for missing people. Built with Nuxt 4, Vue 3, TypeScript, Vue Router, and Mavis Web. All workflows use fictional examples. Drafts, saved searches, and preferences persist in browser storage; other state remains in memory.

## Language conventions

Use English for code identifiers, comments, documentation, READMEs, test descriptions, commit messages, pull requests, and issues. Routes, query parameter names, and navigation anchors must also be in English. Product interface text remains in Brazilian Portuguese; proper names and user-provided values retain their original language.

## Getting started

Requires Node 22.12 or later.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5190**.

```sh
npm run build        # Type checking and the Nuxt/Nitro server in .output/
npm run preview      # Serve the build at http://127.0.0.1:4188
npm test             # Mock repository contracts and domain invariants
npm run test:render  # HTTP responses, SSR content, and public data isolation
npm run test:e2e     # Playwright journeys, hydration, responsive layouts, and axe
npm run test:ssr     # HTML without JavaScript, concurrent requests, and pre-hydration edits
npm run audit:ui     # Mavis adoption and native control audit
npm run measure:performance # Resource sizes against a production server on port 5191
```

To run browser tests on another machine, install Playwright browsers with `npx playwright install chromium firefox webkit`.

## User journeys

Routes use English: `/cases`, `/cases/:id`, `/guidance`, `/network`, and `/organization`. Search query parameters are `search`, `city`, `age`, `sort`, `dateField`, `from`, `to`, `page`, and `pageSize`. Interface text is in Portuguese. Example: `/cases?city=Suzano&sort=name`.

| Route | Experience |
| --- | --- |
| `/` | Introduction, regional selection, and recent notices |
| `/cases` | Search by name, city, region, and age group; removable filters and sorting stored in the URL |
| `/cases/:id` | Public snapshot, source, review information, sharing, and return to search |
| `/guidance` | Initial guidance and an official reference |
| `/network` | Regional widget and display previews with notice navigation |
| `/preferences` | Preferred region, larger text, stronger contrast, and reduced motion |
| `/sign-in` | Credential-free entry into the session demonstration |
| `/session-expired` | Resume an expired demonstration session and its requested destination |
| `/access-denied` | Public navigation or a simulated reviewer profile |
| `/organization` | Review queue, evidence, simulated AI assistance, decisions, and history |
| `/organization/cases/new` | Four-step intake, validation, simulated authorization, and public preview |
| `/organization/drafts` | Drafts persisted in this browser |
| `/organization/drafts/:id` | Resume and edit a saved draft |
| `/organization/network` | Fictional partners, notice revisions, delivery failures, reconnection, and copy expiration |
| `/organization/simulation` | Simulated latency, outages, read-only permissions, and a conflict on the next write |

To demonstrate the full cycle, create a fictional person, save and resume the draft, submit it for review, approve publication, and open the public notice. Revalidate the publication to produce a new revision or withdraw it. In the network panel, connect a partner for the relevant city to follow revisions. Disconnect the partner before withdrawal to observe pending removal and expiration. The simulation hides expired content; reconnecting fetches the current state and does not restore a withdrawn notice.

Search distinguishes disappearance dates from review dates, includes pagination, and preserves context while navigating between notices. A withdrawn publication shows a message without personal data. Unknown or private records remain unavailable.

## Personal preferences and error recovery

Open `/preferences` from the header or footer to choose a region, larger text, stronger contrast, or reduced motion. Preferences apply without reloading and synchronize between tabs on the same origin. The selected region prefills the homepage and provides an explicit shortcut in search; it never replaces filters from an incoming link. Device-level reduced motion always takes precedence. Rotation starts paused when motion is reduced, and can be started explicitly.

At `/cases`, save up to ten named combinations of public filters. Opening one queries the current mock repository again from page one; no notice snapshots or private URL fields are stored. Duplicate filter combinations are rejected, and each saved search can be removed. These choices are local to this browser, without accounts or cross-device synchronization. Clearing browser data removes them. Unreadable storage is preserved until an explicit change; unavailable storage falls back to session-only state with visible feedback.

The global Nuxt error page offers retry and a return home without displaying internal error messages. Saved drafts survive recovery; unsaved changes are not guaranteed. Use **Testar página de erro** at `/organization/simulation` to exercise the full recovery flow. This deliberate handled error avoids Nuxt's developer overlay; actual unexpected failures still retain normal development diagnostics.

The preference store is created per Nuxt application/request and reads browser storage after hydration. Mavis theme overrides supply control typography, contrast, and motion tokens. Jolt owns animation playback and disposal; Lume connects the local preference to those contracts. Editorial CSS complements the theme for custom reading text and responsive layouts.

### Local data controls

At `/preferences`, searches, preferences, and saved drafts have separate confirmation dialogs. Clearing preferences retains saved searches; clearing searches retains region and reading choices. Draft cleanup targets the named active organization and preserves other organizations, publication decisions, and the current simulation. Switch organizations using the provided link before deleting that organization's drafts. Canceling leaves everything intact. A failed storage write shows an error and does not claim deletion. Unreadable preference storage cannot be selectively cleared because the other category cannot be safely preserved.

The controls affect this browser and origin, including other tabs sharing local storage. They do not erase data on another device or a future server. Existing editors cannot recreate a deleted draft under its old identifier; unsaved new drafts in another tab are not part of a cleanup of already-saved drafts.

### Simulated sessions

The prototype starts with an active demonstration session. Use **Sair da demonstração** in the organization context, or **Simular sessão expirada** and **Simular acesso negado** at `/organization/simulation`. Entry and recovery use `/sign-in`, `/session-expired`, and `/access-denied`; all explicitly describe the simulation and collect no credentials. Public routes stay accessible.

Only a version and status are persisted in `sessionStorage`, independently per tab. The client plugin restores them before route middleware runs, including on direct navigation. A missing value starts the default demonstration; an unreadable value requests entry again. Storage failures are reported as page-only state. Internal sign-out lets the existing editor leave guard save or cancel first. Return destinations are restricted to same-origin organization routes and preserve their query. Choosing the reviewer profile restores the simulated reviewer permission. This is navigation behavior, not authentication or server authorization; the future backend must enforce identity, sessions, and access independently.

### Measured asset performance

The brand now uses responsive WebP sources at 480, 960, and 1536 pixels, with explicit display sizes and asynchronous decoding. The supplied PNG remains the source artwork; the social preview is unchanged. Regenerate the assets with `node scripts/optimize-brand.mjs` when `cwebp` is installed. Encoding is lossless after resizing; the full-size variant retains the source dimensions.

Production measurements on localhost at 390 × 844, DPR 1, with a fresh browser page per route and a 1.2-second observation window:

| Route | Resource bytes before | Resource bytes after | Reduction |
| --- | ---: | ---: | ---: |
| `/` | 1,854,785 | 1,094,396 | 41.0% |
| `/cases` | 1,847,424 | 1,087,028 | 41.2% |
| `/organization` | 1,854,078 | 1,093,667 | 41.0% |

These are decoded resource-body bytes, including fonts, scripts, CSS, and images; they exclude the HTML document and do not measure compressed transfer, real-user latency, or a Lighthouse score. Image bytes dropped from 823,168 to 57,626 in this profile. Higher-density screens select larger variants. The home JavaScript grew by 5,153 bytes with the new session/data features, already included in the net reduction above. Run `LUME_TEST_URL=http://127.0.0.1:5191 npm run measure:performance` against a running production build to reproduce the method. Mavis' full icon font and global component plugin remain significant shared costs; this delivery does not replace their supported contracts with private imports or fork the library.

In the review queue, Antônio Lima has a fictional conflict between sources. Correct the field or accept an evidence-backed suggestion before publishing. Possible duplicates are suggested using names or municipalities, similar ages, and nearby dates; records are never merged automatically. New submissions start with manual review.

For a shorter demonstration, open `/organization`, select Beatriz Santos, provide a reason, confirm the review, and approve publication. The notice appears in search and the network preview. Withdraw it with a new reason to remove it from both. The mock blocks republication and rejects decisions based on stale revisions.

In the public experience, filter and sort at `/cases`, open a notice, and return to the previous search. Context stays in the URL and survives reloads. Each filter chip can be removed independently. Sorting distinguishes recent review, recent disappearance, and name. Sharing opens an explicitly fictional preview with copyable text and a link. The shared link excludes search parameters. If clipboard access is denied, the fields support manual selection. No messages are sent to external services.

Drafts are saved automatically in `localStorage` and shared between tabs on the same origin, with revision checks. Publication decisions, history, and partners remain in memory and reset on reload. The organization area has a client-side session demonstration without real authentication. It accepts no real tips, submissions, or documents. There are no AI calls, crawlers, external APIs, external notifications, external synchronization, or location collection. Views communicate with mocks through a simulated local HTTP transport. The configurator at `/organization/displays` generates working embed code for local examples; it does not synchronize separate application instances.

## Guided pilot, organizations, and distribution

- `/organization/settings`: switch between Horizonte and Aurora. Each organization has its own cases, sources, tips, network, permissions, and notifications. Drafts use separate local storage keys. Switching unmounts the previous page and rejects late responses. This simulates isolation; real authorization must be enforced by the server.
- `/organization/notifications`: actionable local events, individual or bulk read actions, and an unread filter. Repeating a command with the same idempotency key does not duplicate notifications. There is no email or push delivery.
- `/organization?status=in_review&case=beatriz-santos`: URL-based selection and filtering, previous/next navigation, and Alt + arrow shortcuts. Shortcuts ignore fields, dialogs, and pending changes. Evidence highlighting marks a single literal occurrence rendered as escaped text.
- `/organization/displays`: city and interval configuration, URLs, and iframe code. `/embed` and `/screen` are standalone surfaces without the portal header or footer. The `city`, `interval`, and `organization` parameters are validated against allowlists.
- `/organization/guide`: tracks five steps using the simulation's current state. The imported record is prepared in advance; review, publication, tip handling, and withdrawal require explicit actions. Reset requires confirmation and affects only the current organization. Drafts are preserved by default; deleting them is a separate option.

Displays revalidate every 20 seconds and grant each copy a 60-second validity window. Without another successful query, personal data is hidden. Rotation can be paused and starts paused when reduced motion is preferred. Changing regions invalidates stale responses. Timers and event handlers are removed on navigation. These pages render on the client so validity starts with a local query, without embedding a personal snapshot in static HTML.

Publication changes synchronize within the same application instance. A new tab, iframe, or device starts its own examples; there is no external synchronization. Reloading restores Horizonte, except on `/embed` and `/screen`, which respect an explicit organization parameter. Drafts survive reloads separately for each organization. Do not use real personal data.

`createWorkspaceServices` delegates existing contracts to the active service graph. Each graph is created per application and organization. Resetting also invalidates stale draft writes. Notifications have their own contract for a future adapter, but there is no notification HTTP endpoint, backend authentication, or backend organization selection yet. Real integration must include these boundaries in the server contract.

## Continuity and follow-up

- **Drafts:** autosave after 700 ms, pending/saved feedback, recovery after reload, and a warning before closing with pending changes. Internal navigation attempts to save before leaving; failures remain visible without discarding fields. Use fictional data only. Clearing browser data deletes drafts.
- **Persistence:** `DraftStore` is injected at composition time. The adapter validates local data, rejects stale revisions across tabs, and preserves corrupted storage rather than overwriting it. UUIDs prevent identifier reuse. This is a local simulation without cross-device synchronization or distributed transaction guarantees across tabs.
- **History:** the review comparison shows changes between the current and a previous revision, including status, public fields, reviewer, and reason. Snapshots remain private and are excluded from the public Nuxt payload.
- **Posters:** `/cases/:id/poster` includes a locally generated QR code, source, revision, demonstration notice, and A4 print styles. The print/PDF action uses the browser dialog and revalidates publication before opening. Withdrawal removes the poster during the session. Printed copies cannot be updated; the QR code points to the current notice. A localhost URL is only accessible on the same device.
- **Follow-up:** `/organization/tasks` collects initial reviews, publications reviewed more than 24 hours ago, sources unavailable or not updated for 72 hours, and distribution problems. These thresholds are for demonstration. Actions open the relevant review or channel; simulated source recovery resolves its task without contacting external services.
- **Source timestamps:** checking a source and a source updating its information are separate events. A source failure does not change a person's status or confirm that they have been found.

QR codes use [node-qrcode](https://github.com/soldair/node-qrcode), loaded only on the poster route. There is no external QR generation service.

## Sources, withdrawals, and private tips

- `/organization/sources`: create or edit a fictional source, assign responsibility, configure a 1–168-hour interval, and activate it. Inspect imported, duplicate, and conflicting records with direct access to review. A query updates the attempt timestamp and, on success, the last successful query; it preserves the source's own update timestamp. Recovery is explicitly simulated and never requests the configured URL.
- `/organization/drafts`: duplicate drafts with authorization cleared, or delete them after confirmation. Conflicts show local values and values from another tab. Independent edits can be combined; fields changed on both sides require a choice. Users can adopt the saved revision or copy local edits, including after another tab deletes the draft.
- `/organization/withdrawals`: track each notice and channel, distinguishing confirmed withdrawal, pending removal, expired validity without confirmation, and no delivery. Manual retries and channel navigation are available; a suggested retry date is not a scheduled job.
- `/organization/tips`: receive a fixed fictional sample, review it, simulate forwarding to demonstration recipients, and simulate acknowledgment. No public form accepts real tips. Original text, uncertainty, and approximate times are preserved. Receipt, forwarding, and acknowledgment are distinct states with private revision history.
- `/organization/simulation`: the HTTP panel lists up to 20 methods, paths, and response codes without bodies or search values. Permissions, latency, outages, and conflicts also affect these workflows.

`src/shared/http/client.ts` defines a Nuxt-independent client. `src/app/http/http-repositories.ts` implements repository contracts using it. `mock-http-transport.ts` receives Request objects and returns Response objects in process: **it does not use network fetch, a service worker, or a business backend**. The simulation covers 200/201/204, 403, 404/410, 409, 422, and 503 responses, pagination, and idempotent retries. Local event subscriptions are a separate interface for future invalidation, polling, or server events.

## Architecture

```text
src/
  app.vue                 # Nuxt shell with NuxtPage
  pages/                  # English Nuxt routes delegating to module views
  plugins/                # Mavis, per-app/request services, and public payload
  app/                    # Theme, composition, and injected HTTP adapters
  modules/
    cases/
      domain/             # Types, filters, and CaseRepository contract
      data/               # Fixtures and mock adapter
      composables/        # Reactive queries and lifecycle coordination
      presentation/       # Choices, URL search context, and sorting
      components/         # Cards, filters, illustrations, and guidance
      views/              # Search and detail pages
      styles/
    home/                 # Introduction and network artwork
    help/                 # Guidance
    network/              # Partner configuration and previews
    review/               # Queue, evidence-backed suggestions, editor, and history
    intake/               # Intake, validation, drafts, and public preview
    sources/              # Source ownership, frequency, and fictional imports
    tips/                 # Simulated private tips and staged forwarding
    operations/           # Derived tasks, deadlines, and fictional source health
    simulation/           # Failure scenarios and simulated permissions
  shared/
    components/           # Header, footer, branding, dialog, and 404
    http/                 # Request/Response client and privacy-preserving diagnostics
    composables/          # Async resources and clipboard
    styles/               # Tokens and visual foundation
contracts/                # Proposed OpenAPI contract for future integration
scripts/                  # Domain and rendering checks
tests/                    # Playwright journeys and accessibility checks
```

Pages compose components. Composables coordinate state and services. The domain does not depend on Vue. Adapters implement data access contracts; components do not import fixtures or call `fetch`. Dependencies are injected for each application, with no user state in singletons.

Mavis alpha.6 provides controls, layouts, and motion surfaces. The hero uses a finite timeline; the network draws SVG connections with Jolt RC.8 `drawPath` and responds to city selection. MStack organizes responsive groups. Cards and calls to action use real Mavis links composed with RouterLink. MReveal replaced AppReveal/useRevealHeight; MDatePicker accepts incomplete drafts directly. The public useMavisTokens replaced the local token generator. Search combines animateLayout with keyed entrances; cards respond to focus and pointer interaction through MotionSurface. The theme is in `src/app/theme.ts`, the original logo is in `public/brand/lume-original.png`, and the tagline remains “Gentileza gera gentileza” (“Kindness inspires kindness”).

## API integration and SSR

Lume uses **Nuxt 4.6.3**, Vue 3.5.44, and Vue Router 5.4.0. Public pages render on the server and hydrate in the browser. `/organization` and its subroutes render on the client while operations remain mocked. There is no business API, authentication, or database.

`src/plugins/lume.ts` creates services per application/request. Only public query results enter the Nuxt payload; the full repository, evidence, internal suggestions, and review history are not serialized. The `resource-hydration` adapter keeps modules independent of Nuxt and reuses initial results during hydration. The theme starts in `light` on both sides. Drafts use a local adapter injected only on the client; other mock state resets on reload.

Unavailable notices and unknown routes return HTTP 404 on direct navigation. Withdrawing a notice during a session removes its public projection but does not persist in the mock server after reload. SSR does not change this limitation. SSR and hydration have been tested with Nitro's `node-server` preset; SSG, other presets, and public deployment have not been validated in this project.

The proposed contract is in [contracts/lume-api.openapi.json](contracts/lume-api.openapi.json). It defines public and private projections, pagination, parameters, errors, expected revisions, and idempotency. The local transport exercises 19 paths without a deployed business endpoint. Tests cover command replay, revision conflicts, and rejection of stale network events, and compare responses against OpenAPI schemas. Endpoints marked `x-demo-only` represent demonstration-only actions.

To integrate the API:

1. Replace the local `createDemoServices` transport with an authenticated network transport. The `CaseRepository`, `SourcesRepository`, `TipsRepository`, and `NetworkRepository` adapters already map calls to Request/Response objects.
2. Preserve per-application/request injection through `AppServices` in the Nuxt plugin. Simulation controls belong to the prototype and must be removed from production composition.
3. Include expected revisions, idempotency keys, domain errors, and decision reasons.
4. Enforce authorization and isolation on the server; the interface is not a security boundary.
5. Replace local repository notifications with the chosen revalidation mechanism.

Real services must preserve per-request initialization, transfer only authorized projections, and implement backend authentication, isolation, cache invalidation, and persistence. The organization area's rendering policy can be revisited once server authentication exists. Simulation controls must not become production features.

`PublicCase` uses an explicit field allowlist. Evidence and history remain in `ReviewCase`. The mock is a development convenience, not a production data protection implementation.

Mavis Web/Core are pinned to **npm release 0.1.0-alpha.6**, and Jolt to **0.1.0-rc.8**. Tag [`v0.1.0-alpha.6`](https://github.com/getcortexlabs/mavis-ui/releases/tag/v0.1.0-alpha.6) resolves to commit `81b6b6b6e6576511755d6ee5a5943d9bcd66e09d`. `vendor/manifest.json` records provenance, and package-lock pins npm URLs and integrity hashes. There are no dependencies on local tarballs or neighboring checkouts.

The migration replaced the native date field, manual pagination, step indicators, pointer calculations, viewport observation, and CSS transitions/layout animation with available library APIs. Domain operations remain fully mocked. Before each release upgrade, run build, domain, SSR, UI audit, and browser checks.

## Hosting and validation

Planned domain: **lume.getcortexlabs.com**. This repository contains a Nuxt/Nitro Node server, not a static export. Public pages use SSR; `/organization/**`, `/embed`, and `/screen` remain client-rendered with `no-store`. The business backend is still mocked: SSR does not mean real APIs have been implemented.

### Deploying with Orbit

Create a **repository-backed web application** in Orbit with:

| Setting | Value |
| --- | --- |
| Repository | `https://github.com/getcortexlabs/lume.git` |
| Branch | `main` |
| Directory | Repository root |
| Strategy | Automatic build / Nuxt |
| Install | `npm ci` (detected from the lockfile) |
| Build | `npm run build` |
| Start | `node .output/server/index.mjs` |
| Port | `3000` |
| HTTP health check | `/` |
| Environment | `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT=3000` |
| Domain | `lume.getcortexlabs.com` |

Orbit's automatic build detects the `nuxt` dependency, uses Node 22, and runs the server in a Kubernetes container. Do not select static files or Space publishing. Orbit manages the image, Kubernetes resources, and routing; this repository does not maintain parallel manifests. Associate the domain with the application in Orbit and configure the corresponding DNS records.

A push only triggers automatic deployment after the application is connected to the repository and that behavior is configured in Orbit. Publishing code to GitHub does not confirm that the service or domain is live.

To serve the SSR build locally, run `HOST=0.0.0.0 PORT=3000 npm start` after `npm run build`. The prototype retains `noindex,nofollow` while it contains examples. Drafts, saved searches, and preferences persist only in the browser; other mock state can reset on reload or application restart.

Nuxt, Jolt, and Mavis packages come from the npm registry. The lockfile was generated by npm. There are no runtime aliases or links to neighboring repositories.

Validation on November 2, 2026 covered **76 scenarios across Chromium, Firefox, and WebKit**: 226 passing executions and two clipboard skips outside Chromium. All 24 new executions passed, covering simulated session entry/recovery, direct route gating, safe return destinations, selective local-data cleanup, cancellation, storage errors, organization isolation, mobile accessibility, and responsive brand sources. Build/type checks, domain tests, HTTP/SSR checks, and the control audit also passed. The session and preference screens and optimized brand were visually inspected at 390 and 1440 px. The local development server uses port 5190.

Checks include organization/request isolation, draft recovery after reset, stale-write rejection, idempotent events, shortcuts, evidence, publication/withdrawal, continuous rotation during revalidation, offline expiration, reduced motion, and pre-hydration edits. Axe covers the new surfaces at 390 and 1280 px, plus existing journeys at 390 and 1440 px. These checks do not replace a comprehensive accessibility audit or physical-device testing.

## Visual direction

The hero combines a paper-colored background, large typography, and an interactive regional network. The original symbol appears in a poster-like composition without diffuse glow. Titles and city controls enter in sequence; Jolt draws the underline. Notices and participation cards respond to pointer and keyboard interaction. “Gentileza gera gentileza” has its own section with line-by-line entrances and a decorative scroll-linked ribbon. Animations respect `prefers-reduced-motion` and release their resources on navigation.

## Mavis adoption

See the [Mavis and Jolt adoption inventory and remaining gaps](docs/mavis-adoption.md). `npm run audit:ui` counts component usage and checks that native HTML controls are not introduced outside explicit adapters. This revision contains **27 Mavis component types and 700 static occurrences, with no custom native HTML controls**. AppDateInput adapts strings and drafts to Mavis date components; NativeDateInput was removed. These counts are not a percentage of application code. Lume's tagline is “Gentileza gera gentileza”.

## Brand assets and link previews

The document head declares the SVG favicon, a multi-resolution ICO fallback, and a 180px Apple touch icon. `public/favicon.svg` is the vector source for the derived icons. To regenerate them after changing the vector, run `node scripts/generate-icons.mjs` with Playwright Chromium installed.

Open Graph and Twitter Card metadata use `public/brand/lume-social.png`, the supplied 1734 × 907 image, without edits. The preview uses the absolute production URL `https://lume.getcortexlabs.com/brand/lume-social.png`; update it in `nuxt.config.ts` if the public domain changes. Metadata is included in the initial HTML, including client-rendered routes. The preview is shared branding and contains no case-specific personal data. Social platforms must be able to fetch the deployed page and image; localhost is not publicly accessible.
