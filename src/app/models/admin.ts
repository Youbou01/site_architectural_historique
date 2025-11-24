export interface Admin {
  id: string;
  username: string;
  password: string;
  role: 'admin';
  email?: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateCreated?: string;
  dernierLogin?: Date | string;
  isActive?: boolean;
  type?: 'admin';
}
