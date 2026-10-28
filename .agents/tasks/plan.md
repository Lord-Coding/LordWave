# Implementation Plan — LordWave Player & Media Library

Worktree: `c:\Users\lxrdf\Desktop\LordWave`  
Artifact root: `c:\Users\lxrdf\Desktop\LordWave\.agents\tasks\task-lordwave-player-library\`  
Verification: `npx tsc --noEmit` (TypeScript strict, no test framework configured)

---

## FEAT-001 — Fixes: typo, formatDuration, TrackListItem layout & navigation

- [ ] 1. Fix the typo in `src/helpers/filter.ts`.  
  Change `track.title?.roLowerCase()` → `track.title?.toLowerCase()`.  
  Also replace the `(track: any)` parameter with `(track: { title?: string })` to satisfy strict TypeScript.  
  Files: `src/helpers/filter.ts`  
  Verify: `npx tsc --noEmit` — zero errors in this file.

- [ ] 2. Create `src/utils/formatDuration.ts` with a `formatDuration` helper.  
  Signature: `export function formatDuration(seconds: number | undefined): string`.  
  Logic: if undefined return `''`. Compute `Math.floor(seconds / 60)` for minutes and `Math.floor(seconds % 60)` for seconds; pad seconds to two digits (e.g. `63` → `'1:03'`).  
  Files: `src/utils/formatDuration.ts` (new file)  
  Verify: `npx tsc --noEmit` — file compiles cleanly.

- [ ] 3. Update `src/components/TrackListItem.tsx`: fix layout structure, add duration display, add onPress navigation.  
  - The current outer `<View>` inside `<TouchableHighlight>` is unstyled; the `trackItemContainer` style (flexDirection: 'row') is on an inner `<View>`. Fix: remove the extra wrapping View so `trackItemContainer` is the direct child of `TouchableHighlight`.  
  - Import `useRouter` from `expo-router` and `formatDuration` from `@/utils/formatDuration`.  
  - Add `onPress` to `TouchableHighlight` that calls `router.push({ pathname: '/player', params: { title: track.title, artist: track.artist ?? '', artwork: track.image ?? track.artwork ?? '', duration: String(track.duration ?? '') } })`.  
  - Render `formatDuration(track.duration)` as a `<Text>` to the right of the artist, styled with `{ color: theme.textSecondary, fontSize: FontSize.xs }`.  
  Files: `src/components/TrackListItem.tsx`  
  Verify: `npx tsc --noEmit` — zero errors.

---

## FEAT-002 — useMediaLibrary hook, app.json, player screen, route & songs screen wiring

- [ ] 4. Create `src/services/media-library/useMediaLibrary.ts`.  
  - Request permission with `MediaLibrary.usePermissions({ granularPermissions: ['audio'] })`.  
  - Once granted, use the SDK 58 Query API: `new Query().eq(AssetField.MEDIA_TYPE, MediaType.AUDIO).exe()` to get `Asset[]`.  
  - For each asset call the async getters `asset.getFilename()`, `asset.getDuration()`, `asset.getUri()` — these are all async in SDK 58.  
  - Map to `Track`: `{ title: filename without extension, url: uri, duration: durationSeconds, artist: undefined, album: undefined, artwork: undefined }`.  
  - Return `{ tracks: Track[], isLoading: boolean, error: string | null, permissionStatus: PermissionStatus | null }`.  
  - All types explicit, no `any`. Import `Track` from `'@/types/track'`. Import `Query, AssetField, MediaType, PermissionStatus` from `'expo-media-library'`.  
  Files: `src/services/media-library/useMediaLibrary.ts` (new file; create the directory too)  
  Verify: `npx tsc --noEmit` — zero errors in this file.

- [ ] 5. Update `app.json` to add `expo-media-library` plugin and `READ_MEDIA_AUDIO` permission.  
  - Add `"expo-media-library"` to the `"plugins"` array.  
  - Add `"android.permission.READ_MEDIA_AUDIO"` to `"android.permissions"`.  
  - Note: these native changes require a new EAS/dev-client build to take effect on device.  
  Files: `app.json`  
  Verify: `npx expo-doctor` — no critical errors reported.

- [ ] 6. Create `src/app/player.tsx` — full-screen modal player screen.  
  - `SafeAreaView` from `react-native-safe-area-context` as root, `flex:1`, `backgroundColor: theme.background`.  
  - Top bar: `ChevronDown` icon (lucide-react-native) at top-left, `onPress: router.back()`.  
  - Read params with `useLocalSearchParams<{ title: string; artist: string; artwork: string; duration: string }>()`.  
  - Large `FastImage` for artwork (fallback: `unknownTrackImageUri`), square, `borderRadius: 12`.  
  - Track title: `theme.text`, `FontSize.lg`, bold, `numberOfLines={1}`.  
  - Artist: `theme.textSecondary`, `FontSize.sm`, `numberOfLines={1}`.  
  - Progress bar: a `View` container (`height:4`, `backgroundColor: theme.backgroundElement`, `borderRadius:2`); inside it a filled `View` (`width: '0%'` as placeholder, `backgroundColor: theme.primary`, `height: '100%'`). No Slider component — `@react-native-community/slider` is not installed.  
  - Time labels: `formatDuration(0)` left / `formatDuration(parseFloat(params.duration || '0'))` right, `theme.textSecondary`, `FontSize.xs`.  
  - Controls row: `SkipBack`, `Play` (toggles to `Pause`), `SkipForward` from lucide-react-native. Use `useState(false)` for `isPlaying`. Icon sizes: skip 24, play/pause 40. Colors: `theme.text` for skip, `theme.primary` for play/pause.  
  Files: `src/app/player.tsx` (new file)  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 7. Register `player` route in `src/app/_layout.tsx`.  
  Add inside the `<Stack>` in `RootNavigation`:  
  ```tsx
  <Stack.Screen
    name="player"
    options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
  />
  ```  
  Files: `src/app/_layout.tsx`  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 8. Replace static `library.json` with `useMediaLibrary` hook in `src/app/(tabs)/(songs)/index.tsx`.  
  - Remove `import library from '@/assets/data/library.json'`.  
  - Add `import { useMediaLibrary } from '@/services/media-library/useMediaLibrary'`.  
  - Add `import { ActivityIndicator } from 'react-native'` (already imports from react-native, just add it).  
  - Call `const { tracks, isLoading, error, permissionStatus } = useMediaLibrary()`.  
  - Replace `library` with `tracks` in the `filteredSongs` useMemo.  
  - In the return: show `<ActivityIndicator color={theme.primary} />` when `isLoading`; show a `<Text>` with permission-denied message when `permissionStatus === 'denied'`; show a `<Text>` with the error string when `error` is non-null; otherwise render the existing `<TracksList>`.  
  - Need `const theme = useAppTheme()` — add it using existing `useThemedStyles` import or add separately.  
  Files: `src/app/(tabs)/(songs)/index.tsx`  
  Verify: `npx tsc --noEmit` — zero errors.

---

## Final verification

- [ ] 9. Run `npx tsc --noEmit` from the project root. All errors must be zero.  
  Run `npx expo-doctor`. Report any warnings.  
  Commit all changed files locally with message:  
  `feat: player modal screen, media-library hook, duration display, filter fix`
