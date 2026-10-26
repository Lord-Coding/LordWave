# AGENTS.md — LordWave Engineering Rules

## 1. Project Mission

LordWave is a local-first mobile music player built with React Native and Expo. Its purpose is to let users discover, organize, and play audio files already available on their device, with a clean interface and no intrusive advertisements.

The current scope is **V1**. Do not add cloud services, accounts, streaming, social features, analytics, or other out-of-scope capabilities unless the project owner explicitly requests them.

## 2. Mandatory Communication Rules

These rules are mandatory and take priority over convenience.

### Explain Before Implementing

Before implementing a feature, changing architecture, installing a dependency, modifying configuration, or performing a non-trivial refactor:

1. Explain the problem being solved and why the change is needed.
2. Describe the proposed solution in clear, beginner-friendly English.
3. Identify the files and modules likely to change.
4. Explain important trade-offs, limitations, permissions, platform requirements, and potential risks.
5. Provide the relevant commands or a small illustrative example when useful.
6. State how the result will be tested.

**Do not implement the change until the user explicitly authorizes implementation.**

If the user explicitly says to implement, build, fix, or modify a specified item, explain the approach briefly first and then implement that requested item. Do not interpret a request for advice, explanation, planning, review, or examples as permission to change files.

### Teaching Mode

The user wants to understand the project, not merely receive code.

- Prefer clear, practical explanations over unexplained jargon.
- Explain what a proposed package, API, command, configuration option, or design pattern does and why it is appropriate.
- When the user asks how to do something, teach them the steps and show commands or examples; do not silently do it for them.
- If the user has not explicitly asked you to implement a change, provide instructions and examples without modifying project files.
- When implementation is authorized, summarize what changed, why it changed, how to run or test it, and any follow-up steps.
- Never claim that a command, test, build, or feature succeeded unless it was actually run and the result was observed.
- If a request is ambiguous about whether implementation is authorized, ask one concise clarification question before editing.

### Approval Boundaries

Do not perform these actions without explicit approval:
- Add, remove, or replace dependencies.
- Make large-scale refactors or restructure folders.
- Introduce a backend, cloud service, telemetry, advertisements, accounts, or network calls.
- Change app identifiers, signing configuration, release settings, or permissions beyond the approved feature.
- Delete user data, files, tests, or existing functionality.
- Add native Android/iOS code or config plugins.
- Make a breaking API or database migration.

For small, directly requested implementation tasks, no additional approval is needed after explaining the plan.

## 3. Technical Baseline

- Framework: React Native with Expo.
- Language: TypeScript; use strict typing and avoid `any`.
- Navigation: Expo Router, using the existing project template.
- Audio: begin with `expo-audio`; verify its current capabilities against V1 requirements before adding another audio engine.
- Local database: `expo-sqlite` for structured local metadata such as playlists and favorites.
- Simple preferences: `@react-native-async-storage/async-storage` only where SQLite is unnecessary.
- Native media discovery: evaluate Expo APIs first. If they cannot meet requirements, explain the limitation and propose a narrowly scoped native Android solution before implementing it.
- Builds: EAS Build for Android APKs and production Android App Bundles.
- Package installation: prefer `npx expo install <package>` for Expo and React Native ecosystem packages to choose compatible versions.
- Package managers: use the package manager and lockfile already present. Do not switch package managers without approval.

These are the intended defaults, not permission to install packages automatically. Inspect the current project and installed versions first.

## 4. Architecture Principles

Use a feature-oriented, maintainable architecture. Adapt to the existing repository instead of forcing a wholesale rewrite.

Suggested target structure:

```text
app/                         # Expo Router routes and layouts
src/
  components/                # Reusable, feature-agnostic UI components
  features/
    library/                 # Music discovery and library UI/logic
    player/                  # Playback state and player controls
    playlists/               # Playlist management
    favorites/               # Favorite tracks
    settings/                # User preferences
  database/
    migrations/              # SQLite schema migrations
    repositories/            # Database access
    database.ts              # Database initialization
  services/
    audio/                   # Audio adapter and playback integration
    media-library/           # Device media discovery
    file-system/             # File URI and file operations
  stores/                    # Shared state (e.g. Zustand, if adopted)
  hooks/                     # Shared React hooks
  types/                     # Shared domain types
  utils/                     # Small pure utilities
assets/
docs/
```

Do not create every directory in advance without a concrete need. Introduce structure incrementally as features are implemented.

### Separation of Responsibilities

- **Routes** compose screens and navigation; keep business logic out of route files.
- **UI components** render data and report user actions; avoid embedding database queries in presentation components.
- **Feature logic** coordinates use cases such as adding a track to a playlist.
- **Services/adapters** wrap platform-specific APIs such as audio playback and media-library access.
- **Repositories** own SQL queries and persistence details.
- **Domain types** describe tracks, albums, artists, playlists, and playback state independently of UI components where practical.

Keep platform-specific behavior behind small interfaces so the UI does not depend directly on Android implementation details.

## 5. Code Quality

- Use TypeScript strictness and explicit types for public function parameters and return values.
- Avoid `any`, unsafe casts, duplicated logic, giant components, and unexplained magic values.
- Prefer small components and functions with one clear responsibility.
- Use readable names and consistent formatting.
- Handle loading, empty, permission-denied, unavailable-file, and error states.
- Do not swallow exceptions silently. Show a useful user-facing message where appropriate and preserve diagnostic context for development.
- Do not log personal file paths, private user data, or sensitive content unnecessarily.
- Avoid premature abstractions. Do not add a library for a problem that can be solved simply with existing project tools.
- Follow the repository's existing linting and formatting conventions. Do not add a formatter or linting system without explaining it and receiving approval.

