import type { Album, Artist, MusicFolder, Playlist, Track } from "./musicType"

const img = (id: string, width = 640) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const mockAlbums: Album[] = [
  {
    id: "a1",
    title: "Midnight Memories",
    artist: "The Weeknd",
    cover: img("photo-1516280440614-37939bbacd81"),
    trackCount: 14,
    year: 2024,
  },
  {
    id: "a2",
    title: "Blue Hour",
    artist: "Luna Grey",
    cover: img("photo-1519608487953-e999c86e7455"),
    trackCount: 11,
    year: 2023,
  },
  {
    id: "a3",
    title: "Afterglow",
    artist: "James Blake",
    cover: img("photo-1470225620780-dba8ba36b745"),
    trackCount: 9,
    year: 2022,
  },
  {
    id: "a4",
    title: "Golden",
    artist: "Sofia Lane",
    cover: img("photo-1511379938547-c1f69419868d"),
    trackCount: 12,
    year: 2024,
  },
  {
    id: "a5",
    title: "No Signal",
    artist: "Kairo",
    cover: img("photo-1506157786151-b8491531f063"),
    trackCount: 10,
    year: 2021,
  },
];

export const mockTracks: Track[] = [
  {
    id: "t1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "Midnight Memories",
    cover: mockAlbums[0].cover,
    duration: "3:20",
    isFavorite: true,
  },
  {
    id: "t2",
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    album: "Blue Hour",
    cover: img("photo-1493225457124-a3eb161ffa5f", 240),
    duration: "3:02",
  },
  {
    id: "t3",
    title: "Retrograde",
    artist: "James Blake",
    album: "Afterglow",
    cover: mockAlbums[2].cover,
    duration: "3:43",
  },
  {
    id: "t4",
    title: "Golden Hour",
    artist: "Sofia Lane",
    album: "Golden",
    cover: mockAlbums[3].cover,
    duration: "3:29",
    isFavorite: true,
  },
  {
    id: "t5",
    title: "Night Drive",
    artist: "Kairo",
    album: "No Signal",
    cover: mockAlbums[4].cover,
    duration: "4:01",
  },
  {
    id: "t6",
    title: "Slow Motion",
    artist: "Luna Grey",
    album: "Blue Hour",
    cover: mockAlbums[1].cover,
    duration: "2:58",
  },
];

export const mockArtists: Artist[] = [
  {
    id: "ar1",
    name: "The Weeknd",
    genre: "R&B · Pop",
    cover: img("photo-1506794778202-cad84cf45f1d", 300),
    trackCount: 24,
  },
  {
    id: "ar2",
    name: "Billie Eilish",
    genre: "Alternative · Pop",
    cover: img("photo-1534528741775-53994a69daeb", 300),
    trackCount: 18,
  },
  {
    id: "ar3",
    name: "James Blake",
    genre: "Electronic · Soul",
    cover: img("photo-1500648767791-00dcc994a43e", 300),
    trackCount: 12,
  },
  {
    id: "ar4",
    name: "Sofia Lane",
    genre: "Indie · Pop",
    cover: img("photo-1524504388940-b1c1722653e1", 300),
    trackCount: 15,
  },
];

export const mockFolders: MusicFolder[] = [
  {
    id: "f1",
    name: "Music",
    path: "/storage/emulated/0/Music",
    trackCount: 42,
  },
  {
    id: "f2",
    name: "Downloads",
    path: "/storage/emulated/0/Download",
    trackCount: 18,
  },
  {
    id: "f3",
    name: "WhatsApp Audio",
    path: "/storage/emulated/0/Android/media",
    trackCount: 12,
  },
  {
    id: "f4",
    name: "Bluetooth",
    path: "/storage/emulated/0/Bluetooth",
    trackCount: 7,
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: "p1",
    title: "Mes incontournables",
    description: "Les morceaux que j'écoute le plus",
    cover: mockTracks[0].cover,
    trackCount: 24,
    duration: "1 h 32",
    updatedAt: "Aujourd'hui",
  },
  {
    id: "p2",
    title: "Chill & Relax",
    description: "Pour les moments de détente",
    cover: mockAlbums[1].cover,
    trackCount: 18,
    duration: "58 min",
    updatedAt: "Hier",
  },
  {
    id: "p3",
    title: "Night Vibes",
    description: "Ambiance nocturne",
    cover: mockAlbums[2].cover,
    trackCount: 15,
    duration: "49 min",
    updatedAt: "Il y a 2 jours",
  },
  {
    id: "p4",
    title: "Workout",
    description: "Pour garder le rythme",
    cover: mockAlbums[4].cover,
    trackCount: 32,
    duration: "1 h 48",
    updatedAt: "Il y a 3 jours",
  },
  {
    id: "p5",
    title: "Mes découvertes",
    description: "Les nouvelles musiques",
    cover: mockAlbums[3].cover,
    trackCount: 12,
    duration: "41 min",
    updatedAt: "Cette semaine",
  },
  {
    id: "p6",
    title: "Slow Music",
    description: "Une sélection tout en douceur",
    cover: mockTracks[5].cover,
    trackCount: 20,
    duration: "1 h 12",
    updatedAt: "Cette semaine",
  },
];