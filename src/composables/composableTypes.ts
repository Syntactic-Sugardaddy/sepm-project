import type { useErrorHandler } from './errorHandler';

export type ToastComposable = ReturnType<typeof import('vue-toastification')['useToast']>;
export type ErrorHandlerComposable = ReturnType<typeof useErrorHandler>;
