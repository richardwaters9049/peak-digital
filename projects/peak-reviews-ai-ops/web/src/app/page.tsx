"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Code2,
  Filter,
  Gauge,
  GitBranch,
  Inbox,
  Layers3,
  Loader2,
  LogIn,
  LogOut,
  MessageSquareReply,
  Moon,
  Play,
  PlugZap,
  Radar,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  UserRound,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "dashboard" | "reviews" | "automations" | "webhooks";
type ThemeMode = "dark" | "light";

type Session = {
  name: string;
  email: string;
  role: string;
};

type ReviewAnalysis = {
  sentiment: string;
  urgency: string;
  topic_tags: string[];
  likely_root_cause: string;
  recommended_action: string;
  reply_draft: string;
  confidence: number;
  used_fallback: boolean;
};

type Review = {
  id: number;
  source: string;
  customer_name: string;
  rating: number;
  title: string | null;
  body: string;
  status: string;
  reviewed_at: string;
  analysis?: ReviewAnalysis | null;
  location?: {
    name: string;
    city: string;
    business?: { name: string };
  };
  automation_runs?: AutomationRun[];
};

type DashboardSummary = {
  metrics: {
    review_volume: number;
    average_rating: number;
    negative_alerts: number;
    response_sla: number;
    ai_coverage: number;
  };
  rating_distribution: { rating: number; count: number }[];
  trends: { topic: string; count: number }[];
  recent_ai_logs: {
    id: number;
    task: string;
    provider: string;
    model: string;
    estimated_tokens: number;
    used_fallback: boolean;
    created_at: string;
  }[];
};

type AutomationWorkflow = {
  id: number;
  name: string;
  trigger: string;
  description: string;
  enabled: boolean;
  steps: { name: string; detail: string }[];
  runs_count?: number;
};

type AutomationRun = {
  id: number;
  status: string;
  payload: Record<string, string | number | null>;
  events: { step?: number; name: string; status?: string; detail: string; timestamp?: string }[];
  ran_at: string;
  workflow?: { id: number; name: string };
  review?: Review;
};

const fallbackReviews: Review[] = [
  {
    id: 1,
    source: "google",
    customer_name: "Amelia Jones",
    rating: 2,
    title: "Refund took too long",
    body: "The appointment was cancelled and the refund process took nearly three weeks. Support were polite but I had to chase by email twice.",
    status: "escalated",
    reviewed_at: "2026-07-08T10:15:00.000Z",
    location: { name: "Liverpool Central", city: "Liverpool", business: { name: "Northstar Dental Group" } },
    analysis: {
      sentiment: "negative",
      urgency: "high",
      topic_tags: ["returns", "support"],
      likely_root_cause: "Returns process friction",
      recommended_action: "Escalate to customer care and create a same-day recovery task.",
      reply_draft:
        "Hi Amelia, thank you for flagging this. I am sorry your experience fell short, especially around returns. Our team will contact you directly today with a clear next step.",
      confidence: 88,
      used_fallback: true,
    },
  },
  {
    id: 2,
    source: "facebook",
    customer_name: "Marcus Lee",
    rating: 5,
    title: "Brilliant service",
    body: "Really helpful staff and clear communication before and after the appointment. Booking was simple and the team were friendly.",
    status: "responded",
    reviewed_at: "2026-07-07T13:30:00.000Z",
    location: { name: "Liverpool Central", city: "Liverpool", business: { name: "Northstar Dental Group" } },
    analysis: {
      sentiment: "positive",
      urgency: "low",
      topic_tags: ["support"],
      likely_root_cause: "Strong service experience",
      recommended_action: "Thank the customer and route praise into the weekly digest.",
      reply_draft: "Hi Marcus, thank you for the lovely review. We really appreciate you taking the time to share it.",
      confidence: 81,
      used_fallback: true,
    },
  },
];

const fallbackSummary: DashboardSummary = {
  metrics: {
    review_volume: 6,
    average_rating: 3.33,
    negative_alerts: 2,
    response_sla: 50,
    ai_coverage: 100,
  },
  rating_distribution: [
    { rating: 5, count: 2 },
    { rating: 4, count: 1 },
    { rating: 3, count: 1 },
    { rating: 2, count: 1 },
    { rating: 1, count: 1 },
  ],
  trends: [
    { topic: "support", count: 3 },
    { topic: "returns", count: 1 },
    { topic: "delivery", count: 1 },
    { topic: "pricing", count: 1 },
  ],
  recent_ai_logs: [
    {
      id: 1,
      task: "review_analysis",
      provider: "fallback",
      model: "deterministic-demo-v1",
      estimated_tokens: 184,
      used_fallback: true,
      created_at: "2026-07-09T09:00:00.000Z",
    },
  ],
};

