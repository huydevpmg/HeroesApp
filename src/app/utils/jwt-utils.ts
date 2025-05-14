import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  userId?: string;
  id?: string;
  [key: string]: any;
}

/**
 * @param token string
 * @returns string | null
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const { userId, id, username } = jwtDecode<any>(token);
    return userId || id || username?.id || null;
  } catch {
    return null;
  }
};
