export const trackTitleFilter =
  (title: string) =>
  (track: { title?: string }): boolean =>
    track.title?.toLowerCase().includes(title.toLowerCase()) ?? false;
