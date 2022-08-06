import { acceptHMRUpdate, defineStore } from 'pinia';
import jwtDecode from 'jwt-decode';

const AUTH_TOKEN_KEY = 'authToken';

export type UserRoles = 'ADMIN' | 'USER' | 'UNDEFINED';

interface JwtPayloadCustom {
  iss: string;
  sub: string;
  aud: string[] | string;
  exp: number;
  rol: string[];
}

function getTokenExpirationDate(token: string): Date {
  const decoded = jwtDecode<JwtPayloadCustom>(token);

  const date = new Date(0);
  //date.setUTCSeconds(decoded.exp);
  date.setUTCSeconds(Date.now() + 1000 * 60 * 60 * 24 * 7);
  return date;
}

function isNonExpired(token: string) {
  return getTokenExpirationDate(token).valueOf() > new Date().valueOf();
}

function atTimestampCallback(timestamp: number, callback: () => void) {
  const oneHour = 60 * 60 * 1000;
  let timer: ReturnType<typeof setTimeout> | null = null;
  if (new Date().valueOf() >= timestamp) {
    callback();
  } else {
    const setNextTimeout = () => {
      const duration = Math.min(oneHour, timestamp - new Date().valueOf());
      setTimeout(() => {
        if (new Date().valueOf() >= timestamp) {
          callback();
          timer = null;
        } else {
          setNextTimeout();
        }
      }, duration);
    };

    setNextTimeout();
  }

  return {
    cancel: () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    },
  };
}

function decodeUserRole(token: string | null): UserRoles {
  if (token != null) {
    const decoded = jwtDecode<JwtPayloadCustom>(token);
    const authInfo: string[] = decoded.rol;
    if (authInfo.includes('ROLE_ADMIN')) {
      return 'ADMIN';
    } else if (authInfo.includes('ROLE_USER')) {
      return 'USER';
    }
  }
  return 'UNDEFINED';
}

/**
 * A lightweight way of getting the role of the current user without needing the store.
 */
export function getUserRole(): UserRoles {
  return decodeUserRole(localStorage.getItem(AUTH_TOKEN_KEY));
}

export const useAuthStore = defineStore('auth', () => {
  let tokenExpiryTimer: ReturnType<typeof atTimestampCallback> | null = null;

  const token = ref<string | null>(null);
  watch(token, (newToken: string | null) => {
    if (newToken) {
      if (isNonExpired(newToken)) {
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        tokenExpiryTimer?.cancel();
        tokenExpiryTimer = atTimestampCallback(getTokenExpirationDate(newToken).valueOf(), () => {
          token.value = null;
        });
      } else {
        token.value = null;
      }
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  });

  token.value = localStorage.getItem(AUTH_TOKEN_KEY);

  const isLoggedIn = computed(() => {
    return token.value !== null;
  });

  const logoutUser = () => {
    token.value = null;
  };

  const setToken = (newToken: string) => {
    token.value = newToken;
  };

  const userRole = computed(() => decodeUserRole(token.value));

  return {
    token: computed(() => token.value),
    setToken,
    isLoggedIn,
    userRole,
    logoutUser,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
