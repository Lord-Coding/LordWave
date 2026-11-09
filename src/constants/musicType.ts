export type MusicCategory = "songs" | "artists" | "albums" | "folders";
export type CollectionType = "playlist" | "album" | "artist" | "folder";

export interface Album {
    id: string;
    title: string;
    artist: string;
    cover: string;
    trackCount: number;
    year?: number;
}

export type MusicCollection = {
  id: string;
  title: string;
  subtitle?: string;
  artwork?: string;
  trackIds: string[];
  description?: string;
};

export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    cover: string;
    duration: string;
    durationSeconds?: number;
    uri?: string;
    isFavorite?: boolean;
    folderId?: string;
}

export interface Artist {
    id: string;
    name: string;
    genre: string;
    cover: string;
    trackCount: number;
}

export interface MusicFolder {
    id: string;
    name: string;
    path: string;
    trackCount: number;
}

export interface Playlist {
    id: string;
    title: string;
    description: string;
    cover: string;
    trackCount: number;
    duration: string;
    updatedAt: string;
    trackIds?: string[];
}