export const TASKS_WORKSPACE_QUERY_KEY = ["tasks-workspace"] as const;
export const TASKS_TEAM_MANAGERS_QUERY_KEY = ["tasks-team-managers"] as const;

export const TASKS_COMMENTS_QUERY_KEY = (taskId: string | null) =>
  ["task-comments", taskId] as const;
