import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PatchInstanceGeneralSettings } from "@paperclipai/shared";
import { LogOut, SlidersHorizontal } from "lucide-react";
import { authApi } from "@/api/auth";
import { instanceSettingsApi } from "@/api/instanceSettings";
import { Button } from "../components/ui/button";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useLanguage } from "../context/LanguageContext";
import { queryKeys } from "../lib/queryKeys";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "../lib/utils";

const FEEDBACK_TERMS_URL = import.meta.env.VITE_FEEDBACK_TERMS_URL?.trim() || "https://paperclip.ing/tos";

/**
 * 实例常规设置页面组件
 * @author <smallletters@sina.com>
 * @date 2026-04-07
 */
export function InstanceGeneralSettings() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const signOutMutation = useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : t("page.instanceSettings.failedSignOut"));
    },
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: t("page.instanceSettings.title") },
      { label: t("page.instanceSettings.general") },
    ]);
  }, [setBreadcrumbs, t]);

  const generalQuery = useQuery({
    queryKey: queryKeys.instance.generalSettings,
    queryFn: () => instanceSettingsApi.getGeneral(),
  });

  const updateGeneralMutation = useMutation({
    mutationFn: instanceSettingsApi.updateGeneral,
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.instance.generalSettings });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : t("page.instanceSettings.failedUpdateGeneral"));
    },
  });

  if (generalQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">{t("page.instanceSettings.loadingGeneral")}</div>;
  }

  if (generalQuery.error) {
    return (
      <div className="text-sm text-destructive">
        {generalQuery.error instanceof Error
          ? generalQuery.error.message
          : t("page.instanceSettings.failedLoadGeneral")}
      </div>
    );
  }

  const censorUsernameInLogs = generalQuery.data?.censorUsernameInLogs === true;
  const keyboardShortcuts = generalQuery.data?.keyboardShortcuts === true;
  const feedbackDataSharingPreference = generalQuery.data?.feedbackDataSharingPreference ?? "prompt";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">{t("page.instanceSettings.generalTitle")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("page.instanceSettings.generalDescription")}
        </p>
      </div>

      {actionError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {actionError}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("page.instanceSettings.censorUsername")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("page.instanceSettings.censorUsernameDesc")}
            </p>
          </div>
          <ToggleSwitch
            checked={censorUsernameInLogs}
            onCheckedChange={() => updateGeneralMutation.mutate({ censorUsernameInLogs: !censorUsernameInLogs })}
            disabled={updateGeneralMutation.isPending}
            aria-label="Toggle username log censoring"
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("page.instanceSettings.keyboardShortcuts")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("page.instanceSettings.keyboardShortcutsDesc")}
            </p>
          </div>
          <ToggleSwitch
            checked={keyboardShortcuts}
            onCheckedChange={() => updateGeneralMutation.mutate({ keyboardShortcuts: !keyboardShortcuts })}
            disabled={updateGeneralMutation.isPending}
            aria-label="Toggle keyboard shortcuts"
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("page.instanceSettings.aiFeedbackSharing")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("page.instanceSettings.aiFeedbackSharingDesc")}
            </p>
            {FEEDBACK_TERMS_URL ? (
              <a
                href={FEEDBACK_TERMS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {t("page.instanceSettings.readTerms")}
              </a>
            ) : null}
          </div>
          {feedbackDataSharingPreference === "prompt" ? (
            <div className="rounded-lg border border-border/70 bg-accent/20 px-3 py-2 text-sm text-muted-foreground">
              {t("page.instanceSettings.noDefaultSaved")}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {[
              {
                value: "allowed",
                label: t("page.instanceSettings.alwaysAllow"),
                description: t("page.instanceSettings.shareVotedAi"),
              },
              {
                value: "not_allowed",
                label: t("page.instanceSettings.dontAllow"),
                description: t("page.instanceSettings.keepLocalOnly"),
              },
            ].map((option) => {
              const active = feedbackDataSharingPreference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={updateGeneralMutation.isPending}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    active
                      ? "border-foreground bg-accent text-foreground"
                      : "border-border bg-background hover:bg-accent/50",
                  )}
                  onClick={() =>
                    updateGeneralMutation.mutate({
                      feedbackDataSharingPreference: option.value as
                        | "allowed"
                        | "not_allowed",
                    })
                  }
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("page.instanceSettings.retestPrompt")}{" "}
            <code>feedbackDataSharingPreference</code> {t("page.instanceSettings.fromJsonRow")}{" "}
            <code>instance_settings.general</code> {t("page.instanceSettings.jsonRowFor")}{" "}
            <code>"prompt"</code>. {t("page.instanceSettings.unsetAndPrompt")} <code>"prompt"</code> {t("page.instanceSettings.bothMean")}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("page.instanceSettings.signOut")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("page.instanceSettings.signOutDesc")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={signOutMutation.isPending}
            onClick={() => signOutMutation.mutate()}
          >
            <LogOut className="size-4" />
            {signOutMutation.isPending ? t("page.instanceSettings.signingOut") : t("page.instanceSettings.signOut")}
          </Button>
        </div>
      </section>
    </div>
  );
}
