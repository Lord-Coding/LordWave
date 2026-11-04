# Audit: Unused files in `src/` — LordWave (Expo / React Native)

**Scope:** Every file under `c:\Users\lxrdf\Desktop\LordWave\src` (`app/`, `components/`, `components/ui/`, `constants/`, `hooks/`, `global.css`), cross-referenced against the whole workspace (`src/` + root config: `app.json`, `tsconfig.json`, `package.json`). Read-only investigation; nothing was modified.

**Splash-screen exclusion:** Files whose primary purpose is the splash screen were excluded from the analysis per the brief. Those are `src/components/animated-icon.tsx`, `src/components/animated-icon.web.tsx`, and `src/components/animated-icon.module.css`. They are in fact *used* (see Caveats) — they are simply not part of this report.

---

## Summary answer

Of the 14 non-splash files in `src/`, **3 are unused** — never imported or referenced anywhere in the codebase, and not reachable from any entry point:

| Unused file | Exports | Why it's dead |
| --- | --- | --- |
| `src/components/hint-row.tsx` | `HintRow` | Zero importers; the `HintRow` symbol appears only in its own definition. |
| `src/components/web-badge.tsx` | `WebBadge` | Zero importers; the `WebBadge` symbol appears only in its own definition. |
| `src/components/ui/collapsible.tsx` | `Collapsible` | Zero importers; the `Collapsible` symbol appears only in its own definition. |

These are leftover Expo-starter presentation components. They were almost certainly consumed by the `index`/`explore` route screens that the tab bar still references (`app-tabs.tsx`/`app-tabs.web.tsx` declare `name="index"`/`name="explore"` triggers), but those route files no longer exist in `src/app/` — only `_layout.tsx` remains. The screens were deleted; these components were left behind.

Everything else in `src/` is reachable and used.

---

## Evidence: per-file status

Import graph built by reading all 17 `src/` files plus root config, then grepping the whole workspace for each file's path and every exported symbol (`HintRow`, `WebBadge`, `Collapsible`, `AnimatedIcon`, `BottomTabInset`, `use-color-scheme`, etc.). Path alias `@/*` → `./src/*` is declared in `tsconfig.json`. Platform overrides (`.web.tsx`/`.web.ts`) are resolved automatically by Metro — a bare import of `@/components/animated-icon` selects `animated-icon.tsx` on native and `animated-icon.web.tsx` on web.

### UNUSED (no references found)

- **`src/components/hint-row.tsx`** — UNUSED. Exports `HintRow`. Grep for `HintRow` and for the path `hint-row` returns matches only inside the file itself. No importer. References it makes (themed-text, themed-view, constants/theme) are not reciprocal.
- **`src/components/web-badge.tsx`** — UNUSED. Exports `WebBadge`. Grep for `WebBadge` and path `web-badge` returns matches only inside the file itself. No importer.
- **`src/components/ui/collapsible.tsx`** — UNUSED. Exports `Collapsible`. Grep for `Collapsible` and path `collapsible` returns matches only inside the file itself. No importer.

### USED (with referencing files)

- **`src/app/_layout.tsx`** — USED. Expo Router root layout; file-based routing treats every file under `src/app/` as a screen, so it is used by convention even without an explicit import. It is also the sole importer of `@/components/animated-icon` (`AnimatedSplashOverlay`) and `@/components/app-tabs` (`AppTabs`).
- **`src/components/app-tabs.tsx`** — USED (native). Imported by `src/app/_layout.tsx` as `@/components/app-tabs` (native resolution). It imports `@/constants/theme` (`Colors`).
- **`src/components/app-tabs.web.tsx`** — USED (web override). Web resolution of `@/components/app-tabs`, imported by `_layout.tsx` on web. It imports `./external-link`, `./themed-text`, `./themed-view`, and `@/constants/theme` (`Colors`, `MaxContentWidth`, `Spacing`).
- **`src/components/external-link.tsx`** — USED. Imported by `src/components/app-tabs.web.tsx` (`import { ExternalLink } from './external-link'`). Reachable on the web build.
- **`src/components/themed-text.tsx`** — USED. Imported by `src/components/app-tabs.web.tsx`, `hint-row.tsx`, `web-badge.tsx`, `ui/collapsible.tsx`. Its only *live* importer is `app-tabs.web.tsx` (the other three are themselves unused). It imports `@/constants/theme` (`Fonts`, `ThemeColor`) and `@/hooks/use-theme`.
- **`src/components/themed-view.tsx`** — USED. Same importer set as themed-text (`app-tabs.web.tsx` live; `hint-row`/`web-badge`/`collapsible` dead). Imports `@/constants/theme` (`ThemeColor`) and `@/hooks/use-theme`.
- **`src/constants/theme.ts`** — USED. Imported by `app-tabs.tsx`, `app-tabs.web.tsx`, `hint-row.tsx`, `themed-text.tsx`, `themed-view.tsx`, `web-badge.tsx`, `ui/collapsible.tsx`, `hooks/use-theme.ts`. Also the sole importer of `@/global.css` (`import '@/global.css'`). Exports `Colors`, `ThemeColor`, `Fonts`, `Spacing`, `BottomTabInset`, `MaxContentWidth`.
- **`src/global.css`** — USED. Imported by `src/constants/theme.ts` via `import '@/global.css'` (top of file). Because `theme.ts` is widely imported, this CSS is pulled in transitively.
- **`src/hooks/use-theme.ts`** — USED. Imports `@/constants/theme` (`Colors`) and `@/hooks/use-color-scheme` (`useColorScheme`); exported `useTheme` is imported by `themed-text.tsx`, `themed-view.tsx`, `ui/collapsible.tsx`. Live reachability is web-side via `app-tabs.web.tsx` → themed-text/view.
- **`src/hooks/use-color-scheme.ts`** — USED (native platform override). The native resolution of `@/hooks/use-color-scheme`, which is imported by `hooks/use-theme.ts`. Paired with the `.web.ts` variant.
- **`src/hooks/use-color-scheme.web.ts`** — USED (web platform override). The web resolution of `@/hooks/use-color-scheme`, imported by `hooks/use-theme.ts` on the web build.

