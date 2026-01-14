import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router-dom";
import { getDownloadUrl, getPaper, type LlmMetricsResponse, type Paper } from "../api/client";
import Skeleton from "./Skeleton";

const DUMMY_LLM_METRICS: LlmMetricsResponse = {
  llm_metrics: {
    "consort_claude sonnet 4.5": {
      "1": { rating: 1, note: "Not an RCT; implementation study focus." },
      "2": { rating: 1, note: "No trial registry details provided." }
    },
    "consort_nova pro": {
      "1": { rating: 2, note: "Abstract lacks full trial identification." },
      "2": { rating: 1, note: "Protocol/SAP access not described." }
    },
    "consort_Meta Llama 4 Maverick 17B Instruct": {
      "1": { rating: 2, note: "Title does not identify randomized trial." },
      "2": { rating: 1, note: "No data sharing instructions." }
    }
  }
};

const JUDGE_AVATARS: Record<string, string> = {
  "consort_claude sonnet 4.5": "/bot1.png",
  "consort_nova pro": "/bot2.png",
  "consort_Meta Llama 4 Maverick 17B Instruct": "/bot3.png"
};

const PaperViewer = () => {
  const auth = useAuth();
  const { paperId } = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [llmSummary, setLlmSummary] = useState<LlmMetricsResponse["judge"] | null>(null);
  const [llmMetrics, setLlmMetrics] = useState<LlmMetricsResponse["llm_metrics"] | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const parseLlmMetrics = (reviewText?: Paper["reviewText"]) => {
      if (!reviewText) {
        return null;
      }

      if (typeof reviewText === "object") {
        return reviewText as LlmMetricsResponse;
      }

      try {
        return JSON.parse(reviewText) as LlmMetricsResponse;
      } catch {
        return null;
      }
    };

    const fetchPaper = async () => {
      if (!paperId) {
        setError("Missing paper ID.");
        setIsLoading(false);
        return;
      }

      try {
        const accessToken = auth.user?.id_token;
        if (!accessToken) {
          throw new Error("Missing access token.");
        }

        const [paperResponse, downloadResponse] = await Promise.all([
          getPaper(paperId, accessToken),
          getDownloadUrl(paperId, accessToken)
        ]);

        if (isMounted) {
          setPaper(paperResponse);
          setDownloadUrl(downloadResponse.downloadUrl ?? null);
        }
        const parsed = parseLlmMetrics(paperResponse.reviewText);
        if (parsed) {
          if (isMounted) {
            setLlmSummary(parsed.judge ?? null);
            setLlmMetrics(parsed.llm_metrics ?? null);
          }
        } else if (isMounted) {
          setLlmError("LLM summary not available.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load paper.";
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPaper();

    return () => {
      isMounted = false;
    };
  }, [auth.user?.id_token, paperId]);

  if (isLoading) {
    return (
      <div className="page">
        <Link className="page-back" to="/">
          ← Back
        </Link>
        <section className="paper-viewer">
          <p className="eyebrow">Paper viewer</p>
          <div className="paper-viewer-header">
            <div>
              <Skeleton className="skeleton-line skeleton-title" />
              <Skeleton className="skeleton-line skeleton-text" />
            </div>
            <div className="paper-viewer-meta">
              <Skeleton className="skeleton-pill" />
              <Skeleton className="skeleton-line skeleton-text" />
            </div>
          </div>
          <div className="paper-viewer-body">
            <div className="paper-viewer-card">
              <Skeleton className="skeleton-line skeleton-title" />
              <Skeleton className="skeleton-line skeleton-text" />
              <Skeleton className="skeleton-line skeleton-text" />
            </div>
            <div className="paper-viewer-card">
              <Skeleton className="skeleton-line skeleton-title" />
              <Skeleton className="skeleton-pill" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="page">
        <Link className="page-back" to="/">
          ← Back
        </Link>
        <section className="paper-viewer">
          <p className="eyebrow">Paper viewer</p>
          <h1>Paper not found</h1>
          <p className="subhead">{error ?? "The paper you are looking for is unavailable."}</p>
        </section>
      </div>
    );
  }

  const title = paper.name ?? "Untitled paper";
  const authors = paper.authors?.join(", ") ?? "Unknown authors";
  const dif = paper.overallRating ? Math.round(paper.overallRating * 20) : null;
  const uploadedAt = paper.uploadedAt
    ? new Date(paper.uploadedAt).toLocaleDateString()
    : "Pending";
  const metricsToRender = llmMetrics ?? DUMMY_LLM_METRICS.llm_metrics;

  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Back
      </Link>
      <section className="paper-viewer">
        <p className="eyebrow">Research dossier</p>
        <div className="paper-viewer-header">
          <div>
            <h1>{title}</h1>
            <p className="paper-viewer-authors">{authors}</p>
          </div>
          <div className="paper-viewer-meta">
            <span className="paper-viewer-dif">Debiased Impact Factor: {dif ?? "—"}</span>
            <span className="paper-viewer-date">{uploadedAt}</span>
          </div>
        </div>
        <div className="paper-viewer-body">
          <div className="paper-viewer-card">
            <h2>LLM Summary</h2>
            {llmSummary?.synthesis_summary ? (
              <div className="llm-summary">
                {llmSummary.synthesis_summary.overview ? (
                  <p>{llmSummary.synthesis_summary.overview}</p>
                ) : null}
                {llmSummary.synthesis_summary.common_themes ? (
                  <p>{llmSummary.synthesis_summary.common_themes}</p>
                ) : null}
                {llmSummary.synthesis_summary.areas_of_agreement ? (
                  <p>{llmSummary.synthesis_summary.areas_of_agreement}</p>
                ) : null}
                {llmSummary.synthesis_summary.areas_of_disagreement ? (
                  <p>{llmSummary.synthesis_summary.areas_of_disagreement}</p>
                ) : null}
                {llmSummary.synthesis_summary.feedback ? (
                  <p>{llmSummary.synthesis_summary.feedback}</p>
                ) : null}
                {llmSummary.synthesis_summary.impact ? (
                  <p className="llm-impact">
                    Impact score: {llmSummary.synthesis_summary.impact}
                  </p>
                ) : null}
              </div>
            ) : llmError ? (
              <p className="paper-viewer-placeholder">{llmError}</p>
            ) : (
              <p className="paper-viewer-placeholder">LLM summary pending.</p>
            )}
          </div>
          <div className="paper-viewer-card">
            <h2>LLM Judges</h2>
            <div className="llm-judges">
              {Object.entries(metricsToRender).map(([judgeName, opinions]) => {
                const entries = Object.entries(opinions).sort(
                  ([a], [b]) => Number(a) - Number(b)
                );
                const avatar = JUDGE_AVATARS[judgeName] ?? "/bot1.png";

                return (
                  <div key={judgeName} className="llm-judge">
                    <div className="llm-judge-header">
                      <img className="llm-judge-avatar" src={avatar} alt={`${judgeName} avatar`} />
                      <h3>{judgeName}</h3>
                    </div>
                    <ol className="llm-opinions">
                      {entries.map(([key, item]) => (
                        <li key={key} className="llm-opinion">
                          <div className="llm-opinion-header">
                            <span className="llm-opinion-score">Score {item.rating}</span>
                            <span className="llm-opinion-id">Item {key}</span>
                          </div>
                          <p>{item.note}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="paper-viewer-card">
            <h2>Downloads</h2>
            {downloadUrl ? (
              <a className="paper-pdf" href={downloadUrl}>
                PDF
              </a>
            ) : (
              <p className="paper-viewer-placeholder">Download link pending.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaperViewer;
