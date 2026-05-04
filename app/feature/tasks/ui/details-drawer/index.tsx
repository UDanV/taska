"use client";

import { ImagePlus, X } from "lucide-react";
import { Button } from "@heroui/button";
import { Chip, Drawer, DrawerBody, DrawerContent, DrawerHeader, Textarea } from "@heroui/react";
import { TASK_STATUS_LABELS } from "@/app/lib/workspace/constants";
import { TASKS_MESSAGES } from "@/app/feature/tasks/constants";
import { TaskDetailsDrawerProps } from "../../types/details-drawer";
import { formatTaskCommentAt } from "../../lib/date";

export default function TaskDetailsDrawer({
  isOpen,
  selectedTask,
  commentsLoading,
  taskComments,
  commentDraft,
  postingComment,
  savingPhotos,
  onOpenChange,
  onCommentDraftChange,
  onAddComment,
  onTaskPhotoUpload,
  onRemoveTaskPhoto,
}: TaskDetailsDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="lg">
      <DrawerContent>
        <DrawerHeader className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {TASKS_MESSAGES.taskDetails}
          </p>
          <h3 className="text-lg font-semibold">
            {selectedTask?.title ?? TASKS_MESSAGES.taskNotFound}
          </h3>
        </DrawerHeader>
        <DrawerBody>
          {selectedTask ? (
            <div className="space-y-5 pb-6">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Описание</p>
                <p className="mt-2 text-sm leading-6">
                  {selectedTask.description || TASKS_MESSAGES.noDescription}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {TASKS_MESSAGES.assigneeLabel}
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {selectedTask.assignee?.name || TASKS_MESSAGES.noAssignee}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {TASKS_MESSAGES.statusLabel}
                  </p>
                  <Chip variant="flat" className="mt-2 rounded-xl">
                    {TASK_STATUS_LABELS[selectedTask.status]}
                  </Chip>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {TASKS_MESSAGES.mediaLabel}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{TASKS_MESSAGES.mediaHint}</p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-muted">
                    <ImagePlus size={16} />
                    {savingPhotos ? TASKS_MESSAGES.photoSaving : TASKS_MESSAGES.addPhoto}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={savingPhotos}
                      onChange={(event) => {
                        void onTaskPhotoUpload(event.target.files);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="mt-4">
                  {selectedTask.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedTask.photos.map((photo, index) => (
                        <div
                          key={`${selectedTask.id}-photo-${index}`}
                          className="group relative overflow-hidden rounded-xl border border-border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={`Фото задачи ${index + 1}`}
                            className="h-28 w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-danger hover:text-danger-foreground"
                            onClick={() => void onRemoveTaskPhoto(index)}
                            disabled={savingPhotos}
                            aria-label={TASKS_MESSAGES.deletePhoto}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      {TASKS_MESSAGES.noPhotos}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {TASKS_MESSAGES.commentsLabel}
                </p>
                {commentsLoading ? (
                  <p className="mt-3 text-sm text-muted-foreground">{TASKS_MESSAGES.commentsLoading}</p>
                ) : taskComments.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">{TASKS_MESSAGES.noComments}</p>
                ) : (
                  <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
                    {taskComments.map((comment) => (
                      <li key={comment.id} className="rounded-xl bg-muted px-3 py-2.5 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {comment.user.name || comment.user.email || TASKS_MESSAGES.commentAuthorFallback} ·{" "}
                          {formatTaskCommentAt(comment.createdAt)}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap leading-6">{comment.body}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder={TASKS_MESSAGES.commentPlaceholder}
                    value={commentDraft}
                    onValueChange={onCommentDraftChange}
                    minRows={2}
                    classNames={{
                      inputWrapper: "rounded-xl border border-border bg-background shadow-none",
                    }}
                  />
                  <Button
                    color="primary"
                    className="rounded-xl"
                    isLoading={postingComment}
                    isDisabled={!commentDraft.trim()}
                    onPress={() => void onAddComment()}
                  >
                    {TASKS_MESSAGES.commentSubmit}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{TASKS_MESSAGES.taskChooseHint}</p>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
