import type { ToastComposable, ErrorHandlerComposable } from './composableTypes';
import { useService } from '@/services/service';

export function useImageUploader(toast: ToastComposable, errorHandler: ErrorHandlerComposable) {
  const service = useService('api/v1/images');

  const upload = async (file: File) => {
    try {
      // `multipart/form-data`
      const formData = new FormData();
      formData.append('file', file);

      const image = await service.api.post('', { body: formData });
      toast.success('Successfully uploaded image');
      return image.json();
    } catch (error) {
      errorHandler.error(error);
    }
  };
  return {
    upload,
  };
}
