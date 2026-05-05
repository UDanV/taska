"use client";

import {
  TASK_VIEW_MODES,
  TASK_VIEW_MODE_ICONS,
  TASK_VIEW_MODE_LABELS,
  TASKS_MESSAGES,
} from "@/app/feature/tasks/constants";
import CreateTeamModal from "@/app/feature/tasks/ui/modals/create-team";
import DeleteTaskModal from "@/app/feature/tasks/ui/modals/delete-task";
import TaskDetailsDrawer from "@/app/feature/tasks/ui/details-drawer";
import TaskEditorModal from "@/app/feature/tasks/ui/modals/task-editor";
import { Button } from "@heroui/button";
import { Flag, Plus, Search, Users } from "lucide-react";
import { Checkbox, Input, Spinner } from "@heroui/react";
import { SelectItemUI, SelectUI } from "@/app/shared/components/ui/select";
import { TASK_STATUS_LABELS, TASK_STATUSES } from "@/app/lib/workspace/constants";
import { TaskStatus } from "@prisma/client";
import { USER_SPECIALIZATION_LABELS, USER_SPECIALIZATIONS } from "@/app/lib/auth/roles";
import { TaskListView } from "@/app/feature/tasks/ui/task-views/list";
import { TaskKanbanView } from "@/app/feature/tasks/ui/task-views/kanban";
import { TaskCalendarView } from "@/app/feature/tasks/ui/task-views/calendar";
import { useTasksWorkspace } from "@/app/feature/tasks/workspace";

