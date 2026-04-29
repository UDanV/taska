export function formatCreatedAt(value: string) {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(value));
}