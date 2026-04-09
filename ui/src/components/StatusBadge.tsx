import { cn } from "../lib/utils";
import { statusBadge, statusBadgeDefault } from "../lib/status-colors";
import { useLanguage } from "../context/LanguageContext";

export function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();

  // Map status values to translation keys
  const statusKeyMap: Record<string, string> = {
    backlog: "newIssue.backlog",
    planned: "newIssue.planned",
    in_progress: "newIssue.inProgress",
    in_review: "newIssue.inReview",
    completed: "newProject.completed",
    done: "newIssue.done",
    cancelled: "newIssue.cancelled",
    blocked: "newIssue.blocked",
  };

  const translationKey = statusKeyMap[status];
  const displayText = translationKey ? t(translationKey) : status.replace("_", " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0",
        statusBadge[status] ?? statusBadgeDefault
      )}
    >
      {displayText}
    </span>
  );
}
