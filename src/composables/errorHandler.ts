import type { HTTPError } from 'ky';

export function useErrorHandler(toast: ReturnType<typeof import('vue-toastification')['useToast']>) {
  function isHttpError(e: any): e is HTTPError {
    return e?.name === 'HTTPError';
  }

  async function getErrorMessage(e: any) {
    let message = '';
    if (isHttpError(e)) {
      message = await e.response.text();
    } else {
      message = e.message;
    }
    return message;
  }

  async function error(e: any) {
    console.error(e, { e });
    const message = await getErrorMessage(e);
    toast.error(message, {
      timeout: 8000,
    });
    return message;
  }

  return {
    getErrorMessage,
    error,
  };
}
