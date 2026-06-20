"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Activity,
  AppState,
  Campaign,
  CampaignStatus,
  Channel,
  Exclusion,
  ExclusionType,
  Feedback,
  ProductType,
  Target,
  TargetStatus,
} from "./types";
import { initialState } from "./seed";
import { findExclusion, nowIso, uid } from "./utils";
import { Logo } from "@/components/brand/Logo";
import { LightKun } from "@/components/brand/LightKun";

const KEY = "apodori_state_v1";

interface NewExclusionInput {
  companyName: string;
  storeName?: string;
  email?: string;
  phone?: string;
  address?: string;
  type: ExclusionType;
  reason?: string;
}

interface StoreContextValue {
  state: AppState;
  addExclusion: (input: NewExclusionInput) => void;
  setExclusionActive: (id: string, active: boolean) => void;
  importExclusions: (rows: NewExclusionInput[]) => number;
  runSync: (source: "salesforce" | "sheets") => void;
  runExclusionCheck: (campaignId?: string) => { checked: number; excluded: number };
  setTargetStatus: (id: string, status: TargetStatus) => void;
  addCampaign: (input: {
    name: string;
    productType: ProductType;
    area: string;
    targetCriteria: string;
  }) => void;
  setCampaignStatus: (id: string, status: CampaignStatus) => void;
  addActivity: (input: {
    targetId: string;
    campaignId: string;
    channel: Channel;
    subject: string;
    body: string;
    variant?: "A" | "B";
  }) => Activity;
  sendActivity: (id: string) => { ok: boolean; reason?: string };
  addFeedback: (input: {
    targetType: Feedback["targetType"];
    targetId: string;
    rating: "good" | "bad";
    comment?: string;
  }) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => initialState());
  const [mounted, setMounted] = useState(false);

  // 初回マウントで localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed && parsed.version === 1) setState(parsed);
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  // 変更を永続化
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, mounted]);

  const addExclusion = useCallback((input: NewExclusionInput) => {
    setState((s) => ({
      ...s,
      exclusions: [
        {
          id: uid("ex"),
          companyName: input.companyName,
          storeName: input.storeName,
          email: input.email,
          emailDomain: input.email ? input.email.split("@")[1] : undefined,
          phone: input.phone,
          address: input.address,
          type: input.type,
          source: "manual",
          reason: input.reason,
          addedBy: "admin",
          isActive: true,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
        ...s.exclusions,
      ],
    }));
  }, []);

  const setExclusionActive = useCallback((id: string, active: boolean) => {
    setState((s) => ({
      ...s,
      exclusions: s.exclusions.map((e) =>
        e.id === id ? { ...e, isActive: active, updatedAt: nowIso() } : e
      ),
    }));
  }, []);

  const importExclusions = useCallback((rows: NewExclusionInput[]) => {
    let added = 0;
    setState((s) => {
      const next = [...s.exclusions];
      for (const r of rows) {
        if (!r.companyName) continue;
        next.unshift({
          id: uid("ex"),
          companyName: r.companyName,
          storeName: r.storeName,
          email: r.email,
          emailDomain: r.email ? r.email.split("@")[1] : undefined,
          phone: r.phone,
          address: r.address,
          type: r.type || "manual",
          source: "manual",
          reason: r.reason || "CSV一括インポート",
          addedBy: "admin",
          isActive: true,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        });
        added++;
      }
      return { ...s, exclusions: next };
    });
    return added;
  }, []);

  const runSync = useCallback((source: "salesforce" | "sheets") => {
    setState((s) => {
      const fetched = source === "salesforce" ? 400 + Math.floor(Math.random() * 40) : 50 + Math.floor(Math.random() * 20);
      const added = Math.floor(Math.random() * 4);
      const updated = Math.floor(Math.random() * 10);
      return {
        ...s,
        lastSync: { ...s.lastSync, [source]: nowIso() },
        syncLogs: [
          {
            id: uid("s"),
            source,
            ranAt: nowIso(),
            fetched,
            added,
            updated,
            errors: 0,
            status: "success" as const,
          },
          ...s.syncLogs,
        ].slice(0, 30),
      };
    });
  }, []);

  const runExclusionCheck = useCallback((campaignId?: string) => {
    let checked = 0;
    let excluded = 0;
    setState((s) => {
      const targets = s.targets.map((t) => {
        if (campaignId && t.campaignId !== campaignId) return t;
        if (t.status === "sent" || t.status === "replied" || t.status === "deal")
          return t;
        checked++;
        const hit = findExclusion(t, s.exclusions);
        if (hit) {
          excluded++;
          return {
            ...t,
            status: "excluded" as TargetStatus,
            excludedReason: `${hit.exclusion.companyName}（${hit.field}一致）`,
            exclusionCheckAt: nowIso(),
          };
        }
        return {
          ...t,
          status: t.status === "excluded" ? ("pending" as TargetStatus) : t.status,
          excludedReason: undefined,
          exclusionCheckAt: nowIso(),
        };
      });
      return { ...s, targets };
    });
    return { checked, excluded };
  }, []);

  const setTargetStatus = useCallback((id: string, status: TargetStatus) => {
    setState((s) => ({
      ...s,
      targets: s.targets.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
  }, []);

  const addCampaign = useCallback(
    (input: { name: string; productType: ProductType; area: string; targetCriteria: string }) => {
      const campaign: Campaign = {
        id: uid("c"),
        name: input.name,
        status: "draft",
        productType: input.productType,
        area: input.area,
        targetCriteria: input.targetCriteria,
        createdAt: nowIso(),
      };
      setState((s) => ({ ...s, campaigns: [...s.campaigns, campaign] }));
    },
    []
  );

  const setCampaignStatus = useCallback((id: string, status: CampaignStatus) => {
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  }, []);

  const addActivity = useCallback(
    (input: {
      targetId: string;
      campaignId: string;
      channel: Channel;
      subject: string;
      body: string;
      variant?: "A" | "B";
    }) => {
      const activity: Activity = {
        id: uid("a"),
        targetId: input.targetId,
        campaignId: input.campaignId,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
        status: "queued",
        variant: input.variant,
        createdAt: nowIso(),
      };
      setState((s) => ({ ...s, activities: [activity, ...s.activities] }));
      return activity;
    },
    []
  );

  /** 送信直前の最終除外チェック（§F2 受け入れ条件）。一致したら物理ブロック。 */
  const sendActivity = useCallback((id: string) => {
    let result: { ok: boolean; reason?: string } = { ok: true };
    setState((s) => {
      const activity = s.activities.find((a) => a.id === id);
      if (!activity) {
        result = { ok: false, reason: "アクティビティが見つかりません" };
        return s;
      }
      const target = s.targets.find((t) => t.id === activity.targetId);
      if (!target) {
        result = { ok: false, reason: "ターゲットが見つかりません" };
        return s;
      }
      const hit = findExclusion(target, s.exclusions);
      if (hit) {
        result = {
          ok: false,
          reason: `${hit.exclusion.companyName}（${hit.field}一致・${hit.exclusion.type}）`,
        };
        return {
          ...s,
          activities: s.activities.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "blocked",
                  blockedReason: result.reason,
                  exclusionVerifiedAt: nowIso(),
                }
              : a
          ),
          targets: s.targets.map((t) =>
            t.id === target.id
              ? { ...t, status: "excluded", excludedReason: result.reason }
              : t
          ),
        };
      }
      result = { ok: true };
      return {
        ...s,
        activities: s.activities.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "sent",
                sentAt: nowIso(),
                exclusionVerifiedAt: nowIso(),
              }
            : a
        ),
        targets: s.targets.map((t) =>
          t.id === target.id ? { ...t, status: "sent" } : t
        ),
      };
    });
    return result;
  }, []);

  const addFeedback = useCallback(
    (input: {
      targetType: Feedback["targetType"];
      targetId: string;
      rating: "good" | "bad";
      comment?: string;
    }) => {
      setState((s) => ({
        ...s,
        feedbacks: [
          {
            id: uid("f"),
            targetType: input.targetType,
            targetId: input.targetId,
            rating: input.rating,
            comment: input.comment,
            createdAt: nowIso(),
          },
          ...s.feedbacks,
        ],
      }));
    },
    []
  );

  const resetDemo = useCallback(() => {
    const fresh = initialState();
    setState(fresh);
    try {
      localStorage.setItem(KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      addExclusion,
      setExclusionActive,
      importExclusions,
      runSync,
      runExclusionCheck,
      setTargetStatus,
      addCampaign,
      setCampaignStatus,
      addActivity,
      sendActivity,
      addFeedback,
      resetDemo,
    }),
    [
      state,
      addExclusion,
      setExclusionActive,
      importExclusions,
      runSync,
      runExclusionCheck,
      setTargetStatus,
      addCampaign,
      setCampaignStatus,
      addActivity,
      sendActivity,
      addFeedback,
      resetDemo,
    ]
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink-950 bg-ink-radial">
        <Logo className="h-10 w-auto opacity-90" />
        <LightKun className="h-28 w-auto animate-float" />
        <div className="flex items-center gap-2 text-sm text-ink-300">
          <span className="h-2 w-2 animate-ping rounded-full bg-brand-500" />
          読み込み中…
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
