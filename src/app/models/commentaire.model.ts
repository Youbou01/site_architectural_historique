export interface Commentaire {
  id: string;
  nom: string;
  message: string;
  date: string;
  note?: number;
  approved?: boolean;
}