const fallbackWorkflows: AutomationWorkflow[] = [
  {
    id: 1,
    name: "Negative Review Rescue",
    trigger: "rating <= 2 or urgency = high",
    description: "Escalates unhappy customers, drafts a public reply, and opens a same-day recovery task.",
    enabled: true,
    runs_count: 1,
    steps: [
      { name: "Classify review", detail: "AI scores urgency, sentiment, topic tags, and root cause." },
      { name: "Draft owner reply", detail: "Generate a brand-safe acknowledgement for public response." },
      { name: "Create recovery task", detail: "Assign customer care to contact the reviewer within one business day." },
    ],
  },
  {
    id: 2,
    name: "Review Request Follow-up",
    trigger: "completed appointment + no review after 48h",
    description: "Sends personalised follow-up requests after successful visits.",
    enabled: true,
    runs_count: 0,
    steps: [
      { name: "Check consent", detail: "Confirm the customer can receive review request messaging." },
      { name: "Personalise request", detail: "Create a short message tailored to the visit." },
      { name: "Queue reminder", detail: "Schedule SMS/email through the preferred platform." },
    ],
  },
];

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
  { id: "reviews" as const, label: "Reviews", icon: Inbox },
  { id: "automations" as const, label: "Automation", icon: GitBranch },
  { id: "webhooks" as const, label: "API", icon: Webhook },
];

const demoUsers: Session[] = [
  { name: "Demo Operator", email: "operator@peakreviews.local", role: "Ops Lead" },
  { name: "Agency Admin", email: "admin@peakreviews.local", role: "Admin" },
];

const workflowSteps: { label: string; icon: LucideIcon; description: string }[] = [
  {
    label: "Ingest",
    icon: Webhook,
    description: "Collect review payloads from Google, Facebook, Tripadvisor-style sources, webhooks, and fallback demo events.",
  },
  {
    label: "Analyse",
    icon: Sparkles,
    description: "Run AI sentiment, urgency, topic, root-cause, and confidence checks with a deterministic fallback when OpenAI is unavailable.",
  },
  {
    label: "Reply",
    icon: MessageSquareReply,
    description: "Generate a brand-safe owner response that acknowledges the issue and keeps the public reply concise.",
  },
  {
    label: "Recover",
    icon: GitBranch,
    description: "Trigger follow-up automation for unhappy customers, including owner alerts and same-day recovery tasks.",
  },
];

