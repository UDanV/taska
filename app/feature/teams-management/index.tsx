"use client";

import { Button } from "@heroui/react";
import { LoaderCircle, Plus, UsersRound } from "lucide-react";
import CreateTeamModal from "@/app/feature/tasks/ui/modals/create-team";
import { useTeamsManagementWorkspace } from "./workspace";
import TeamsManagementTeamCard from "@/app/feature/teams-management/ui/team-card";

export default function TeamsManagementPage() {
  const workspace = useTeamsManagementWorkspace();

  return (
    <>
      <div className="space-y-8 p-4 md:p-6 xl:p-8">
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <UsersRound size={18} className="text-primary" />
              <h1 className="text-lg font-semibold">Команды</h1>
            </div>

            {workspace.canEditTeams ? (
              <Button
                color="primary"
                className="rounded-xl"
                startContent={<Plus size={16} />}
                onPress={workspace.openCreateTeamModal}
              >
                Создать команду
              </Button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Всего команд</p>
              <p className="mt-2 text-3xl font-semibold">{workspace.teams.length}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Участников в командах</p>
              <p className="mt-2 text-3xl font-semibold">{workspace.membersTotal}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Задач в командах</p>
              <p className="mt-2 text-3xl font-semibold">{workspace.tasksTotal}</p>
            </div>
          </div>

          {workspace.loading ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <LoaderCircle className="mx-auto animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Загружаем команды...</p>
            </div>
          ) : workspace.error ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-danger/30 bg-danger/5 p-8 text-center">
              <p className="text-base font-medium">{workspace.error}</p>
              <Button
                variant="light"
                className="mt-4 rounded-xl"
                onPress={() => void workspace.loadData()}
              >
                Повторить загрузку
              </Button>
            </div>
          ) : workspace.teams.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-base font-medium">Команд пока нет</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Создайте первую команду и сразу назначьте для неё PM.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {workspace.teams.map((team) => {
                const draft = workspace.getTeamDraft(team);

                return (
                  <TeamsManagementTeamCard
                    key={team.id}
                    team={team}
                    draft={draft}
                    canEditTeams={workspace.canEditTeams}
                    managers={workspace.managers}
                    teamUsers={workspace.teamUsers}
                    isDirty={workspace.isTeamDirty(team, draft)}
                    isSaving={workspace.savingTeamId === team.id}
                    onSave={workspace.handleSaveTeam}
                    onDraftChange={workspace.handleDraftChange}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <CreateTeamModal
        isOpen={workspace.isCreateTeamOpen}
        onOpenChange={workspace.setIsCreateTeamOpen}
        teamForm={workspace.createForm}
        teamManagers={workspace.managers}
        savingTeam={workspace.savingTeam}
        onTeamFormChange={workspace.setCreateForm}
        onCreateTeam={workspace.handleCreateTeam}
      />
    </>
  );
}
