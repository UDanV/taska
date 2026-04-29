"use client";

import { useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@heroui/button";
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import {
  USER_SPECIALIZATION_LABELS,
  USER_SPECIALIZATIONS,
  type UserSpecialization,
} from "@/app/lib/auth/roles";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/app/lib/workspace/constants";
import { SelectItemUI, SelectUI } from "@/app/shared/components/ui/select";
import { TaskEditorModalProps } from "../../../types/modals/task-editor";
import { handleTaskFormPhotoUpload } from "../../../lib/photo-upload";
import Image from "next/image";

export default function TaskEditorModal({
  isOpen,
  onOpenChange,
  isEditing,
  taskForm,
  setTaskForm,
  teams,
  taskAssignees,
  isSaving,
  onSubmit,
}: TaskEditorModalProps) {
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const compatibleAssignees = useMemo(() => {
    if (!taskForm.specialization || !taskForm.teamId) {
      return [];
    }

    return taskAssignees.filter(
      (assignee) =>
        assignee.specialization === taskForm.specialization &&
        assignee.teamIds.includes(taskForm.teamId),
    );
  }, [taskAssignees, taskForm.specialization, taskForm.teamId]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
      <ModalContent className="rounded-[28px]">
        {(onClose) => (
          <>
            <ModalHeader>{isEditing ? "Редактировать задачу" : "Новая задача"}</ModalHeader>
            <ModalBody className="space-y-4 pb-2">
              <Input
                label="Название"
                labelPlacement="outside"
                placeholder="Что нужно сделать?"
                value={taskForm.title}
                onValueChange={(value) =>
                  setTaskForm((current) => ({ ...current, title: value }))
                }
              />

              <div>
                <p className="mb-2 text-sm font-medium">Описание</p>
                <Textarea
                  placeholder="Коротко опишите задачу"
                  value={taskForm.description}
                  onValueChange={(value) =>
                    setTaskForm((current) => ({
                      ...current,
                      description: value,
                    }))
                  }
                />
              </div>

              <div className={`grid gap-4 ${isEditing ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                <div>
                  <p className="mb-2 text-sm font-medium">Команда</p>
                  <SelectUI
                    selectedKeys={taskForm.teamId ? [taskForm.teamId] : []}
                    placeholder="Выберите команду"
                    onChange={(event) => {
                      const nextTeamId = event.target.value;

                      setTaskForm((current) => {
                        const selectedAssignee = taskAssignees.find(
                          (assignee) => assignee.id === current.assigneeId,
                        );
                        const canKeepAssignee =
                          current.assigneeId &&
                          selectedAssignee &&
                          selectedAssignee.teamIds.includes(nextTeamId) &&
                          selectedAssignee.specialization === current.specialization;

                        return {
                          ...current,
                          teamId: nextTeamId,
                          assigneeId: canKeepAssignee ? current.assigneeId : "",
                        };
                      });
                    }}
                  >
                    {teams.map((team) => (
                      <SelectItemUI key={team.id}>{team.name}</SelectItemUI>
                    ))}
                  </SelectUI>
                </div>

                {isEditing ? (
                  <div>
                    <p className="mb-2 text-sm font-medium">Статус</p>
                    <SelectUI
                      selectedKeys={[taskForm.status]}
                      placeholder="Выберите статус"
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          status: event.target.value as TaskStatus,
                        }))
                      }
                    >
                      {TASK_STATUSES.map((status) => (
                        <SelectItemUI key={status}>
                          {TASK_STATUS_LABELS[status]}
                        </SelectItemUI>
                      ))}
                    </SelectUI>
                  </div>
                ) : null}

                <div>
                  <p className="mb-2 text-sm font-medium">Приоритет</p>
                  <SelectUI
                    selectedKeys={[taskForm.priority]}
                    placeholder="Выберите приоритет"
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        priority: event.target.value as TaskPriority,
                      }))
                    }
                  >
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItemUI key={priority}>
                        {TASK_PRIORITY_LABELS[priority as TaskPriority]}
                      </SelectItemUI>
                    ))}
                  </SelectUI>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium">Метка задачи</p>
                  <SelectUI
                    selectedKeys={taskForm.specialization ? [taskForm.specialization] : []}
                    placeholder="Выберите специализацию"
                    onChange={(event) => {
                      const nextSpecialization = event.target.value as
                        | UserSpecialization
                        | "";

                      setTaskForm((current) => {
                        const nextAssignee = taskAssignees.find(
                          (assignee) => assignee.id === current.assigneeId,
                        );

                        return {
                          ...current,
                          specialization: nextSpecialization,
                          assigneeId:
                            nextAssignee?.specialization === nextSpecialization &&
                            nextAssignee.teamIds.includes(current.teamId)
                              ? current.assigneeId
                              : "",
                        };
                      });
                    }}
                  >
                    {USER_SPECIALIZATIONS.map((specialization) => (
                      <SelectItemUI key={specialization}>
                        {USER_SPECIALIZATION_LABELS[specialization]}
                      </SelectItemUI>
                    ))}
                  </SelectUI>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Исполнитель</p>
                  <SelectUI
                    selectedKeys={taskForm.assigneeId ? [taskForm.assigneeId] : []}
                    placeholder={
                      taskForm.specialization
                        ? "Выберите исполнителя"
                        : "Сначала выберите метку задачи"
                    }
                    isDisabled={!taskForm.specialization}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        assigneeId: event.target.value,
                      }))
                    }
                  >
                    {compatibleAssignees.map((assignee) => (
                      <SelectItemUI key={assignee.id}>
                        {assignee.name || assignee.email || "Без имени"}
                      </SelectItemUI>
                    ))}
                  </SelectUI>
                  {taskForm.specialization ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Доступны только пользователи из выбранной команды с меткой{" "}
                      {USER_SPECIALIZATION_LABELS[taskForm.specialization as UserSpecialization]}.
                    </p>
                  ) : null}
                  {taskForm.assigneeId ? (
                    <Button
                      variant="light"
                      className="mt-2 h-8 rounded-xl px-3 text-xs"
                      onPress={() =>
                        setTaskForm((current) => ({
                          ...current,
                          assigneeId: "",
                        }))
                      }
                    >
                      Снять исполнителя
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Медиа</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Только фотографии, максимум 8 файлов.
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-muted">
                    <ImagePlus size={16} />
                    {processingPhotos ? "Загрузка..." : "Добавить фото"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={processingPhotos}
                      onChange={(event) => {
                        void handleTaskFormPhotoUpload({
                          files: event.target.files,
                          currentPhotoCount: taskForm.photos.length,
                          setProcessingPhotos,
                          setTaskForm,
                        });
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="mt-3">
                  {taskForm.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {taskForm.photos.map((photo, index) => (
                        <div
                          key={`task-form-photo-${index}`}
                          className="group relative overflow-hidden rounded-xl border border-border"
                        >
                          <Image
                            src={photo}
                            alt={`Фото ${index + 1}`}
                            className="h-24 w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-danger hover:text-danger-foreground"
                            onClick={() =>
                              setTaskForm((current) => ({
                                ...current,
                                photos: current.photos.filter(
                                  (_, photoIndex) => photoIndex !== index,
                                ),
                              }))
                            }
                            aria-label="Удалить фото"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      Пока без фото. При необходимости прикрепите их перед сохранением.
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" className="rounded-xl" onPress={onClose}>
                Отмена
              </Button>
              <Button
                color="primary"
                className="rounded-xl"
                isLoading={isSaving}
                onPress={() => void onSubmit()}
              >
                {isEditing ? "Сохранить изменения" : "Создать задачу"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
