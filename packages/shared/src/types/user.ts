export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DevUserSession {
  user: User;
  isDev: boolean;
}
