"use client";

import { AlertTriangle } from "lucide-react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import type { TeamItem } from "@/app/entities/team/model/types";

type DeleteTeamModalProps = {
  isOpen: boolean;
  team: TeamItem | null;
  isDeleting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export default function DeleteTeamModal({
  isOpen,
  team,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteTeamModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="rounded-[28px]">
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                <AlertTriangle size={20} />
              </span>
              Удалить команду?
            </ModalHeader>
            <ModalBody className="pb-2">
              <p className="text-sm leading-6 text-muted-foreground">
                Команда{" "}
                <span className="font-medium text-foreground">
                  {team?.name || "Без названия"}
                </span>{" "}
                будет удалена без возможности восстановления. Вместе с ней удалятся{" "}
                {team?.tasksCount ?? 0} задач и связи с {team?.membersCount ?? 0} участниками.
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
