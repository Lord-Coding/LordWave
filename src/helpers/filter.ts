export const trackTitleFilter =
  (title: string) =>
  (track: { title?: string }): boolean =>
    track.title?.toLowerCase().includes(title.toLowerCase()) ?? false;

export const trackFilter =
  (query: string) =>
  (track: { title?: string; artist?: string; album?: string }): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (track.title?.toLowerCase().includes(q) ?? false) ||
      (track.artist?.toLowerCase().includes(q) ?? false) ||
      (track.album?.toLowerCase().includes(q) ?? false)
    );
  };
