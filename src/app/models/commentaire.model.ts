export type EtatCommentaire = 'approuvé' | 'en attente' | 'rejeté';

export interface Commentaire {
  id: string;
  nom: string;
  message: string;
  date: string;
  note?: number;
  etat: EtatCommentaire;
}
