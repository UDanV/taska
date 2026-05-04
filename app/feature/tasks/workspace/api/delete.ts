export async function deleteTask(taskId: string) {
  const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Не удалось удалить задачу");
  }
}
