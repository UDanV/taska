import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { fileToDataUrl } from "../file";
import type { TaskModalFormState } from "../../types/modals/task-editor";

type HandleTaskFormPhotoUploadParams = {
  files: FileList | null;
  currentPhotoCount: number;
  setProcessingPhotos: (value: boolean) => void;
  setTaskForm: Dispatch<SetStateAction<TaskModalFormState>>;
};

export async function handleTaskFormPhotoUpload({
  files,
  currentPhotoCount,
  setProcessingPhotos,
  setTaskForm,
}: HandleTaskFormPhotoUploadParams) {
  if (!files) {
    return;
  }

  const allFiles = Array.from(files);
  const imageFiles = allFiles.filter((file) => file.type.startsWith("image/"));

  if (imageFiles.length !== allFiles.length) {
    toast.error("Можно загружать только фотографии");
    return;
  }

  const maxPhotos = 8;
  const remainingSlots = maxPhotos - currentPhotoCount;

  if (remainingSlots <= 0) {
    toast.error("Можно добавить максимум 8 фотографий");
    return;
  }

  const filesToUpload = imageFiles.slice(0, remainingSlots);

  if (filesToUpload.length < imageFiles.length) {
    toast.info(`Добавлено ${filesToUpload.length} из ${imageFiles.length} фото`);
  }

  setProcessingPhotos(true);

  try {
    const uploadedPhotos = await Promise.all(filesToUpload.map(fileToDataUrl));
    setTaskForm((current) => ({
      ...current,
      photos: [...current.photos, ...uploadedPhotos],
    }));
  } catch {
    toast.error("Не удалось загрузить фотографии");
  } finally {
    setProcessingPhotos(false);
  }
}