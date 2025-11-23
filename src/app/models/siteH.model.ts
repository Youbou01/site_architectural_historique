import { Commentaire } from './commentaire.model';
import { LieuProche } from './lieu-proche.model';

export interface SiteH {
  id: string;
  nom: string;
  localisation: string;
  photo: string;
  dateConstruction: string;
  estClasse: boolean;
  prixEntree: number;
  description: string;
  categorie: string;
  horaires: string[];
  visitesGuideesDisponibles: boolean;
  lieuxProches: LieuProche[];
  latitude?: number;
  longitude?: number;
  comments: Commentaire[];
  favoris?: boolean;
}
