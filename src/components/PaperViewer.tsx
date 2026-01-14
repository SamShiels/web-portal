import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router-dom";
import {
  getDownloadUrl,
  getPaper,
  type LlmMetricsResponse,
  type Paper
} from "../api/client";
import ReviewerChat, { type ChatThreadMessage } from "./ReviewerChat";
import Skeleton from "./Skeleton";

/** 
 * RULESETS Constant
 * Determines which checklist is shown based on the paper's type.
 */
const RULESETS: Record<string, Array<{ id: number; area: string; rule: string }>> = {
  arrive: [
    { id: 1, area: "Study Design & Sample Size", rule: "🐾 Provide brief details of the groups being compared (with rationale) and the experimental unit (e.g., single animal, cage)." },
    { id: 2, area: "Study Design & Sample Size", rule: "🔢 Specify the exact number of experimental units allocated and used, and explain how the sample size was decided (e.g., a priori calculation)." },
    { id: 3, area: "Rigour & Validity", rule: "✂️ Describe criteria for including/excluding animals or data (specifying if established a priori), report any exclusions with reasons, and state the exact n for each analysis." },
    { id: 4, area: "Rigour & Validity", rule: "🎲 State if randomisation was used, the method of sequence generation, and strategies to minimize confounders (e.g., location, order)." },
    { id: 5, area: "Rigour & Validity", rule: "🙈 Describe who was blinded to group allocation during allocation, conduct, outcome assessment, and data analysis." },
    { id: 6, area: "Experimental Details", rule: "🧬 Provide species-appropriate details (strain, sex, age/developmental stage, weight) and provenance/health/genotype information." },
    { id: 7, area: "Experimental Details", rule: "📋 Describe procedures in enough detail to allow replication, including what, how, when, where, and why for each group." },
    { id: 8, area: "Analysis & Results", rule: "🎯 Clearly define all outcomes and specify the primary outcome used for sample size calculation." },
    { id: 9, area: "Analysis & Results", rule: "💻 Detail the statistical methods and software used, including how assumptions were assessed." },
    { id: 10, area: "Analysis & Results", rule: "📊 Report summary statistics with variability (e.g., mean/SD) and effect sizes with confidence intervals for each experiment." }
  ],
  consort: [
    { id: 1, area: "Title, Abstract, & Open Science", rule: "📝 Identify as a randomised trial and provide a structured summary of design, methods, results, and conclusions." },
    { id: 2, area: "Title, Abstract, & Open Science", rule: "🌐 Provide trial registry details, access to the protocol/SAP, and instructions for accessing de-identified participant data and code." },
    { id: 3, area: "Title, Abstract, & Open Science", rule: "💰 Disclose all funding sources, funder roles, and author conflicts of interest." },
    { id: 4, area: "Introduction", rule: "📖 Explain the scientific background and rationale." },
    { id: 5, area: "Introduction", rule: "⚖️ State specific objectives related to both benefits and harms." },
    { id: 6, area: "Methods", rule: "👥 Provide details of patient or public involvement in the trial." },
    { id: 7, area: "Methods", rule: "📐 Describe design type (e.g., parallel, crossover), allocation ratio, any protocol changes, and trial settings/locations." },
    { id: 8, area: "Methods", rule: "🧪 State eligibility criteria for participants/sites and provide intervention/comparator details sufficient for replication." },
    { id: 9, area: "Methods", rule: "⚠️ Define pre-specified primary/secondary outcomes (metric, aggregation, time point) and how harms were defined/assessed." },
    { id: 10, area: "Methods", rule: "🧮 Explain sample size determination and any interim analysis or stopping rules." },
    { id: 11, area: "Methods", rule: "🔐 Explain the sequence generation, the allocation concealment mechanism, and the implementation process." },
    { id: 12, area: "Methods", rule: "🕶️ State who was blinded and describe how it was achieved and maintained." },
    { id: 13, area: "Methods", rule: "🧹 Describe methods for primary/secondary outcomes, the analysis population definition, handling of missing data, and additional analyses." },
    { id: 14, area: "Results", rule: "📉 Report numbers assigned, receiving treatment, and analysed via flow diagram, including losses and exclusions." },
    { id: 15, area: "Results", rule: "📅 State recruitment dates, reasons for trial ending, treatment fidelity/adherence, and concomitant care." },
    { id: 16, area: "Results", rule: "📋 Provide a table of baseline demographic and clinical characteristics." },
    { id: 17, area: "Results", rule: "📏 Report numbers included in each analysis, estimated effect sizes with precision (e.g., 95% CI), all harms, and ancillary analyses." },
    { id: 18, area: "Discussion", rule: "🧐 Provide an interpretation consistent with results, balancing benefits and harms." },
    { id: 19, area: "Discussion", rule: "🔍 Discuss sources of potential bias, imprecision, and generalisability." }
  ],
  strobe: [
    { id: 1, area: "Title, Abstract, & Introduction", rule: "📜 Indicate study design and provide an informative summary of what was done and found." },
    { id: 2, area: "Title, Abstract, & Introduction", rule: "💡 Explain the scientific rationale for the investigation." },
    { id: 3, area: "Title, Abstract, & Introduction", rule: "🎯 State specific objectives and any prespecified hypotheses." },
    { id: 4, area: "Methods", rule: "🏗️ Present key elements of the study design early." },
    { id: 5, area: "Methods", rule: "📍 Describe locations, relevant dates, recruitment periods, and follow-up." },
    { id: 6, area: "Methods", rule: "🏁 State eligibility criteria and selection methods." },
    { id: 7, area: "Methods", rule: "👣 Describe follow-up methods (cohort studies)." },
    { id: 8, area: "Methods", rule: "👥 Describe case/control selection and rationale (case-control studies)." },
    { id: 9, area: "Methods", rule: "👯 Give matching criteria and numbers (matched studies)." },
    { id: 10, area: "Methods", rule: "🔢 Define all outcomes, exposures, predictors, confounders, and modifiers." },
    { id: 11, area: "Methods", rule: "📏 Give sources and measurement methods for each variable." },
    { id: 12, area: "Methods", rule: "🛡️ Describe efforts to address potential sources of bias." },
    { id: 13, area: "Methods", rule: "🧮 Explain how the study size was arrived at." },
    { id: 14, area: "Methods", rule: "📊 Explain how quantitative variables were handled or grouped in analyses." },
    { id: 15, area: "Methods", rule: "🧩 Describe methods used for confounding, subgroups, and interactions." },
    { id: 16, area: "Methods", rule: "🕳️ Explain how missing data and loss to follow-up were addressed." },
    { id: 17, area: "Methods", rule: "🧪 Describe any sensitivity analyses." },
    { id: 18, area: "Results", rule: "📉 Report numbers at each stage (eligible, included, etc.) and reasons for non-participation." },
    { id: 19, area: "Results", rule: "👤 Give participant characteristics and missing data per variable." },
    { id: 20, area: "Results", rule: "⏳ Report outcome events or summary measures over time." },
    { id: 21, area: "Results", rule: "📈 Give unadjusted and confounder-adjusted estimates with precision (e.g., 95% CI)." },
    { id: 22, area: "Results", rule: "✂️ Report category boundaries for continuous variables." },
    { id: 23, area: "Results", rule: "🔍 Report subgroup, interaction, or sensitivity analyses." },
    { id: 24, area: "Discussion & Other", rule: "📋 Summarize findings relative to objectives." },
    { id: 25, area: "Discussion & Other", rule: "⚠️ Discuss bias (direction and magnitude) and imprecision." },
    { id: 26, area: "Discussion & Other", rule: "🧐 Provide a cautious overall interpretation of results." },
    { id: 27, area: "Discussion & Other", rule: "🌍 Discuss external validity." },
    { id: 28, area: "Discussion & Other", rule: "💸 State the source of funding and the role of funders." }
  ]
};