const themeVars: Record<ThemeMode, CSSProperties> = {
  dark: {
    "--app-bg": "#06151e",
    "--app-bg-soft": "#081e2b",
    "--surface": "#081e2b",
    "--surface-2": "#0b2636",
    "--surface-3": "#103b56",
    "--line": "rgba(116, 204, 241, 0.22)",
    "--line-strong": "rgba(116, 204, 241, 0.42)",
    "--text": "#f0f0f5",
    "--muted": "#a2ddf6",
    "--faint": "#74ccf1",
    "--accent": "#17a9e8",
    "--accent-2": "#01c7fe",
    "--accent-soft": "rgba(23, 169, 232, 0.16)",
    "--danger": "#f86f6d",
    "--danger-soft": "rgba(248, 111, 109, 0.14)",
    "--success": "#67ddfe",
    "--success-soft": "rgba(103, 221, 254, 0.14)",
    "--shadow": "rgba(0, 0, 0, 0.38)",
  } as CSSProperties,
  light: {
    "--app-bg": "#e8f6fd",
    "--app-bg-soft": "#f5fbff",
    "--surface": "#ffffff",
    "--surface-2": "#f5fbff",
    "--surface-3": "#e6f9ff",
    "--line": "rgba(162, 221, 246, 0.86)",
    "--line-strong": "#74ccf1",
    "--text": "#06151e",
    "--muted": "#0e668b",
    "--faint": "#2076ac",
    "--accent": "#17a9e8",
    "--accent-2": "#01c7fe",
    "--accent-soft": "rgba(23, 169, 232, 0.16)",
    "--danger": "#f40f0b",
    "--danger-soft": "rgba(244, 15, 11, 0.12)",
    "--success": "#1287ba",
    "--success-soft": "rgba(18, 135, 186, 0.14)",
    "--shadow": "rgba(3, 24, 32, 0.12)",
  } as CSSProperties,
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/backend${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function badgeStyle(value: string): CSSProperties {
  const normalized = value.toLowerCase();

  if (["high", "negative", "escalated"].includes(normalized)) {
    return { color: "var(--danger)", background: "var(--danger-soft)", borderColor: "var(--danger)" };
  }

  if (["low", "positive", "responded", "completed", "enabled"].includes(normalized)) {
    return { color: "var(--success)", background: "var(--success-soft)", borderColor: "var(--success)" };
  }

  return { color: "var(--accent)", background: "var(--accent-soft)", borderColor: "var(--accent)" };
}

export default function Home() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [selectedReviewId, setSelectedReviewId] = useState<number>(1);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(fallbackWorkflows);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [notice, setNotice] = useState("Demo fallback ready");

  const selectedReview = reviews.find((review) => review.id === selectedReviewId) ?? reviews[0];
  const isDark = theme === "dark";

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSource = source === "all" || review.source === source;
      const haystack = `${review.customer_name} ${review.title ?? ""} ${review.body}`.toLowerCase();
      return matchesSource && haystack.includes(query.toLowerCase());
    });
  }, [query, reviews, source]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryData, reviewData, automationData] = await Promise.all([
        apiFetch<DashboardSummary>("/api/dashboard/summary"),
        apiFetch<{ data: Review[] }>("/api/reviews"),
        apiFetch<{ workflows: AutomationWorkflow[]; runs: AutomationRun[] }>("/api/automations"),
      ]);

      setSummary(summaryData);
      setReviews(reviewData.data);
      setSelectedReviewId(reviewData.data[0]?.id ?? 1);
      setWorkflows(automationData.workflows);
      setRuns(automationData.runs);
      setNotice("Live Laravel API connected");
    } catch {
      setNotice("Using deterministic demo data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshData();
  }, [refreshData]);

  async function analyseReview(review: Review) {
    setIsMutating(true);
    try {
      const data = await apiFetch<{ review: Review }>(`/api/reviews/${review.id}/analyse`, { method: "POST" });
      setReviews((current) => current.map((item) => (item.id === review.id ? data.review : item)));
      setNotice("AI analysis refreshed");
    } catch {
      setNotice("Demo mode kept the existing fallback analysis");
    } finally {
      setIsMutating(false);
    }
  }

  async function runWorkflow(workflow: AutomationWorkflow) {
    setIsMutating(true);
    try {
      const run = await apiFetch<AutomationRun>(`/api/automations/${workflow.id}/run`, {
        method: "POST",
        body: JSON.stringify({ review_id: selectedReview?.id }),
      });
      setRuns((current) => [run, ...current]);
      setNotice(`${workflow.name} completed`);
    } catch {
      const run: AutomationRun = {
        id: 1000 + runs.length,
        status: "completed",
        payload: { triggered_by: "frontend_fallback" },
        events: workflow.steps.map((step, index) => ({ ...step, step: index + 1, status: "completed" })),
        ran_at: "2026-07-09T10:00:00.000Z",
        workflow: { id: workflow.id, name: workflow.name },
        review: selectedReview,
      };
      setRuns((current) => [run, ...current]);
      setNotice("Fallback automation timeline created");
    } finally {
      setIsMutating(false);
    }
  }

  async function ingestSampleReview() {
    setIsMutating(true);
    const payload = {
      customer_name: "Priya Shah",
      customer_email: "priya@example.com",
      rating: 1,
      title: "No update on refund",
      body: "I returned my order last week and still have no refund update. Support has not replied and I am getting frustrated.",
    };

    try {
      const review = await apiFetch<Review>("/api/webhooks/reviews/google", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setReviews((current) => [review, ...current]);
      setSelectedReviewId(review.id);
      setActiveTab("reviews");
      setNotice("Webhook review ingested and analysed");
    } catch {
      const review: Review = {
        id: 9001 + reviews.length,
        source: "google",
        status: "escalated",
        reviewed_at: "2026-07-09T11:00:00.000Z",
        ...payload,
        analysis: {
          sentiment: "negative",
          urgency: "high",
          topic_tags: ["returns", "support"],
          likely_root_cause: "Returns process friction",
          recommended_action: "Escalate to customer care and create a same-day recovery task.",
          reply_draft: "Hi Priya, thank you for flagging this. I am sorry the refund update has not been clear. Our team will contact you today with the next step.",
          confidence: 88,
          used_fallback: true,
        },
      };
      setReviews((current) => [review, ...current]);
      setSelectedReviewId(review.id);
      setActiveTab("reviews");
      setNotice("Fallback webhook review added");
    } finally {
      setIsMutating(false);
    }
  }

  if (!session) {
    return (
      <div style={themeVars[theme]} className="min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-[var(--text)]">
        <LoginScreen
          isDark={isDark}
          setTheme={setTheme}
          theme={theme}
          onLogin={setSession}
        />
      </div>
    );
  }

  return (
    <main style={themeVars[theme]} className="min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-[var(--text)]">
      <AppHeader
        activeTab={activeTab}
        isDark={isDark}
        onLogout={() => setSession(null)}
        session={session}
        setActiveTab={setActiveTab}
        setTheme={setTheme}
        theme={theme}
      />

      <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,430px)]">
          <div className="min-w-0 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_var(--shadow)] sm:p-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent)]">
              <Sparkles size={16} />
              AI-native review operations
            </div>
            <h1 className="max-w-4xl break-words text-3xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Turn reputation signals into recoverable customer moments.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              A Peak Reviews workspace for ingestion, AI triage, reply drafting, and follow-up automation across every location.
            </p>
          </div>
          <div className="min-w-0 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_var(--shadow)]">
            <p className="text-sm font-semibold text-[var(--muted)]">Demo control</p>
            <p className="mt-2 text-sm leading-6 text-[var(--faint)]">{notice}</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <button
                onClick={refreshData}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--text)]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                Refresh
              </button>
              <button
                onClick={ingestSampleReview}
                disabled={isMutating}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-3 text-sm font-bold text-white disabled:opacity-60"
              >
                <PlugZap size={16} />
                Webhook
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Dashboard summary={summary} />
            </motion.div>
          )}
          {activeTab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Reviews
                analyseReview={analyseReview}
                isMutating={isMutating}
                query={query}
                reviews={filteredReviews}
                runWorkflow={() => workflows[0] && runWorkflow(workflows[0])}
                selectedReview={selectedReview}
                selectedReviewId={selectedReviewId}
                setQuery={setQuery}
                setSelectedReviewId={setSelectedReviewId}
                setSource={setSource}
                source={source}
              />
            </motion.div>
          )}
          {activeTab === "automations" && (
            <motion.div key="automations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Automations workflows={workflows} runs={runs} isMutating={isMutating} runWorkflow={runWorkflow} />
            </motion.div>
          )}
          {activeTab === "webhooks" && (
            <motion.div key="webhooks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Webhooks ingestSampleReview={ingestSampleReview} isMutating={isMutating} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

function LoginScreen({
  isDark,
  onLogin,
  setTheme,
  theme,
}: {
  isDark: boolean;
  onLogin: (session: Session) => void;
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
}) {
  const [selectedWorkflowIndex, setSelectedWorkflowIndex] = useState(0);

  return (
    <main className="grid min-h-screen min-w-0 overflow-x-hidden bg-[var(--app-bg)] lg:grid-cols-[88px_minmax(0,1fr)_minmax(320px,460px)]">
      <SignalRail selectedIndex={selectedWorkflowIndex} setSelectedIndex={setSelectedWorkflowIndex} />

      <section className="flex min-h-[62vh] min-w-0 flex-col px-4 py-6 sm:px-8 lg:min-h-screen lg:px-10 xl:px-14">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <BrandMark />
          <ThemeToggle isDark={isDark} setTheme={setTheme} theme={theme} />
        </div>

        <div className="grid flex-1 min-w-0 items-center gap-8 py-8 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]">
          <div className="min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--accent)] shadow-[0_14px_44px_var(--shadow)]">
              <ShieldCheck size={16} />
              Laravel, OpenAI, queues, webhooks
            </div>
            <h1 className="max-w-4xl break-words text-4xl font-semibold leading-[1.02] tracking-normal text-[var(--text)] sm:text-5xl xl:text-6xl">
              Make every public review feel recoverable.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              A calm operations desk for local-business teams: ingest review signals, ask AI what matters, draft a brand-safe response, and trigger the right follow-up.
            </p>

            <WorkflowStrip selectedIndex={selectedWorkflowIndex} setSelectedIndex={setSelectedWorkflowIndex} />
          </div>

          <ReviewRadar />
        </div>
      </section>

      <section className="flex min-w-0 items-center border-t border-[var(--line)] bg-[var(--surface)] px-4 py-8 shadow-[0_24px_90px_var(--shadow)] sm:px-6 lg:border-l lg:border-t-0 lg:px-7">
        <div className="min-w-0 w-full rounded-[18px] border border-[var(--line)] bg-[var(--surface-2)] p-5 shadow-[0_24px_70px_var(--shadow)] sm:p-7">
          <div className="mb-7">
            <p className="text-sm font-semibold text-[var(--accent)]">Secure demo access</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">Enter the operations desk</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Choose a seeded identity and jump straight into the product dashboard.
            </p>
          </div>

          <div className="space-y-3">
            {demoUsers.map((user, index) => (
              <button
                key={user.email}
                onClick={() => onLogin(user)}
                className="group flex min-h-24 w-full min-w-0 items-center gap-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_18px_48px_var(--shadow)]"
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] text-sm font-bold text-white ${index === 0 ? "bg-[var(--accent)]" : "bg-[var(--danger)]"}`}>
                  {user.name.split(" ").map((part) => part[0]).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">{user.name}</span>
                  <span className="mt-1 block break-all text-sm text-[var(--muted)]">{user.email}</span>
                </span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white">
                  <LogIn size={16} />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[16px] border border-[var(--line)] bg-[var(--accent-soft)] p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-[var(--accent)]" size={19} />
              <p className="text-sm leading-6 text-[var(--muted)]">
                Demo mode works without private credentials. OpenAI is used when configured, with deterministic fallback when it is not.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SignalRail({
  selectedIndex,
  setSelectedIndex,
}: {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}) {
  return (
    <aside className="hidden min-h-screen border-r border-[var(--line)] bg-[var(--surface)] px-3 py-7 text-[var(--text)] lg:flex lg:flex-col lg:items-center lg:gap-5">
      <div className="grid size-14 place-items-center rounded-[16px] bg-[var(--accent)] text-xs font-bold text-white shadow-[0_18px_50px_var(--shadow)]">
        PR
      </div>
      {workflowSteps.map((step, index) => (
        <button
          key={step.label}
          type="button"
          onClick={() => setSelectedIndex(index)}
          aria-label={`Show ${step.label} workflow`}
          className={`grid size-14 place-items-center rounded-[16px] border text-xs font-bold transition ${
            selectedIndex === index
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_14px_38px_var(--shadow)]"
              : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </button>
      ))}
      <div className="mt-auto h-28 w-px bg-[var(--line-strong)]" />
    </aside>
  );
}

function WorkflowStrip({
  selectedIndex,
  setSelectedIndex,
}: {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}) {
  const selectedStep = workflowSteps[selectedIndex] ?? workflowSteps[0];
  const SelectedIcon = selectedStep.icon;

  return (
    <div className="mt-8 min-w-0">
      <div className="grid min-w-0 gap-3 sm:grid-cols-4">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = selectedIndex === index;

          return (
            <button
              key={step.label}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`min-w-0 rounded-[18px] border p-4 text-left shadow-[0_16px_44px_var(--shadow)] transition hover:-translate-y-0.5 ${
                isActive
                  ? "border-[var(--text)] bg-[var(--text)] text-[var(--app-bg)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)]"
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[var(--accent)]">0{index + 1}</span>
                <Icon size={18} />
              </div>
              <p className="text-base font-semibold">{step.label}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_16px_44px_var(--shadow)]">
        <div className="grid size-10 place-items-center rounded-[14px] bg-[var(--accent-soft)] text-[var(--accent)]">
          <SelectedIcon size={19} />
        </div>
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{selectedStep.label} workflow</p>
            <span className="shrink-0 rounded-full border border-[var(--line)] px-2 py-1 text-xs font-bold text-[var(--accent)]">
              0{selectedIndex + 1}
            </span>
          </div>
          <p className="text-sm leading-6 text-[var(--muted)]">{selectedStep.description}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewRadar() {
  const signals = [
    ["Refund delay", "high", "var(--danger)"],
    ["Staff praise", "low", "var(--success)"],
    ["Booking friction", "medium", "var(--accent)"],
  ];

  return (
    <div className="min-w-0 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_var(--shadow)]">
      <div className="mb-5 flex min-w-0 items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--muted)]">Live review radar</p>
          <p className="mt-1 text-2xl font-semibold">2 high-urgency signals</p>
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-[var(--accent-soft)] text-[var(--accent)]">
          <Radar size={22} />
        </div>
      </div>

      <div className="grid min-w-0 gap-5 sm:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[150px_minmax(0,1fr)]">
        <div className="relative mx-auto size-[150px] shrink-0 rounded-full border border-[var(--line-strong)] bg-[var(--surface-2)]">
          <div className="absolute left-1/2 top-1/2 size-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line)]" />
          <div className="absolute left-1/2 top-1/2 size-[58px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--accent)]" />
          <div className="absolute left-[58%] top-[24%] size-3 rounded-full bg-[var(--danger)] shadow-[0_0_0_8px_var(--danger-soft)]" />
          <div className="absolute left-[35%] top-[64%] size-2.5 rounded-full bg-[var(--success)] shadow-[0_0_0_7px_var(--success-soft)]" />
        </div>

        <div className="grid min-w-0 gap-2">
          {signals.map(([topic, level, color]) => (
            <div key={topic} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] px-3 py-3">
              <span className="size-2.5 rounded-full" style={{ background: color }} />
              <span className="truncate text-sm font-semibold">{topic}</span>
              <span className="text-xs font-bold capitalize" style={{ color }}>
                {level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppHeader({
  activeTab,
  isDark,
  onLogout,
  session,
  setActiveTab,
  setTheme,
  theme,
}: {
  activeTab: Tab;
  isDark: boolean;
  onLogout: () => void;
  session: Session;
  setActiveTab: (tab: Tab) => void;
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
}) {
  return (
    <header className="sticky top-0 z-20 overflow-x-hidden border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <BrandMark compact />
          <div className="hidden h-9 w-px bg-[var(--line)] sm:block" />
          <div>
            <p className="text-sm font-semibold">{session.name}</p>
            <p className="break-all text-xs text-[var(--muted)]">{session.email}</p>
          </div>
          <Badge value={session.role} />
        </div>

        <nav className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-3 text-sm font-semibold transition ${
                  activeTab === item.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <ThemeToggle isDark={isDark} setTheme={setTheme} theme={theme} />
          <button
            onClick={onLogout}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--muted)]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ summary }: { summary: DashboardSummary }) {
  const maxRatingCount = Math.max(...summary.rating_distribution.map((item) => item.count), 1);

  return (
    <div className="min-w-0 space-y-6">
      <section className="grid min-w-0 gap-5 xl:grid-cols-[260px_minmax(0,1fr)_minmax(280px,420px)]">
        <RecoveryQueue summary={summary} />
        <Panel>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent)]">
            <Layers3 size={16} />
            Client command layer
          </div>
          <h2 className="max-w-4xl break-words text-3xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Every review gets a route, not just a reply.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)]">
            The dashboard blends review analytics, LLM judgement, and automation state so operators can move quickly without losing context.
          </p>
          <div className="mt-7 grid min-w-0 gap-3 sm:grid-cols-3">
            <HeroMiniStat label="Review volume" value={summary.metrics.review_volume} />
            <HeroMiniStat label="Open alerts" value={summary.metrics.negative_alerts} />
            <HeroMiniStat label="Response SLA" value={`${summary.metrics.response_sla}%`} />
          </div>
        </Panel>
        <Panel>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">AI coverage</p>
              <p className="mt-2 text-5xl font-semibold">{summary.metrics.ai_coverage}%</p>
            </div>
            <Bot className="text-[var(--accent)]" size={28} />
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${summary.metrics.ai_coverage}%` }} />
          </div>
          <div className="mt-7 space-y-3">
            {summary.trends.slice(0, 3).map((trend) => (
              <div key={trend.topic} className="flex items-center justify-between rounded-[6px] bg-[var(--surface-2)] px-3 py-3">
                <span className="text-sm font-semibold capitalize">{trend.topic.replaceAll("_", " ")}</span>
                <span className="text-sm font-bold text-[var(--accent)]">{trend.count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <MetricCard label="Reviews" value={summary.metrics.review_volume} icon={Inbox} />
        <MetricCard label="Avg rating" value={summary.metrics.average_rating} icon={Star} />
        <MetricCard label="Negative alerts" value={summary.metrics.negative_alerts} icon={AlertTriangle} danger />
        <MetricCard label="Response SLA" value={`${summary.metrics.response_sla}%`} icon={Gauge} />
        <MetricCard label="AI coverage" value={`${summary.metrics.ai_coverage}%`} icon={Bot} />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <Panel title="Rating distribution" description="Current review mix across connected sources" icon={BarChart3}>
          <div className="space-y-3">
            {summary.rating_distribution.map((item) => (
              <div key={item.rating} className="grid grid-cols-[48px_1fr_32px] items-center gap-3">
                <div className="flex items-center gap-1 text-sm font-semibold text-[var(--muted)]">
                  {item.rating}
                  <Star size={13} className="fill-[var(--accent)] text-[var(--accent)]" />
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${Math.max(8, (item.count / maxRatingCount) * 100)}%` }}
                  />
                </div>
                <span className="text-right text-sm text-[var(--muted)]">{item.count}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="AI audit trail" description="Provider, model, fallback and token estimate" icon={Code2}>
          <div className="space-y-3">
            {summary.recent_ai_logs.map((log) => (
              <div key={log.id} className="rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] p-3">
                <p className="text-sm font-semibold">{log.task.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{log.provider} / {log.model}</p>
                <p className="mt-3 text-xs font-bold text-[var(--accent)]">{log.estimated_tokens} est. tokens</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RecoveryQueue({ summary }: { summary: DashboardSummary }) {
  return (
    <aside className="min-w-0 rounded-[24px] border border-[var(--line)] bg-[var(--text)] p-5 text-[var(--app-bg)] shadow-[0_24px_70px_var(--shadow)] xl:h-full">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-[var(--line-strong)]">Recovery queue</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--surface)]">Live action</h2>
        </div>
        <CircleDot className="text-[var(--accent)]" size={24} />
      </div>
      <p className="mb-5 text-sm leading-6 text-[color-mix(in_srgb,var(--surface)_72%,transparent)]">
        High-impact reviews that need attention before the next SLA window closes.
      </p>
      <div className="space-y-3">
        {[
          ["Refund delay", `${summary.metrics.negative_alerts} alerts`, true],
          ["Booking friction", "3h left", false],
          ["Weekly digest", `${summary.metrics.ai_coverage}% AI`, false],
        ].map(([title, meta, active]) => (
          <div
            key={String(title)}
            className={`rounded-[16px] border p-4 ${
              active
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[color-mix(in_srgb,var(--surface)_18%,transparent)] bg-[color-mix(in_srgb,var(--app-bg)_12%,transparent)] text-[var(--surface)]"
            }`}
          >
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs font-semibold opacity-80">{meta}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Reviews(props: {
  analyseReview: (review: Review) => void;
  isMutating: boolean;
  query: string;
  reviews: Review[];
  runWorkflow: () => void;
  selectedReview?: Review;
  selectedReviewId: number;
  setQuery: (value: string) => void;
  setSelectedReviewId: (value: number) => void;
  setSource: (value: string) => void;
  source: string;
}) {
  const { selectedReview } = props;

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,440px)]">
      <Panel title="Review queue" description="Triage by source, urgency, rating and root cause" icon={Inbox}>
        <div className="mb-4 flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] px-3">
            <Search size={16} className="text-[var(--muted)]" />
            <input
              value={props.query}
              onChange={(event) => props.setQuery(event.target.value)}
              placeholder="Search reviews"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--faint)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--muted)]" />
            <select
              value={props.source}
              onChange={(event) => props.setSource(event.target.value)}
              className="h-11 min-w-0 rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-sm font-semibold outline-none"
            >
              <option value="all">All sources</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="tripadvisor">Tripadvisor</option>
            </select>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[8px] border border-[var(--line)]">
          {props.reviews.map((review) => (
            <button
              key={review.id}
              onClick={() => props.setSelectedReviewId(review.id)}
              className={`grid w-full min-w-0 gap-3 border-b border-[var(--line)] px-4 py-4 text-left transition last:border-b-0 md:grid-cols-[minmax(0,1fr)_90px_auto] ${
                props.selectedReviewId === review.id ? "bg-[var(--accent-soft)]" : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
              }`}
            >
              <div className="min-w-0 overflow-hidden">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{review.customer_name}</span>
                  <Badge value={review.source} />
                  {review.analysis && <Badge value={review.analysis.urgency} />}
                </div>
                <p className="truncate text-sm font-semibold text-[var(--text)]">{review.title ?? "Untitled review"}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{review.body}</p>
              </div>
              <Stars rating={review.rating} />
              <Badge value={review.status} />
            </button>
          ))}
        </div>
      </Panel>

      {selectedReview && (
        <Panel title={selectedReview.customer_name} description={selectedReview.location?.business?.name ?? "Review detail"} icon={UserRound}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <Badge value={selectedReview.status} />
            <Stars rating={selectedReview.rating} />
          </div>
          <p className="break-words rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--muted)]">{selectedReview.body}</p>

          {selectedReview.analysis && (
            <div className="mt-5 space-y-4">
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                <Insight label="Sentiment" value={selectedReview.analysis.sentiment} />
                <Insight label="Urgency" value={selectedReview.analysis.urgency} />
                <Insight label="Confidence" value={`${selectedReview.analysis.confidence}%`} />
                <Insight label="Mode" value={selectedReview.analysis.used_fallback ? "fallback" : "OpenAI"} />
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-normal text-[var(--faint)]">Root cause</p>
                <p className="text-sm font-semibold">{selectedReview.analysis.likely_root_cause}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-normal text-[var(--faint)]">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReview.analysis.topic_tags.map((tag) => <Badge key={tag} value={tag} />)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-normal text-[var(--faint)]">Reply draft</p>
                <p className="break-words rounded-[6px] border border-[var(--line)] bg-[var(--accent-soft)] p-4 text-sm leading-6">
                  {selectedReview.analysis.reply_draft}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-2">
            <button
              onClick={() => props.analyseReview(selectedReview)}
              disabled={props.isMutating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[var(--accent)] px-3 text-sm font-bold text-white disabled:opacity-60"
            >
              <Bot size={16} />
              Re-run analysis
            </button>
            <button
              onClick={props.runWorkflow}
              disabled={props.isMutating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-sm font-semibold disabled:opacity-60"
            >
              <MessageSquareReply size={16} />
              Run rescue workflow
            </button>
          </div>
        </Panel>
      )}
    </div>
  );
}

function Automations({
  workflows,
  runs,
  isMutating,
  runWorkflow,
}: {
  workflows: AutomationWorkflow[];
  runs: AutomationRun[];
  isMutating: boolean;
  runWorkflow: (workflow: AutomationWorkflow) => void;
}) {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,430px)]">
      <section className="grid min-w-0 gap-4">
        {workflows.map((workflow) => (
          <Panel key={workflow.id}>
            <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <GitBranch size={18} className="text-[var(--accent)]" />
                  <h2 className="text-base font-semibold">{workflow.name}</h2>
                  <Badge value={workflow.enabled ? "enabled" : "paused"} />
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{workflow.description}</p>
                <p className="mt-2 text-xs font-bold text-[var(--faint)]">Trigger: {workflow.trigger}</p>
              </div>
              <button
                onClick={() => runWorkflow(workflow)}
                disabled={isMutating}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[6px] bg-[var(--accent)] px-3 text-sm font-bold text-white disabled:opacity-60"
              >
                <Play size={16} />
                Run
              </button>
            </div>
            <div className="mt-4 grid min-w-0 gap-2 md:grid-cols-3">
              {workflow.steps.map((step) => (
                <div key={step.name} className="rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] p-3">
                  <p className="text-sm font-semibold">{step.name}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{step.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </section>
      <Panel title="Run timeline" description="Completed automation events" icon={ClipboardList}>
        <div className="space-y-4">
          {runs.map((run) => (
            <div key={run.id} className="rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{run.workflow?.name ?? "Automation run"}</p>
                <Badge value={run.status} />
              </div>
              <div className="space-y-2">
                {run.events.map((event, index) => (
                  <div key={`${event.name}-${index}`} className="flex gap-2 text-sm">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                    <span className="text-[var(--muted)]">{event.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {runs.length === 0 && <p className="text-sm text-[var(--muted)]">No runs yet in this browser session.</p>}
        </div>
      </Panel>
    </div>
  );
}

function Webhooks({ ingestSampleReview, isMutating }: { ingestSampleReview: () => void; isMutating: boolean }) {
  const sample = `curl -X POST http://localhost:8000/api/webhooks/reviews/google \\
  -H "Content-Type: application/json" \\
  -d '{"customer_name":"Priya Shah","rating":1,"title":"No update on refund","body":"I returned my order last week and still have no refund update."}'`;

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
      <Panel title="Review ingestion API" description="Public endpoints for platform and webhook integration" icon={Webhook}>
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          {[
            ["POST", "/api/webhooks/reviews/{source}", "Ingests third-party review payloads"],
            ["GET", "/api/dashboard/summary", "Returns metrics, trends, audit logs"],
            ["POST", "/api/reviews/{id}/analyse", "Runs OpenAI or deterministic fallback analysis"],
            ["POST", "/api/automations/{id}/run", "Simulates an automation pipeline run"],
          ].map(([method, path, description]) => (
            <div key={path} className="min-w-0 rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] p-4">
              <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
                <span className="rounded-[4px] bg-[var(--accent)] px-2 py-1 text-xs font-bold text-white">{method}</span>
                <code className="min-w-0 break-all text-xs font-semibold text-[var(--text)]">{path}</code>
              </div>
              <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          ))}
        </div>
        <pre className="mt-5 max-w-full overflow-x-auto rounded-[6px] border border-[var(--line)] bg-[var(--surface-3)] p-4 text-xs leading-6 text-[var(--text)]">{sample}</pre>
      </Panel>
      <Panel title="Live demo action" description="Create, analyse, and route a review" icon={PlugZap}>
        <p className="text-sm leading-6 text-[var(--muted)]">
          This creates a new unhappy customer review, analyses it, stores an AI audit record, and moves it into the reviews inbox.
        </p>
        <button
          onClick={ingestSampleReview}
          disabled={isMutating}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--accent)] px-3 text-sm font-bold text-white disabled:opacity-60"
        >
          <PlugZap size={16} />
          Send sample webhook
        </button>
      </Panel>
    </div>
  );
}

function Panel({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description?: string;
  icon?: LucideIcon;
  title?: string;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_24px_70px_var(--shadow)] sm:p-5">
      {title && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>}
          </div>
          {Icon && <Icon className="shrink-0 text-[var(--accent)]" size={20} />}
        </div>
      )}
      {children}
    </section>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-11 place-items-center rounded-[16px] bg-[var(--accent)] text-white shadow-[0_18px_50px_var(--shadow)]">
        <Sparkles size={22} />
      </div>
      <div className={compact ? "hidden min-w-0 sm:block" : "min-w-0"}>
        <p className="text-base font-semibold">Peak Reviews</p>
        <p className="text-xs text-[var(--muted)]">AI Ops Console</p>
      </div>
    </div>
  );
}

function ThemeToggle({
  isDark,
  setTheme,
  theme,
}: {
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
}) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--text)]"
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      {isDark ? "Dark" : "Light"}
    </button>
  );
}

function HeroMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-[var(--line)] bg-[var(--surface-2)] p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}

function MetricCard({
  danger = false,
  icon: Icon,
  label,
  value,
}: {
  danger?: boolean;
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_50px_var(--shadow)]">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <span className="min-w-0 pr-2 text-sm font-semibold leading-5 text-[var(--muted)]">{label}</span>
        <div
          className="grid size-10 shrink-0 place-items-center rounded-[14px]"
          style={{
            background: danger ? "var(--danger-soft)" : "var(--accent-soft)",
            color: danger ? "var(--danger)" : "var(--accent)",
          }}
        >
          <Icon size={19} />
        </div>
      </div>
      <p className="text-4xl font-semibold tracking-normal">{value}</p>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return (
    <span
      className="inline-flex min-h-6 w-fit items-center self-start justify-self-start rounded-full border px-2 py-1 text-xs font-bold capitalize"
      style={badgeStyle(value)}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 self-start">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          className={index < rating ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--line)]"}
        />
      ))}
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] p-3">
      <p className="text-xs font-bold uppercase tracking-normal text-[var(--faint)]">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}