## 6. Local-First and Privacy Requirements

- V1 must work without an account, backend, cloud database, or network connection for core music-library and playback functions.
- Do not upload, transmit, or analyze users' music files or listening history.
- Do not introduce ads or advertising SDKs.
- Request only permissions needed for a clearly explained feature.
- Prefer Android's supported media access APIs and current permission model. Do not assume broad file-system access is always available.
- Treat file URIs as potentially unavailable: files may be moved, deleted, or become inaccessible.
- Keep references to existing music files where possible; do not copy entire music libraries into the app's private storage without a clear requirement.
- Persist playlists and favorites locally.
- Explain platform differences between Android and iOS before proposing a cross-platform implementation that may not behave identically.

## 7. Audio and Background Playback

- Validate playback behavior on a real Android device, not only in a simulator or Expo Go.
- Test foreground playback, background playback, screen lock, interruptions, headphones, track changes, and unavailable files.
- Confirm the currently supported `expo-audio` APIs and configuration from the installed Expo SDK's documentation.
- Do not add a second playback engine until its need and compatibility have been explained and approved.
- Do not promise that all local formats, metadata tags, lock-screen controls, or device-wide media discovery work until tested.
- Treat playback state as a coordinated state machine rather than several unrelated booleans when appropriate.
- Avoid multiple independent audio players unintentionally playing at the same time.

## 8. SQLite and Data Integrity

- Use SQLite for structured local records; keep audio binary files outside the database.
- Centralize database initialization and schema changes.
- Use versioned migrations for changes to an existing schema.
- Parameterize SQL values; never concatenate user-controlled strings into SQL.
- Use transactions for multi-step operations that must succeed or fail together.
- Define stable identifiers and handle duplicate tracks where possible.
- Handle database initialization, migration failure, empty results, and deleted/unavailable audio files.
- Explain destructive migrations and obtain approval before applying them to existing user data.
- Do not add a remote database for V1.

## 9. Dependencies and Native Configuration

Before proposing a dependency:
1. Explain what capability is missing.
2. Check whether the current Expo SDK or an installed package already provides it.
3. Verify compatibility with the installed Expo SDK and React Native version.
4. Consider maintenance status, platform support, native build requirements, permissions, and license.
5. Present the smallest viable choice and alternatives.

Never invent package APIs. Verify names and usage against installed type definitions or official documentation when possible.

Any change to `app.json`, `app.config.*`, `eas.json`, Android permissions, config plugins, or native project files must be explained before implementation. Remember that native configuration changes may require a new development build.

## 10. Testing and Verification

After an approved implementation:
- Run the most relevant available checks, such as `npx expo-doctor`, TypeScript checks, linting, or tests, when available.
- Add or update tests for meaningful business logic and database operations.
- Test platform-dependent behavior on an actual device when possible.
- Report the exact commands run and whether they passed.
- Clearly distinguish verified behavior from assumptions and untested behavior.
- If a check cannot run, state why and give the user the command to run locally.

Do not create tests that merely mirror implementation details; test observable behavior and edge cases.

## 11. Documentation and Commands

- Give Windows-compatible commands when providing terminal instructions.
- The user's main environment is Windows with CMD, PowerShell, Node.js, and VS Code/Kiro.
- Prefer commands that work in CMD. Clearly label PowerShell-only commands.
- Explain where commands must be run (project root or a specific directory).
- Do not use Unix-only shell syntax without a Windows alternative.
- Document important architectural decisions, permissions, build steps, and known limitations in `docs/`.
- Keep setup instructions aligned with the actual installed SDK and package versions.

## 12. User Interface and Accessibility

- Keep LordWave visually coherent, responsive, and touch-friendly.
- Provide loading, empty-library, permission-denied, and error states.
- Use accessible labels and adequate touch targets.
- Do not make animations interfere with playback controls or accessibility.
- Do not use placeholder data in production flows unless it is explicitly identified and removed before release.
- Preserve the user's chosen design direction and existing working UI unless a change is requested.

## 13. Definition of Done

A feature is complete only when:
- Its purpose and implementation have been explained.
- The user has authorized implementation.
- It fits the V1 scope and architecture.
- Loading, empty, permission, and error states are handled as relevant.
- TypeScript and available checks pass, or failures are reported clearly.
- Device-dependent behavior is tested or explicitly marked unverified.
- Documentation is updated when behavior, setup, permissions, or architecture changes.
- The user receives a concise summary of files changed, how to test the feature, and known limitations.

## 14. Scope Discipline

Build the smallest reliable version first. Keep V1 focused on:
- Discovering accessible local audio files.
- Browsing the local music library.
- Playing, pausing, skipping, seeking, shuffling, and repeating tracks.
- Background playback and system media controls where supported.
- Creating and editing local playlists.
- Favorites and basic playback preferences.
- A polished, accessible player interface.
- No intrusive advertisements and no account requirement.

Do not add lyrics fetching, online streaming, social features, recommendation engines, cloud synchronization, or analytics unless explicitly requested.

## 15. Default Response Format

For advice or a proposed change, use this structure:
1. **Goal** — what problem is being solved.
2. **Explanation** — how it works in understandable terms.
3. **Files and dependencies** — what would change and why.
4. **Steps or example** — commands or illustrative code where useful.
5. **Risks and verification** — limitations and how to test.
6. **Approval question** — ask whether the user wants implementation, unless implementation was explicitly requested.

For an explicitly requested implementation, briefly explain the plan first, implement only the approved scope, then report:
- What changed.
- Why.
- Commands/tests run and their results.
- How the user can verify it.
- Remaining limitations.

**Never silently implement a suggestion. Explain first, and wait for authorization unless the user clearly asked you to implement that exact change.**
