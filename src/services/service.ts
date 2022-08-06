import ky from 'ky';
import type { Options } from 'ky';
import { useAuthStore } from '../stores/auth-store';

type KyRequestIdentifier = string;
type KyResponse = {
  status: number;
  contentType: string | null;
  body: string;
};

const kyCache = new Map<string, KyResponse>();
(globalThis as any)['kyCache'] = kyCache;
let useCache = false;
// To copy the kyCache, just put the following in your console
// And then put it into the /dist/ky-cache.txt file. TODO: Hmm, I think that file gets overwritten every time one does a build. But I don't want to commit the cache to git either...
/*

const stringified = JSON.stringify([...kyCache.entries()].map(([key, value]) => [key, value]));
console.log(stringified);
copy(stringified);

*/

async function tryLoadKyCache() {
  try {
    const kyCacheFile = await fetch(new URL('./ky-cache.txt', import.meta.url).href);
    const content = await kyCacheFile.text();
    if (!content) return;
    const parsedContent = JSON.parse(content);
    for (const [key, value] of parsedContent) {
      kyCache.set(key, value);
    }
    useCache = true;
  } catch (e) {
    console.warn('Failed to load ky cache', e);
  }
}
await tryLoadKyCache();

function getRequestIdentifier(request: Request): KyRequestIdentifier {
  const url = new URL(request.url);

  return JSON.stringify([
    request.method,
    url.pathname + url.search + url.hash,
    request.headers.get('authorization') ? true : false,
  ]);
}

async function addToCache(request: Request, response: Response) {
  const requestIdentifier = getRequestIdentifier(request);
  const responseData: KyResponse = {
    status: response.status,
    contentType: response.headers.get('content-type'),
    body: await response.text(),
  };

  //console.log(requestIdentifier + '', responseData, request, response);
  kyCache.set(requestIdentifier, responseData);
}

function respondFromCache(request: Request): Response | null {
  const requestIdentifier = getRequestIdentifier(request);
  const cachedResponse = kyCache.get(requestIdentifier);
  if (cachedResponse) {
    const headers = new Headers();
    if (cachedResponse.contentType) {
      headers.set('content-type', cachedResponse.contentType);
    }

    return new Response(cachedResponse.body, {
      status: cachedResponse.status,
      headers: headers,
    });
  } else {
    return null;
  }
}

export function findBackendUrl(basePath: string) {
  if (import.meta.env.DEV) {
    // local `npm run dev`, backend at localhost:8080
    return new URL(basePath, 'http://localhost:8080');
  } else {
    // assume deployed somewhere and backend is available at same host/port as frontend
    return new URL(basePath, window.location.protocol + '//' + window.location.host);
  }
}

export function useService(basePath: string) {
  const authStore = useAuthStore();

  const options: Options = {
    prefixUrl: findBackendUrl(basePath),
    hooks: {
      beforeRequest: [
        (request) => {
          if (authStore.token) {
            request.headers.set('Authorization', 'Bearer ' + authStore.token);
          }

          if (useCache) {
            const cachedResponse = respondFromCache(request);
            if (cachedResponse) {
              return cachedResponse;
            } else {
              const headers = new Headers();
              headers.set('content-type', 'application/json');
              return new Response('Unsupported.', {
                status: 404,
                headers: headers,
              });
            }
          }
        },
      ],
      afterResponse: [
        (request, options, response) => {
          addToCache(request, response);
        },
      ],
    },
  };

  const api = ky.extend(options);

  function filterSearchParams(searchParams: [string, string | number | boolean | null | undefined][]) {
    return searchParams.filter((v) => v[1] !== undefined && v[1] !== null && v[1] !== '') as [
      string,
      string | number | boolean
    ][];
  }

  return {
    api,
    filterSearchParams,
  };
}