### Excluded (splash-related, per brief) — for completeness, all three are in use

- `src/components/animated-icon.tsx` — imported by `_layout.tsx` (provides `AnimatedSplashOverlay`).
- `src/components/animated-icon.web.tsx` — web override of the same import; imports `./animated-icon.module.css`.
- `src/components/animated-icon.module.css` — imported by `animated-icon.web.tsx`.

---

## Conclusions and recommendations

**Delete these 3 files** (safe — zero importers, zero dynamic/string references, no config references):

1. `src/components/hint-row.tsx`
2. `src/components/web-badge.tsx`
3. `src/components/ui/collapsible.tsx`

Removing them breaks nothing because nothing imports them. After deletion, `themed-text.tsx` and `themed-view.tsx` keep their one live importer (`app-tabs.web.tsx`), so they stay used.

**Do not delete** the splash-related files (excluded per brief) — they are in use.

### Caveats

- **Dead exports inside kept files (not files to delete):**
  - `AnimatedIcon` is exported by both `animated-icon.tsx` and `animated-icon.web.tsx` but is never imported anywhere. The *files* are kept because they also export the used `AnimatedSplashOverlay`; only the `AnimatedIcon` export (and its `keyframe`/`logoKeyframe`/`glowKeyframe` styles) is dead code. (These files are splash-related and excluded from scope, noted here only for completeness.)
  - `BottomTabInset` is exported by `src/constants/theme.ts` but never used. `theme.ts` itself is heavily used; only that one export is dead.

- **Web-only reachability for several "used" components:** `external-link.tsx`, `themed-text.tsx`, `themed-view.tsx`, `use-theme.ts`, and `use-color-scheme.ts` are reachable only through the *web* tab bar (`app-tabs.web.tsx`). The *native* tab bar (`app-tabs.tsx`) uses `NativeTabs` and imports only `@/constants/theme`, so on the native build these files are not currently reached. They are still legitimately "used" (they are imported and wired into a live web platform file), so they are **not** deletion candidates — but if the project's native path is the only one that matters going forward, that reachability gap is worth knowing. The root cause is the same as the unused files: the `index`/`explore` route screens the tab bar references do not exist in `src/app/` (only `_layout.tsx` is present), so there are no native screens left that would render these components.

- **Platform overrides count as used:** `app-tabs.web.tsx`, `animated-icon.web.tsx`, and `use-color-scheme.web.ts` are selected automatically by Metro from a bare `@/...` import (no explicit `.web` in the import string), so a grep for the literal `.web` extension finds nothing — that is expected, not a sign they are unused.

- **No config references:** None of the 3 unused files appear in `app.json`, `tsconfig.json`, or `package.json`. `tsconfig.json` only declares the `@/*` → `./src/*` path alias used by the live imports.

### Recommended verification before deleting

After deleting the 3 files, confirm the project still builds and typechecks (commands from `package.json` / `AGENTS.md`):

```bash
npx tsc --noEmit      # typecheck — expect zero new errors
npx expo lint         # lint — expect no new unresolved-reference errors
```

If the route screens `index` and `explore` are ever restored under `src/app/`, re-add the components they need (likely `hint-row`, `web-badge`, `collapsible`) at that point rather than keeping them dormant now.
