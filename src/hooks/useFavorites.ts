import { useCallback, useEffect, useState } from 'react';
import {
  addFavorite,
  getAllFavorites,
  isFavorite,
  removeFavorite,
  type FavoriteRow,
} from '@/database/repositories/favoritesRepository';
import { Track } from '@/types/track';

export function useFavorites(): {
  favorites: FavoriteRow[];
  isLoading: boolean;
  add: (track: Track) => Promise<void>;
  remove: (trackUrl: string) => Promise<void>;
  checkIsFavorite: (trackUrl: string) => Promise<boolean>;
  refresh: () => Promise<void>;
} {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const rows = await getAllFavorites();
      setFavorites(rows);
    } catch (err) {
      console.error('[useFavorites] refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const add = useCallback(
    async (track: Track): Promise<void> => {
      await addFavorite(track);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (trackUrl: string): Promise<void> => {
      await removeFavorite(trackUrl);
      await refresh();
    },
    [refresh],
  );

  const checkIsFavorite = useCallback(
    async (trackUrl: string): Promise<boolean> => isFavorite(trackUrl),
    [],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { favorites, isLoading, add, remove, checkIsFavorite, refresh };
}
