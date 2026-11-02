# Mavis adoption in Lume

Reviewed on November 2, 2026. Mavis Web/Core **0.1.0-alpha.6** and Jolt **0.1.0-rc.8** are installed from npm with exact versions. The Mavis tag points to `81b6b6b6e6576511755d6ee5a5943d9bcd66e09d`. `vendor/manifest.json` records provenance, and the lockfile preserves package URLs and integrity hashes. No neighboring checkout was modified.

## Current usage

The audit reports **27 Mavis component types, 700 static occurrences, and no custom native HTML controls** across 95 Vue components. This count is not a percentage of code or visual authorship: extracting a reusable composition can reduce static occurrences while expanding component reuse.

## What alpha.6 replaced

| Previously in Lume | Current implementation |
| --- | --- |
| AppReveal + useRevealHeight | Direct MReveal usage: automatic height, closing presence, reversal, focus, and reduced motion. Both local files were removed. |
| MInput fallback for incomplete dates | MDatePicker with a controlled `draft`. Partial dates persist while the calendar remains available. |
| Calendar readiness CSS | Mavis waits for hydration before enabling calendar actions. |
| Local useMavisTokens generator and `--lume-*` variables | Public useMavisTokens and `--m-color-*`, `--m-space-*`, `--m-radius-*`, and `--m-type-*` variables. |
| Card inside RouterLink with custom link styling | MCard with `href` and `navigate`, composed through RouterLink's custom slot: one real anchor with Mavis press feedback. |
| Custom hero calls to action | MButton with real navigation and MLink in the regional caption. |
| Custom flex layout in selected groups | MStack for hero actions, participation options, and the results toolbar. |
| CSS hero entrance | Finite useMavisWebMotion timeline targeting application-owned HTML wrappers. |
| SVG stroke-dashoffset and CSS keyframes | Three continuous paths controlled by `scope.drawPath`. Selecting a city draws its path and retracts the others. |
| Separate list runtime | MBox region with a borrowed scope: animateLayout on outer wrappers and animateItems on inner wrappers, keyed by notice. |
| Handwritten viewport directive | Jolt's createViewportEnterDirective, created per component with stable inputs and readable SSR content. |
| CSS competing with card transforms | MotionSurface for card hover/focus, composed with Mavis press feedback. |

## Visual refinement and motion

- The tagline, heading, actions, and context enter in sequence. Text retains full contrast during motion.
- The network responds to city selection, pointer movement, and touch. The symbol pulses briefly and the caption follows the selection. The scene is illustrative; fictional counters are not presented as real impact.
- Jolt's geometry observation tracks text, font, and width changes on animated HTML surfaces.
- Notices retain their keys during filtering and sorting. Layout and entrance animations target separate wrappers without competing with the card's press surface.
- Administrative feedback uses OperationFeedback, composing Reveal, Card, Icon, and Text without changing domain decisions.
- Display rotation uses useContentTransition through Jolt's Vue adapter. Expiration, pause, and withdrawal remain application decisions.
- Entrance, exit, and press durations come from the Mavis theme. Brand-specific sequences use finite, cancelable product timings.

Reduced-motion preferences are respected. Hero choreography avoids text fades, and motion does not block navigation. There are no infinitely looping decorative animations. Resources and additional watchers are released with the scope. Entrance directive options retain their identity across renders, avoiding observer recreation during layout updates.

## Editorial composition and scrolling

The homepage uses a paper-colored background, strong headings, poster-like notice borders, and a graphic network without glassmorphism or diffuse glow. The original symbol is preserved; CSS produces a monochrome version for the network.

The hero enters line by line and draws its underline with drawPath. Application-owned HTML wrappers receive the animation; nested MText components retain Mavis typography and content contracts. Cities enter sequentially in wrappers separate from their buttons. Entrance wrappers for notices and participation options have fixed origins: their translations do not depend on a center that changes at a breakpoint. CareJourney reuses MotionSurface for hover and focus.

