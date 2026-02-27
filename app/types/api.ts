/**
 * Tipos compartidos para la aplicación Klarinet.
 * Basados en las respuestas de la API de yhimsical.
 */

/* ====== Search YouTube ====== */

export interface SearchResultItem {
  title: string;
  url: string;
  duration_text: string;
  duration: number;
  upload_date: string | false;
  release_date: number | false;
  thumbnail_src: string;
  views: number;
  ID: string;
  uploader: {
    username: string;
    url: string;
    verified: boolean;
  };
}

export interface SearchResponse {
  status: string;
  result: SearchResultItem[];
}

/* ====== Get Artist ====== */

export interface ArtistTopTrack {
  title: string;
  artist: string;
  playcount: number;
}

export interface ArtistInfo {
  name: string;
  mbid: string;
  summary: string;
  bio: string;
  image: string;
  toptracks: ArtistTopTrack[];
}

export interface ArtistResponse {
  status: string;
  artist: ArtistInfo;
}
