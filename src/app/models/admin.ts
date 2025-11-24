export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin';
  dernierLogin?: Date|string;
}
