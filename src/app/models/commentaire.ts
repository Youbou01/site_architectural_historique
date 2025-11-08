export type EtatCommentaire = 'approuvé' | 'en attente' | 'rejeté';
export interface Commentaire {
  id: string;
  nom: string;
  message: string;
  date: string; //will convert it later
  note?: number;
  etat: EtatCommentaire; //ex: "approved" | "pending" pour modération coté back office later
}
