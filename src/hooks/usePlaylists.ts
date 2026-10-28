import { useCallback, useEffect, useState } from 'react';
import {
  createPlaylist,
  deletePlaylist,
  getAllPlaylists,
  type PlaylistRow,
  renamePlaylist,
} from '@/database/repositories/playlistRepository';

export function usePlaylists(): {
  playlists: PlaylistRow[];
  isLoading: boolean;
  create: (name: string) => Promise<number>;
  remove: (id: number) => Promise<void>;
  rename: (id: number, name: string) => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const rows = await getAllPlaylists();
      setPlaylists(rows);
    } catch (err) {
      console.error('[usePlaylists] refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(
    async (name: string): Promise<number> => {
      const id = await createPlaylist(name);
      await refresh();
      return id;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: number): Promise<void> => {
      await deletePlaylist(id);
      await refresh();
    },
    [refresh],
  );

  const rename = useCallback(
    async (id: number, name: string): Promise<void> => {
      await renamePlaylist(id, name);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { playlists, isLoading, create, remove, rename, refresh };
}
