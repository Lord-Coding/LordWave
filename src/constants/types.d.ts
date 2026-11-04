/**
 * Ambient module declarations for non-JS imports.
 *
 * Expo's web bundler resolves CSS imports at build time, but TypeScript needs an
 * ambient declaration so `import '@/global.css'` (and CSS module imports) type-check.
 */
declare module '*.css';
