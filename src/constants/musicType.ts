export type MusicCategory = "songs" | "artists" | "albums" | "folders";

export interface Album {
    id: string;
    title: string;
    artist: string;
    cover: string;
    trackCount: number;
    year: number;
}

export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    cover: string;
    duration: string;
    isFavorite?: boolean;
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