export interface Utilisateur {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  dateCreated: string;
  dernierLogin: string | null;
  isActive: boolean;
  favorites?: string[];
}
