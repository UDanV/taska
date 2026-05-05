"use client";

import { Button } from "@heroui/button";
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { TEAM_COLOR_OPTIONS } from "@/app/lib/workspace/constants";
import { TASKS_MESSAGES } from "@/app/feature/tasks/constants";
import { CreateTeamModalProps } from "../../../types/modals/create-team";
import { SelectItemUI, SelectUI } from "@/app/shared/components/ui/select";

export default function CreateTeamModal({
  isOpen,
  onOpenChange,
  teamForm,
  teamManagers,
  savingTeam,
  onTeamFormChange,
  onCreateTeam,
}: CreateTeamModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="rounded-[28px]">
        {(onClose) => (
          <>
            <ModalHeader>{TASKS_MESSAGES.createTeam}</ModalHeader>
            <ModalBody className="space-y-4 pb-2">
              <Input
                label={TASKS_MESSAGES.teamName}
                labelPlacement="outside"
                placeholder={TASKS_MESSAGES.teamNamePlaceholder}
                value={teamForm.name}
                onValueChange={(value) =>
                  onTeamFormChange((current) => ({ ...current, name: value }))
                }
              />

              <div>
                <p className="mb-2 text-sm font-medium">{TASKS_MESSAGES.teamColor}</p>
                <div className="flex flex-wrap gap-3">
                  {TEAM_COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-10 w-10 rounded-full border-2 transition ${teamForm.color === color ? "scale-105 border-foreground" : "border-transparent"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => onTeamFormChange((current) => ({ ...current, color }))}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">{TASKS_MESSAGES.teamPm}</p>
                <SelectUI
                  selectedKeys={teamForm.pmId ? [teamForm.pmId] : []}
                  onChange={(event) =>
                    onTeamFormChange((current) => ({
                      ...current,
                      pmId: event.target.value,
                    }))
                  }
                  placeholder={TASKS_MESSAGES.selectPm}
                >
                  {teamManagers.map((manager) => (
                    <SelectItemUI key={manager.id}>
                      {manager.name || manager.email || TASKS_MESSAGES.unknownName}
                    </SelectItemUI>
                  ))}
                </SelectUI>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" className="rounded-xl" onPress={onClose}>
                {TASKS_MESSAGES.cancel}
              </Button>
              <Button
                color="primary"
                className="rounded-xl"
                isLoading={savingTeam}
                isDisabled={!teamForm.pmId}
                onPress={() => void onCreateTeam()}
              >
                {TASKS_MESSAGES.createTeamAction}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