useKindnessMotion applies viewportEnter to the two statement lines and scrollLinked to the decorative ribbon. The ribbon follows reading rather than a timer or infinite playback. Repeated text is aria-hidden, while the actual heading remains accessible. The Mavis scope releases resources on navigation. MThemeProvider establishes MLink contrast on both dark surfaces.

## What remains in the application

**Product composition:** useHeroMotion, useConnectionMotion, useCardEmphasis, useListLayout, useContentTransition, useKindnessMotion, and CareJourney define which elements respond, when, and why. Mavis/Jolt handle interpolation, path drawing, press feedback, observation, interruption, and disposal. These composables are neither alternative engines nor missing library features.

**Identity and editorial layout:** notice grids, fluid typography, proportions, backgrounds, and network positioning remain in Lume CSS. MStack supports responsive stacks and wrapping; it is not a general grid API. textStyle/flowStyle/cardStyle still translate older editorial overrides. The token generator was removed, but these helpers can be reduced gradually.

**Data and navigation:** AppDateInput converts domain strings to CivilDate/null and distinguishes valid search input from drafts. AppSelect adapts the selection contract. RouterLink still owns destinations, history, and query parameters; Mavis renders the new links. There is no need to replace the router.

**Action-specific focus:** the detail page still prepares focus for its dialog triggers. The built-in calendar fix does not eliminate this composition from every application dialog.

**Preferences and recovery:** saved searches, persistence, preferred region, and error recovery are application behavior. Their controls use Mavis. `useAccessibleTheme` derives typography, contrast, and motion tokens for the root and dark surfaces. `useLumeWebMotion` cancels application choreography through a child scope when motion is reduced, without reconfiguring Mavis' borrowed runtime. Entrance directives and content transitions configure their own Jolt runtimes. Editorial CSS handles text outside Mavis tokens and gives mobile notices one column with larger text. Pagination is constrained to its container so Mavis' wrapping row remains usable with enlarged labels.

## Updated upstream opportunities

### Mavis

- **MStack.responsive in Safari:** changing direction during size observation reproduced `ResizeObserver loop completed with undelivered notifications`. This delivery uses MStack wrapping and stable flex bases, preserving mobile adaptation without suppressing browser errors. Breakpoint layout updates need to avoid this cycle in Mavis.
- Responsive grids differ from MStack. A grid contract could replace some editorial grids if consumers share that need.
- A general trigger/dialog pattern could remove the remaining focus preparation in detail-page actions.
- Additional shared motion recipes and parameters could reduce repeated values. Entrance, exit, and press tokens already exist and should not be listed as missing.

Button/Card links, public tokens, Reveal height animation, DatePicker text drafts, and calendar readiness have been removed from the gap list.

The session and local-data flows compose MCard, MText, MButton, MRow/MColumn, and MSheet. Confirmation copy remains mounted during the closing animation. Session routing, draft cleanup, and responsive brand sources belong to Lume. The full icon font and the global `createMavis` component registration remain shared payload costs; optional registration and icon delivery could be evaluated upstream without changing the existing application contracts.

### Jolt Web

SVG path drawing is no longer a gap: drawPath is available in RC.8 and is in use. animateSize, animateLayout, animateItems, viewport, pointerFollow, timelines, states, and scopes are also available. No additional mandatory engine capability was identified for this delivery.

Contract boundaries still matter: drawPath draws one continuous contour per target and does not morph geometry; SVG composition is specific to Web. These boundaries do not prevent the current network experience and do not automatically constitute feature requests.

## Verification

Build/type checks, domain tests, HTTP/SSR checks, and the control audit are covered. Playwright exercises Chromium, Firefox, and WebKit: real links and keyboard navigation, rapid city changes, resizing, reduced motion, mobile layout, Reveal, partial dates, hydration, and existing workflows. Axe covers pages and the calendar.

Rotation and expiration tests fix only Date. Timers and the document/WAAPI clock remain real, avoiding a real animation clock combined with artificially advanced performance/RAF. Assertions wait for the actual interval result and transition completion.
