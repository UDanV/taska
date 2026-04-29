"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import type { TaskItem } from "@/app/entities/task/model/types";

type DeleteTaskModalProps = {
  isOpen: boolean;
  task: TaskItem | null;
  isDeleting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export default function DeleteTaskModal({
  isOpen,
  task,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteTaskModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="rounded-[28px]">
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                <AlertTriangle size={20} />
              </span>
              Удалить задачу?
            </ModalHeader>
            <ModalBody className="pb-2">
              <p className="text-sm leading-6 text-muted-foreground">
                Задача{" "}
                <span className="font-medium text-foreground">
                  {task?.title || "Без названия"}
                </span>{" "}
                будет удалена без возможности восстановления.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" className="rounded-xl" onPress={onClose}>
                Отмена
              </Button>
              <Button
                color="danger"
                className="rounded-xl"
                isLoading={isDeleting}
                onPress={() => void onConfirm()}
              >
                Удалить
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
