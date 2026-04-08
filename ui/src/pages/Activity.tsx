import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { activityApi } from "../api/activity";
import { agentsApi } from "../api/agents";
import { issuesApi } from "../api/issues";
import { projectsApi } from "../api/projects";
import { goalsApi } from "../api/goals";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useLanguage } from "../context/LanguageContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { ActivityRow } from "../components/ActivityRow";
import { PageSkeleton } from "../components/PageSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History } from "lucide-react";
import type { Agent } from "@paperclipai/shared";

/**
 * 活动页面组件
 * @author <smallletters@sina.com>
 * @date 2026-04-07
 */
export function Activity() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setBreadcrumbs([{ label: t("page.activity.title") }]);
  }, [setBreadcrumbs, t]);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.activity(selectedCompanyId!),
    queryFn: () => activityApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: agents } = useQuery({
    queryKey: queryKeys.agents.list(selectedCompanyId!),
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: issues } = useQuery({
    queryKey: queryKeys.issues.list(selectedCompanyId!),
    queryFn: () => issuesApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: projects } = useQuery({
    queryKey: queryKeys.projects.list(selectedCompanyId!),
    queryFn: () => projectsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: goals } = useQuery({
    queryKey: queryKeys.goals.list(selectedCompanyId!),
    queryFn: () => goalsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const agentMap = useMemo(() => {
    const map = new Map<string, Agent>();
    for (const a of agents ?? []) map.set(a.id, a);
    return map;
  }, [agents]);

  const entityNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const i of issues ?? []) map.set(`issue:${i.id}`, i.identifier ?? i.id.slice(0, 8));
    for (const a of agents ?? []) map.set(`agent:${a.id}`, a.name);
    for (const p of projects ?? []) map.set(`project:${p.id}`, p.name);
    for (const g of goals ?? []) map.set(`goal:${g.id}`, g.title);
    return map;
  }, [issues, agents, projects, goals]);

  const entityTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const i of issues ?? []) map.set(`issue:${i.id}`, i.title);
    return map;
  }, [issues]);

  if (!selectedCompanyId) {
    return <EmptyState icon={History} message={t("page.activity.selectCompany")} />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  if (error) {
    return (
      <EmptyState
        icon={History}
        message={error instanceof Error ? error.message : t("error.loadFailed")}
      />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState icon={History} message={t("page.activity.noActivity")} />;
  }

  const filtered =
    data && filter !== "all"
      ? data.filter((e) => e.entityType === filter)
      : data;

  const entityTypes = data
    ? [...new Set(data.map((e) => e.entityType))].sort()
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("label.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("label.allTypes")}</SelectItem>
            <SelectItem value="issue">{t("entity.issue")}</SelectItem>
            <SelectItem value="agent">{t("entity.agent")}</SelectItem>
            <SelectItem value="project">{t("entity.project")}</SelectItem>
            <SelectItem value="company">{t("entity.company")}</SelectItem>
            <SelectItem value="goal">{t("entity.goal")}</SelectItem>
            <SelectItem value="budget">{t("entity.budget")}</SelectItem>
            <SelectItem value="approval">{t("entity.approval")}</SelectItem>
            <SelectItem value="cost">{t("entity.cost")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered && filtered.length === 0 && (
        <EmptyState icon={History} message={t("page.activity.noActivity")} />
      )}

      {filtered && filtered.length > 0 && (
        <div className="border border-border divide-y divide-border">
          {filtered.map((event) => (
            <ActivityRow
              key={event.id}
              event={event}
              agentMap={agentMap}
              entityNameMap={entityNameMap}
              entityTitleMap={entityTitleMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
