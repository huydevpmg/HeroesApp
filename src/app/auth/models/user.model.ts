export interface User {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status: 'online' | 'offline' | 'away';
  preferences?: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}