export default function TasksPage() {
  const workspace = useTasksWorkspace();

  return (
    <>
      <div className="space-y-8 p-4 md:p-6 xl:p-8">
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          {workspace.canManageTasks ? (
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  color="primary"
                  className="rounded-xl"
                  startContent={<Plus size={16} />}
                  onPress={workspace.openTaskCreateModal}
                >
                  {TASKS_MESSAGES.newTask}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_220px_220px_220px_auto]">
            <Input
              value={workspace.searchQuery}
              onValueChange={workspace.setSearchQuery}
              placeholder={TASKS_MESSAGES.searchPlaceholder}
              startContent={<Search size={16} className="text-muted-foreground" />}
              classNames={{
                inputWrapper: "h-11 rounded-xl border border-border bg-background shadow-none",
              }}
            />

            <SelectUI
              placeholder="Все команды"
              selectedKeys={[workspace.teamFilter]}
              onChange={(event) => workspace.setTeamFilter(event.target.value)}
              items={[
                { id: "all", label: "Все команды" },
                ...workspace.teams.map((team) => ({ id: team.id, label: team.name })),
              ]}
            >
              <SelectItemUI key="all">Все команды</SelectItemUI>
              {workspace.teams.map((team) => (
                <SelectItemUI key={team.id}>{team.name}</SelectItemUI>
              ))}
            </SelectUI>

            <SelectUI
              placeholder="Все статусы"
              selectedKeys={[workspace.statusFilter]}
              onChange={(event) =>
                workspace.setStatusFilter((event.target.value || "ALL") as "ALL" | TaskStatus)
              }
              items={[
                { id: "ALL", label: "Все статусы" },
                ...TASK_STATUSES.map((status) => ({
                  id: status,
                  label: TASK_STATUS_LABELS[status],
                })),
              ]}
            >
              <SelectItemUI key="ALL">Все статусы</SelectItemUI>
              {TASK_STATUSES.map((status) => (
                <SelectItemUI key={status}>{TASK_STATUS_LABELS[status]}</SelectItemUI>
              ))}
            </SelectUI>

            <SelectUI
              placeholder="Все метки"
              selectedKeys={[workspace.specializationFilter]}
              onChange={(event) =>
                workspace.setSpecializationFilter(
                  (event.target.value || "ALL") as "ALL" | typeof USER_SPECIALIZATIONS[number],
                )
              }
              items={[
                { id: "ALL", label: "Все метки" },
                ...USER_SPECIALIZATIONS.map((specialization) => ({
                  id: specialization,
                  label: USER_SPECIALIZATION_LABELS[specialization],
                })),
              ]}
            >
              <SelectItemUI key="ALL">Все метки</SelectItemUI>
              {USER_SPECIALIZATIONS.map((specialization) => (
                <SelectItemUI key={specialization}>
                  {USER_SPECIALIZATION_LABELS[specialization]}
                </SelectItemUI>
              ))}
            </SelectUI>

            <div className="flex items-center px-1">
              <Checkbox
                isSelected={workspace.assignedToMeOnly}
                onValueChange={workspace.setAssignedToMeOnly}
                classNames={{ label: "text-sm text-foreground" }}
              >
                {TASKS_MESSAGES.onlyMine}
              </Checkbox>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TASK_VIEW_MODES.map((mode) => {
              const Icon = TASK_VIEW_MODE_ICONS[mode];
              const isActive = workspace.viewMode === mode;
              return (
                <Button
                  key={mode}
                  variant={isActive ? "solid" : "light"}
                  color={isActive ? "primary" : "default"}
                  className="rounded-xl"
                  startContent={<Icon size={16} />}
                  onPress={() => workspace.setViewMode(mode)}
                >
                  {TASK_VIEW_MODE_LABELS[mode]}
                </Button>
              );
            })}
          </div>

          {workspace.loading ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <Spinner className="mx-auto text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{TASKS_MESSAGES.loadingWorkspace}</p>
            </div>
          ) : workspace.error ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-danger/30 bg-danger/5 p-8 text-center">
              <p className="text-base font-medium">{workspace.error}</p>
              <Button
                variant="light"
                className="mt-4 rounded-xl"
                onPress={() => void workspace.loadWorkspace()}
              >
                {TASKS_MESSAGES.retryLoad}
              </Button>
            </div>
          ) : workspace.teams.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users size={22} />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{TASKS_MESSAGES.noTeamsTitle}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {workspace.tasks.length === 0
                  ? TASKS_MESSAGES.noTeamsNoTasks
                  : TASKS_MESSAGES.noTeamsWithTasks}
              </p>
              {workspace.tasks.length > 0 ? (
                <Button
                  color="primary"
                  className="mt-5 rounded-xl"
                  startContent={<Plus size={16} />}
                  onPress={workspace.openTeamModal}
                >
                  {TASKS_MESSAGES.createFirstTeam}
                </Button>
              ) : null}
            </div>
          ) : workspace.filteredTasks.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Flag size={22} />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{workspace.emptyStateTitle}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {workspace.emptyStateDescription}
              </p>
              {workspace.tasks.length === 0 && workspace.canManageTasks ? (
                <Button
                  color="primary"
                  className="mt-5 rounded-xl"
                  startContent={<Plus size={16} />}
                  onPress={workspace.openTaskCreateModal}
                >
                  {TASKS_MESSAGES.createFirstTask}
                </Button>
              ) : (
                <Button
                  variant="light"
                  className="mt-5 rounded-xl"
                  onPress={() => {
                    workspace.setSearchQuery("");
                    workspace.setTeamFilter("all");
                    workspace.setStatusFilter("ALL");
                    workspace.setSpecializationFilter("ALL");
                    workspace.setAssignedToMeOnly(false);
                  }}
                >
                  {TASKS_MESSAGES.resetFilters}
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-6">
              {workspace.viewMode === "list" ? (
                <TaskListView
                  filteredTasks={workspace.filteredTasks}
                  deletingTaskId={workspace.deletingTaskId}
                  onOpenTask={workspace.openTaskDrawer}
                  onEditTask={workspace.handleEditTask}
                  onDeleteTask={workspace.handleDeleteTask}
                />
              ) : null}

              {workspace.viewMode === "kanban" ? (
                <TaskKanbanView
                  boardColumns={workspace.boardColumns}
                  canManageTasks={workspace.canManageTasks}
                  currentUserId={workspace.currentUserId}
                  dragOverStatus={workspace.dragOverStatus}
                  draggingTaskId={workspace.draggingTaskId}
                  deletingTaskId={workspace.deletingTaskId}
                  onTaskStatusDrop={workspace.handleTaskStatusDrop}
                  onSetDragOverStatus={workspace.setDragOverStatus}
                  onSetDraggingTaskId={workspace.setDraggingTaskId}
                  onOpenTask={workspace.openTaskDrawer}
                  onEditTask={workspace.handleEditTask}
                  onDeleteTask={workspace.handleDeleteTask}
                />
              ) : null}

              {workspace.viewMode === "calendar" ? (
                <TaskCalendarView
                  calendarDate={workspace.calendarDate}
                  calendarDays={workspace.calendarDays}
                  onOpenTask={workspace.openTaskDrawer}
                  onPrevMonth={() =>
                    workspace.setCalendarDate(
                      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                    )
                  }
                  onToday={() => workspace.setCalendarDate(new Date())}
                  onNextMonth={() =>
                    workspace.setCalendarDate(
                      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                    )
                  }
                />
              ) : null}
            </div>
          )}
        </section>
      </div>

      <TaskDetailsDrawer
        isOpen={workspace.isTaskDrawerOpen}
        selectedTask={workspace.selectedTask}
        commentsLoading={workspace.commentsLoading}
        taskComments={workspace.taskComments}
        commentDraft={workspace.commentDraft}
        postingComment={workspace.postingComment}
        savingPhotos={workspace.savingPhotos}
        onOpenChange={(open) => {
          workspace.setIsTaskDrawerOpen(open);
          if (!open) {
            workspace.setSelectedTaskId(null);
          }
        }}
        onCommentDraftChange={workspace.setCommentDraft}
        onAddComment={workspace.handleAddComment}
        onTaskPhotoUpload={workspace.handleTaskPhotoUpload}
        onRemoveTaskPhoto={workspace.handleRemoveTaskPhoto}
      />

      <CreateTeamModal
        isOpen={workspace.isCreateTeamOpen}
        onOpenChange={workspace.setIsCreateTeamOpen}
        teamForm={workspace.teamForm}
        teamManagers={workspace.teamManagers}
        savingTeam={workspace.savingTeam}
        onTeamFormChange={workspace.setTeamForm}
        onCreateTeam={workspace.handleCreateTeam}
      />

      <TaskEditorModal
        isOpen={workspace.isTaskModalOpen}
        onOpenChange={workspace.setIsTaskModalOpen}
        isEditing={Boolean(workspace.editingTask)}
        taskForm={workspace.taskForm}
        setTaskForm={workspace.setTaskForm}
        teams={workspace.teams.map((team) => ({ id: team.id, name: team.name }))}
        taskAssignees={workspace.taskAssignees}
        isSaving={workspace.savingTask}
        onSubmit={workspace.handleCreateTask}
      />

      <DeleteTaskModal
        isOpen={Boolean(workspace.taskPendingDelete)}
        task={workspace.taskPendingDelete}
        isDeleting={Boolean(
          workspace.taskPendingDelete &&
            workspace.deletingTaskId === workspace.taskPendingDelete.id,
        )}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            workspace.cancelTaskDelete();
          }
        }}
        onConfirm={workspace.confirmTaskDelete}
      />
    </>
  );
}