const JUDGE_AVATARS = ["/bot1.png", "/bot2.png", "/bot3.png"];
const JUDGE_LABELS = ["Chirpy bot", "Brainy Brian", "Chatty Mcchatface"];
const PaperViewer = () => {
  const auth = useAuth();
  const { paperId } = useParams();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [llmSummary, setLlmSummary] = useState<LlmMetricsResponse["judge"] | null>(null);
  const [llmMetrics, setLlmMetrics] = useState<LlmMetricsResponse["llm_metrics"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatThreadMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const rulesForPaper = useMemo(() => {
    const typeKey = paper?.paperType?.toLowerCase() || "";
    return RULESETS[typeKey] || [];
  }, [paper?.paperType]);
  const ruleAreaLookup = useMemo(
    () =>
      rulesForPaper.reduce<Record<string, string>>((acc, rule) => {
        acc[String(rule.id)] = rule.area;
        return acc;
      }, {}),
    [rulesForPaper]
  );

  const toggleRule = (ruleId: number) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPaper = async () => {
      if (!paperId) {
        setError("Missing paper ID.");
        setIsLoading(false);
        return;
      }

      try {
        const accessToken = auth.user?.id_token;
        if (!accessToken) throw new Error("Missing access token.");

        const [paperRes, downloadRes] = await Promise.all([
          getPaper(paperId, accessToken),
          getDownloadUrl(paperId, accessToken)
        ]);

        if (!isMounted) return;

        setPaper(paperRes);
        setDownloadUrl(downloadRes.downloadUrl ?? null);

        // Parse reviewText which is a stringified JSON object in your database
        if (paperRes.reviewText) {
          try {
            const parsed = typeof paperRes.reviewText === 'string' 
              ? JSON.parse(paperRes.reviewText) 
              : paperRes.reviewText;
            
            setLlmSummary(parsed.judge ?? null);
            setLlmMetrics(parsed.llm_metrics ?? null);
          } catch (e) {
            console.error("Error parsing LLM metrics:", e);
          }
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Load failed");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPaper();
    return () => { isMounted = false; };
  }, [auth.user?.id_token, paperId]);

  // Grouping logic for the Ruleset
  const groupedRules = useMemo(() => {
    return rulesForPaper.reduce<Record<string, typeof rulesForPaper>>((acc, rule) => {
      if (!acc[rule.area]) acc[rule.area] = [];
      acc[rule.area].push(rule);
      return acc;
    }, {});
  }, [rulesForPaper]);

  const categoryAverages = useMemo(() => {
    if (!llmMetrics || rulesForPaper.length === 0) return [];

    const bucket: Record<string, number[]> = {};

    Object.values(llmMetrics).forEach((group) => {
      Object.entries(group).forEach(([ruleId, metric]) => {
        const area = ruleAreaLookup[ruleId];
        if (!area || typeof metric?.rating !== "number") return;
        if (!bucket[area]) bucket[area] = [];
        bucket[area].push(metric.rating);
      });
    });

    return Object.entries(bucket).map(([area, ratings]) => ({
      area,
      average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    }));
  }, [llmMetrics, ruleAreaLookup, rulesForPaper]);

  const sortedCategoryAverages = useMemo(
    () => [...categoryAverages].sort((a, b) => b.average - a.average),
    [categoryAverages]
  );

  const judgeAverages = useMemo(() => {
    if (!llmMetrics) return [];

    return Object.entries(llmMetrics).map(([judgeKey, opinions], idx) => {
      const ratings = Object.values(opinions)
        .map((item) => item?.rating)
        .filter((rating): rating is number => typeof rating === "number");

      const average =
        ratings.length === 0
          ? null
          : Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10;

      return {
        judgeKey,
        average,
        label: JUDGE_LABELS[idx] ?? `Judge ${idx + 1}`,
        avatar: JUDGE_AVATARS[idx % JUDGE_AVATARS.length]
      };
    });
  }, [llmMetrics]);

  const overallCategoryAverage = useMemo(() => {
    if (categoryAverages.length === 0) return null;
    const total = categoryAverages.reduce((sum, { average }) => sum + average, 0);
    return Math.round((total / categoryAverages.length) * 10) / 10;
  }, [categoryAverages]);

  const impactScoreOutOfFive = useMemo(() => {
    const rawImpact = llmSummary?.synthesis_summary?.impact;
    if (rawImpact === undefined || rawImpact === null) return null;

    const numericImpact =
      typeof rawImpact === "string" ? parseFloat(rawImpact) : Number(rawImpact);

    if (Number.isNaN(numericImpact)) return null;

    const normalized = numericImpact > 5 ? numericImpact / 2 : numericImpact;
    return Math.round(normalized * 10) / 10;
  }, [llmSummary?.synthesis_summary?.impact]);

  const pulseMetrics = useMemo(() => {
    const categoryValues = categoryAverages.map((item) => item.average);
    const judgeValues = judgeAverages
      .map((item) => item.average)
      .filter((value): value is number => value !== null);

    const mean =
      categoryValues.length > 0
        ? categoryValues.reduce((sum, value) => sum + value, 0) / categoryValues.length
        : null;

    const variance =
      mean !== null && categoryValues.length > 1
        ? categoryValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
          (categoryValues.length - 1)
        : null;

    const cohesion =
      variance !== null
        ? Math.round(Math.max(0, Math.min(1, 1 - Math.sqrt(variance) / 5)) * 100)
        : null;

    const spread =
      categoryValues.length > 0
        ? Math.round(
            Math.max(
              0,
              Math.min(1, (Math.max(...categoryValues) - Math.min(...categoryValues)) / 5)
            ) * 100
          )
        : null;

    const judgeMean =
      judgeValues.length > 0
        ? judgeValues.reduce((sum, value) => sum + value, 0) / judgeValues.length
        : null;

    const judgeStd =
      judgeMean !== null && judgeValues.length > 1
        ? Math.sqrt(
            judgeValues.reduce((sum, value) => sum + Math.pow(value - judgeMean, 2), 0) /
              judgeValues.length
          )
        : null;

    const judgeSync =
      judgeStd !== null
        ? Math.round(Math.max(0, Math.min(1, 1 - judgeStd / 3)) * 100)
        : null;

    const signal =
      overallCategoryAverage !== null
        ? Math.round(Math.max(0, Math.min(1, overallCategoryAverage / 5)) * 100)
        : null;

    return [
      { label: "Cohesion", value: cohesion, caption: "How tightly categories agree" },
      { label: "Spread", value: spread, caption: "Top vs bottom distance" },
      { label: "Judge sync", value: judgeSync, caption: "Panel alignment pulse" },
      { label: "Signal", value: signal, caption: "Overall lift vs ceiling" }
    ];
  }, [categoryAverages, judgeAverages, overallCategoryAverage]);

  if (isLoading) {
    return (
      <div className="page">
        <div className="paper-viewer">
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-line" />
          <div className="paper-viewer-body">
            <Skeleton className="skeleton-pill" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="page">
        <Link className="page-back" to="/">← Back</Link>
        <section className="paper-viewer">
          <h1>Paper not found</h1>
          <p className="subhead">{error ?? "Unable to retrieve this dossier."}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <Link className="page-back" to="/">← Back to dashboard</Link>
      
      <section className="paper-viewer">
        <p className="eyebrow">Research dossier</p>
        
        <header className="paper-viewer-header">
          <div>
            <h1>{paper.name || "Untitled Research"}</h1>
            <p className="paper-viewer-authors">{paper.authors?.join(", ") || "Anonymous"}</p>
          </div>
          <div className="paper-viewer-meta">
            <span className="paper-viewer-date">
              {paper.uploadedAt ? new Date(paper.uploadedAt).toLocaleDateString() : "Date Pending"}
            </span>
          </div>
        </header>

        <div className="paper-viewer-actions">
          {downloadUrl ? (
            <a className="paper-pdf paper-pdf-inline" href={downloadUrl} target="_blank" rel="noreferrer">
              PDF
            </a>
          ) : (
            <p className="paper-viewer-placeholder">PDF source unavailable.</p>
          )}
        </div>

        <div className="paper-rating-hero">
          <div className="paper-rating-main">
            <p className="eyebrow">Ratings pulse</p>
            <h2 className="paper-rating-value">
              {overallCategoryAverage !== null ? `${overallCategoryAverage.toFixed(1)} / 5` : "Awaiting ratings"}
            </h2>
            <p className="paper-rating-meta">
              {categoryAverages.length > 0
                ? `Averaged across ${categoryAverages.length} categories`
                : "Ratings will appear here once the judges weigh in."}
            </p>
          </div>
          <div className="paper-rating-pills">
            {sortedCategoryAverages.length === 0 ? (
              <div className="paper-rating-pill paper-rating-pill-empty">
                <span className="rating-pill-label">No category scores yet</span>
              </div>
            ) : (
              sortedCategoryAverages.map(({ area, average }) => (
                <div key={area} className="paper-rating-pill">
                  <span className="rating-pill-score">{average.toFixed(1)}</span>
                  <span className="rating-pill-label">{area}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Downloads Section */}
        <div className="paper-viewer-card metrics-card">
          <div className="metrics-header">
            <div>
              <p className="eyebrow">Visual pulse</p>
              <h2>Judge Metrics</h2>
            </div>
            {overallCategoryAverage !== null ? (
              <div className="metrics-donut">
                <div
                  className="metrics-donut-ring"
                  aria-hidden
                  style={{
                    background: `conic-gradient(var(--accent) ${(overallCategoryAverage / 5) * 360}deg, rgba(47, 43, 37, 0.08) 0)`
                  }}
                />
                <div className="metrics-donut-center">
                  <span>{overallCategoryAverage.toFixed(1)}</span>
                  <small>/5 avg</small>
                </div>
              </div>
            ) : null}
          </div>

          {categoryAverages.length === 0 ? (
            <p className="paper-viewer-placeholder">Graphs will appear once ratings arrive.</p>
          ) : (
            <div className="metrics-grid">
                <div className="metric-block metric-pulse">
                  <div className="metric-block-header">
                    <h3>Signal lab</h3>
                    <span className="metric-note">Micro-metrics in motion</span>
                  </div>
                  <div className="metric-pulse-grid">
                    {pulseMetrics.map((metric) => (
                      <div key={metric.label} className="metric-pulse-card">
                        <div
                          className="pulse-orb"
                          style={
                            {
                              ["--pulse-fill" as string]: `${metric.value ?? 0}%`
                            } as CSSProperties
                          }
                          aria-hidden
                        >
                          <span>{metric.value !== null ? `${metric.value}%` : "—"}</span>
                        </div>
                        <div className="pulse-meta">
                          <p className="pulse-label">{metric.label}</p>
                          <p className="pulse-caption">{metric.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="metric-block">
                  <div className="metric-block-header">
                    <h3>Category highs</h3>
                    <span className="metric-note">Scaled to 5</span>
                  </div>
                  <div className="metrics-bars">
                    {sortedCategoryAverages.slice(0, 6).map(({ area, average }) => (
                      <div key={area} className="metrics-bar-row">
                        <div className="metrics-bar-meta">
                          <span className="metrics-bar-label">{area}</span>
                          <span className="metrics-bar-value">{average.toFixed(1)} / 5</span>
                        </div>
                        <div className="metrics-bar-rail" aria-hidden>
                          <div
                            className="metrics-bar-fill"
                            style={{ width: `${Math.min(average / 5, 1) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              <div className="metric-block">
                <div className="metric-block-header">
                  <h3>Judge alignment</h3>
                  <span className="metric-note">Average per judge</span>
                </div>
                <div className="metrics-judge-list">
                  {judgeAverages.map((judge, idx) => (
                    <div key={judge.judgeKey ?? idx} className="metrics-judge-row">
                      <div className="metrics-judge-meta">
                        <img
                          className="metrics-judge-avatar"
                          src={judge.avatar}
                          alt={`${judge.label} avatar`}
                        />
                        <div>
                          <p className="metrics-judge-name">{judge.label}</p>
                          <p className="metrics-judge-score">
                            {judge.average !== null ? `${judge.average.toFixed(1)} / 5` : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="metrics-judge-bar" aria-hidden>
                        <div
                          className="metrics-judge-bar-fill"
                          style={{ width: `${Math.min((judge.average ?? 0) / 5, 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {judgeAverages.length === 0 ? (
                    <p className="paper-viewer-placeholder">Awaiting judge-level scores.</p>
                  ) : null}
                </div>
              </div>

              <div className="metric-block metric-spark">
                <div className="metric-block-header">
                  <h3>Category curve</h3>
                  <span className="metric-note">Shape of ratings</span>
                </div>
                <svg viewBox="0 0 200 80" role="img" aria-label="Category rating sparkline">
                  <defs>
                    <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {sortedCategoryAverages.length > 0 ? (
                    <>
                      <path
                        d={(() => {
                          const values = sortedCategoryAverages.map((item) => item.average);
                          const max = Math.max(...values, 5);
                          const min = 0;
                          const step = values.length > 1 ? 200 / (values.length - 1) : 200;

                          return values
                            .map((value, index) => {
                              const x = step * index;
                              const y = 70 - ((value - min) / (max - min || 1)) * 60;
                              return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                            })
                            .join(" ");
                        })()}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d={(() => {
                          const values = sortedCategoryAverages.map((item) => item.average);
                          const max = Math.max(...values, 5);
                          const min = 0;
                          const step = values.length > 1 ? 200 / (values.length - 1) : 200;

                          const points = values
                            .map((value, index) => {
                              const x = step * index;
                              const y = 70 - ((value - min) / (max - min || 1)) * 60;
                              return `${x},${y}`;
                            })
                            .join(" ");

                          return `M 0 80 L ${points} L 200 80 Z`;
                        })()}
                        fill="url(#sparklineGradient)"
                        stroke="none"
                      />
                    </>
                  ) : null}
                </svg>
                <div className="metric-spark-legend">
                  <span>Peak: {sortedCategoryAverages[0]?.average.toFixed(1) ?? "—"}</span>
                  <span>
                    Median:{" "}
                    {sortedCategoryAverages.length > 0
                      ? sortedCategoryAverages[Math.floor(sortedCategoryAverages.length / 2)]?.average.toFixed(1)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="paper-viewer-body">
          {/* 1. Synthesis Summary Section */}
          <div className="paper-viewer-card synthesis-card">
            <h2>Synthesis Summary</h2>
            {llmSummary?.synthesis_summary ? (
              <div className="llm-summary">
                {llmSummary.synthesis_summary.overview && (
                  <p>{llmSummary.synthesis_summary.overview}</p>
                )}
                {llmSummary.synthesis_summary.feedback && (
                  <p><strong>Feedback:</strong> {llmSummary.synthesis_summary.feedback}</p>
                )}
                {llmSummary.synthesis_summary.areas_of_agreement && (
                  <div className="impact-item">
                    <p className="impact-label">Areas of agreement</p>
                    <p className="impact-copy">{llmSummary.synthesis_summary.areas_of_agreement}</p>
                  </div>
                )}
                {llmSummary.synthesis_summary.areas_of_disagreement && (
                  <div className="impact-item">
                    <p className="impact-label">Areas of disagreement</p>
                    <p className="impact-copy">{llmSummary.synthesis_summary.areas_of_disagreement}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="paper-viewer-placeholder">Analysis results are being processed...</p>
            )}
          </div>

          {/* 2. Impact Components */}
          <div className="paper-viewer-card impact-card">
            <div className="impact-card-header">
              <h2>Impact Breakdown</h2>
              {impactScoreOutOfFive !== null ? (
                <span className="impact-score-badge">{impactScoreOutOfFive.toFixed(1)} / 5</span>
              ) : null}
            </div>
            {llmSummary?.synthesis_summary ? (
              <div className="impact-grid">
                {llmSummary.synthesis_summary.impact_rating_explanation && (
                  <div className="impact-item">
                    <p className="impact-label">Impact rationale</p>
                    <p className="impact-copy">{llmSummary.synthesis_summary.impact_rating_explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="paper-viewer-placeholder">Impact components will appear once processed...</p>
            )}
          </div>

          {/* 4. Downloads Section */}
          <div className="paper-viewer-card compliance-card">
            <h2>Compliance Checklist</h2>
            {!paper?.reviewText ? (
              <p className="paper-viewer-placeholder">Compliance checklist will appear once processed...</p>
            ) : (
              <div className="llm-areas">
                {Object.keys(groupedRules).length === 0 ? (
                  <p className="paper-viewer-placeholder">No rulesets found for type: {paper.paperType}</p>
                ) : (
                  Object.entries(groupedRules).map(([area, rules]) => (
                    <div key={area} className="llm-area">
                      <h3>{area}</h3>
                      <ol className="llm-area-rules">
                        {rules.map((rule) => {
                          const isOpen = expandedRules.has(rule.id);

                          return (
                            <li key={rule.id} className="llm-area-rule">
                              <button
                                type="button"
                                className="llm-rule-toggle"
                                onClick={() => toggleRule(rule.id)}
                                aria-expanded={isOpen}
                              >
                                <span className="llm-rule-title">
                                  {rule.rule}
                                </span>
                                <span className="llm-rule-chevron">{isOpen ? "−" : "+"}</span>
                              </button>

                              {isOpen ? (
                                <div className="llm-judge-opinions">
                                  {llmMetrics &&
                                    Object.entries(llmMetrics).map(([, opinions], idx) => {
                                      const opinion = opinions[String(rule.id)];
                                      const label = JUDGE_LABELS[idx] ?? `Judge ${idx + 1}`;
                                      const avatar = JUDGE_AVATARS[idx % JUDGE_AVATARS.length];

                                      return (
                                        <div key={label} className="llm-judge-opinion">
                                          <div className="llm-judge-header">
                                            <img
                                              className="llm-judge-avatar"
                                              src={avatar}
                                              alt={`${label} avatar`}
                                            />
                                            <div className="llm-judge-meta">
                                              <p className="llm-judge-name">{label}</p>
                                              <span className="llm-opinion-score">
                                                Rating: {opinion?.rating ?? "—"}
                                              </span>
                                            </div>
                                          </div>
                                          <p>
                                            {opinion?.note ??
                                              "No specific note provided for this item."}
                                          </p>
                                        </div>
                                      );
                                    })}
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <ReviewerChat
            messages={chatMessages}
            setMessages={setChatMessages}
            input={chatInput}
            setInput={setChatInput}
            error={chatError}
            setError={setChatError}
            isChatting={isChatting}
            setIsChatting={setIsChatting}
            accessToken={auth.user?.id_token}
            reviewText={paper.reviewText}
          />
        </div>
      </section>
    </div>
  );
};

export default PaperViewer;
