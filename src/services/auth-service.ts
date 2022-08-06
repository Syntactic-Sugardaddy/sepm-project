import type { User } from '@/dtos/user/user';
import type { AuthRequest } from '@/dtos/auth-request';
import { useService } from './service';

export function useAuthService() {
  const basePath = 'api/v1';
  const { api } = useService(basePath);

  async function loginUser(authRequest: AuthRequest): Promise<string> {
    return (
      await api
        .post('authentication', {
          json: authRequest,
        })
        .text()
    ).replace(/^Bearer /, '');
  }

  async function registerUser(user: User): Promise<User> {
    return await api.post('users', { json: user }).json();
  }

  return {
    loginUser,
    registerUser,
  };
}
