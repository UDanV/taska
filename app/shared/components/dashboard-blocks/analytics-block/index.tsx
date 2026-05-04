export default function AnalyticsMetricBlock({
    label,
    value,
    description,
    descriptionClassName = "text-muted-foreground",
    variant = "default",
}: {
    label: string;
    value: number | string;
    description?: string;
    descriptionClassName?: string;
    variant?: "default" | "muted";
}) {
    const blockClassName =
        variant === "muted"
            ? "rounded-3xl bg-muted p-4"
            : "rounded-3xl border border-border bg-background p-4";

    return (
        <div className={blockClassName}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            {description ? (
                <p className={`mt-2 text-sm ${descriptionClassName}`}>{description}</p>
            ) : null}
        </div>
    );
}