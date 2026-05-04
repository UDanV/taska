import { Calendar, Columns3, Table, type LucideIcon } from "lucide-react";

export const TASK_VIEW_MODES = ["list", "kanban", "calendar"] as const;
export type TaskViewMode = (typeof TASK_VIEW_MODES)[number];

export const TASK_VIEW_MODE_LABELS: Record<TaskViewMode, string> = {
  list: "Список",
  kanban: "Канбан",
  calendar: "Календарь",
};

export const TASK_VIEW_MODE_ICONS: Record<TaskViewMode, LucideIcon> = {
  list: Table,
  kanban: Columns3,
  calendar: Calendar,
};

export const TASKS_MESSAGES = {
  noTag: "Без метки",
  noAssignee: "Не назначен",
  noDescription: "Описание пока не добавлено",
  noComments: "Пока без комментариев.",
  noPhotos: "Фотографии пока не добавлены.",
  commentAuthorFallback: "Пользователь",
  commentPlaceholder: "Написать комментарий...",
  commentSubmit: "Отправить",
  taskDetails: "Детали задачи",
  taskNotFound: "Задача не найдена",
  taskChooseHint: "Выберите задачу, чтобы посмотреть детали.",
  assigneeLabel: "Исполнитель",
  statusLabel: "Статус",
  mediaLabel: "Медиа",
  mediaHint: "Можно загрузить только фотографии (до 8 штук).",
  addPhoto: "Добавить фото",
  photoSaving: "Сохраняем...",
  deletePhoto: "Удалить фото",
  commentsLabel: "Комментарии",
  commentsLoading: "Загрузка комментариев...",
  searchPlaceholder: "Поиск по названию, описанию, команде, метке или исполнителю",
  onlyMine: "Назначенные мне",
  retryLoad: "Повторить загрузку",
  loadingWorkspace: "Загружаем команды и задачи...",
  noTeamsTitle: "Пока нет команд",
  noTeamsNoTasks: "У вас пока нет задач и команды. Обратитесь к руководителю, чтобы получить доступ к рабочему пространству.",
  noTeamsWithTasks: "Создайте первую команду, чтобы открыть рабочее пространство задач и переключаться между всеми форматами отображения.",
  createFirstTeam: "Создать первую команду",
  emptyByFilters: "По текущим фильтрам ничего не найдено",
  emptyNoTasks: "Задач пока нет",
  emptyByFiltersDescription: "Попробуйте сбросить фильтры или выбрать другой формат отображения.",
  emptyNoTasksDescription: "Добавьте первую задачу, и она сразу появится в списке, на доске и в календаре.",
  createFirstTask: "Создать первую задачу",
  resetFilters: "Сбросить фильтры",
  newTask: "Новая задача",
  cardsCountSuffix: "карточек",
  dropHere: "Перетащите задачу в эту колонку",
  columnEmpty: "В этой колонке пока нет задач.",
  monthBuiltByUpdatedAt: "Календарь построен по дате последнего обновления задач.",
  today: "Сегодня",
  moreTasks: "Ещё",
  createTeam: "Создать команду",
  teamName: "Название команды",
  teamNamePlaceholder: "Например, Product",
  teamColor: "Цвет команды",
  teamPm: "PM команды",
  selectPm: "Выберите PM",
  unknownName: "Без имени",
  cancel: "Отмена",
  createTeamAction: "Создать команду",
} as const;

export const CALENDAR_WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;