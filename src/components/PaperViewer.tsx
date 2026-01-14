import { useEffect, useState, useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router-dom";
import { getDownloadUrl, getPaper, type LlmMetricsResponse, type Paper } from "../api/client";
import Skeleton from "./Skeleton";

/** 
 * RULESETS Constant
 * Determines which checklist is shown based on the paper's type.
 */
const RULESETS: Record<string, Array<{ id: number; area: string; rule: string }>> = {
  arrive: [
    { id: 1, area: "Study Design & Sample Size", rule: "Provide brief details of the groups being compared (with rationale) and the experimental unit (e.g., single animal, cage)." },
    { id: 2, area: "Study Design & Sample Size", rule: "Specify the exact number of experimental units allocated and used, and explain how the sample size was decided (e.g., a priori calculation)." },
    { id: 3, area: "Rigour & Validity", rule: "Describe criteria for including/excluding animals or data (specifying if established a priori), report any exclusions with reasons, and state the exact n for each analysis." },
    { id: 4, area: "Rigour & Validity", rule: "State if randomisation was used, the method of sequence generation, and strategies to minimize confounders (e.g., location, order)." },
    { id: 5, area: "Rigour & Validity", rule: "Describe who was blinded to group allocation during allocation, conduct, outcome assessment, and data analysis." },
    { id: 6, area: "Experimental Details", rule: "Provide species-appropriate details (strain, sex, age/developmental stage, weight) and provenance/health/genotype information." },
    { id: 7, area: "Experimental Details", rule: "Describe procedures in enough detail to allow replication, including what, how, when, where, and why for each group." },
    { id: 8, area: "Analysis & Results", rule: "Clearly define all outcomes and specify the primary outcome used for sample size calculation." },
    { id: 9, area: "Analysis & Results", rule: "Detail the statistical methods and software used, including how assumptions were assessed." },
    { id: 10, area: "Analysis & Results", rule: "Report summary statistics with variability (e.g., mean/SD) and effect sizes with confidence intervals for each experiment." }
  ],
  consort: [
    { id: 1, area: "Title, Abstract, & Open Science", rule: "Identify as a randomised trial and provide a structured summary of design, methods, results, and conclusions." },
    { id: 2, area: "Title, Abstract, & Open Science", rule: "Provide trial registry details, access to the protocol/SAP, and instructions for accessing de-identified participant data and code." },
    { id: 3, area: "Title, Abstract, & Open Science", rule: "Disclose all funding sources, funder roles, and author conflicts of interest." },
    { id: 4, area: "Introduction", rule: "Explain the scientific background and rationale." },
    { id: 5, area: "Introduction", rule: "State specific objectives related to both benefits and harms." },
    { id: 6, area: "Methods", rule: "Provide details of patient or public involvement in the trial." },
    { id: 7, area: "Methods", rule: "Describe design type (e.g., parallel, crossover), allocation ratio, any protocol changes, and trial settings/locations." },
    { id: 8, area: "Methods", rule: "State eligibility criteria for participants/sites and provide intervention/comparator details sufficient for replication." },
    { id: 9, area: "Methods", rule: "Define pre-specified primary/secondary outcomes (metric, aggregation, time point) and how harms were defined/assessed." },
    { id: 10, area: "Methods", rule: "Explain sample size determination and any interim analysis or stopping rules." },
    { id: 11, area: "Methods", rule: "Describe the sequence generation, the allocation concealment mechanism, and the implementation process." },
    { id: 12, area: "Methods", rule: "State who was blinded and describe how it was achieved and maintained." },
    { id: 13, area: "Methods", rule: "Describe methods for primary/secondary outcomes, the analysis population definition, handling of missing data, and additional analyses." },
    { id: 14, area: "Results", rule: "Report numbers assigned, receiving treatment, and analysed via flow diagram, including losses and exclusions." },
    { id: 15, area: "Results", rule: "State recruitment dates, reasons for trial ending, treatment fidelity/adherence, and concomitant care." },
    { id: 16, area: "Results", rule: "Provide a table of baseline demographic and clinical characteristics." },
    { id: 17, area: "Results", rule: "Report numbers included in each analysis, estimated effect sizes with precision (e.g., 95% CI), all harms, and ancillary analyses." },
    { id: 18, area: "Discussion", rule: "Provide an interpretation consistent with results, balancing benefits and harms." },
    { id: 19, area: "Discussion", rule: "Discuss sources of potential bias, imprecision, and generalisability." }
  ],
  strobe: [
    { id: 1, area: "Title, Abstract, & Introduction", rule: "Indicate study design and provide an informative summary of what was done and found." },
    { id: 2, area: "Title, Abstract, & Introduction", rule: "Explain the scientific rationale for the investigation." },
    { id: 3, area: "Title, Abstract, & Introduction", rule: "State specific objectives and any prespecified hypotheses." },
    { id: 4, area: "Methods", rule: "Present key elements of the study design early." },
    { id: 5, area: "Methods", rule: "Describe locations, relevant dates, recruitment periods, and follow-up." },
    { id: 6, area: "Methods", rule: "State eligibility criteria and selection methods." },
    { id: 7, area: "Methods", rule: "Describe follow-up methods (cohort studies)." },
    { id: 8, area: "Methods", rule: "Describe case/control selection and rationale (case-control studies)." },
    { id: 9, area: "Methods", rule: "Give matching criteria and numbers (matched studies)." },
    { id: 10, area: "Methods", rule: "Define all outcomes, exposures, predictors, confounders, and modifiers." },
    { id: 11, area: "Methods", rule: "Give sources and measurement methods for each variable." },
    { id: 12, area: "Methods", rule: "Describe efforts to address potential sources of bias." },
    { id: 13, area: "Methods", rule: "Explain how the study size was arrived at." },
    { id: 14, area: "Methods", rule: "Explain how quantitative variables were handled or grouped in analyses." },
    { id: 15, area: "Methods", rule: "Describe methods used for confounding, subgroups, and interactions." },
    { id: 16, area: "Methods", rule: "Explain how missing data and loss to follow-up were addressed." },
    { id: 17, area: "Methods", rule: "Describe any sensitivity analyses." },
    { id: 18, area: "Results", rule: "Report numbers at each stage (eligible, included, etc.) and reasons for non-participation." },
    { id: 19, area: "Results", rule: "Give participant characteristics and missing data per variable." },
    { id: 20, area: "Results", rule: "Report outcome events or summary measures over time." },
    { id: 21, area: "Results", rule: "Give unadjusted and confounder-adjusted estimates with precision (e.g., 95% CI)." },
    { id: 22, area: "Results", rule: "Report category boundaries for continuous variables." },
    { id: 23, area: "Results", rule: "Report subgroup, interaction, or sensitivity analyses." },
    { id: 24, area: "Discussion & Other", rule: "Summarize findings relative to objectives." },
    { id: 25, area: "Discussion & Other", rule: "Discuss bias (direction and magnitude) and imprecision." },
    { id: 26, area: "Discussion & Other", rule: "Provide a cautious overall interpretation of results." },
    { id: 27, area: "Discussion & Other", rule: "Discuss external validity." },
    { id: 28, area: "Discussion & Other", rule: "State the source of funding and the role of funders." }
  ]
};

const JUDGE_AVATARS = ["/bot1.png", "/bot2.png", "/bot3.png"];

const PaperViewer = () => {
  const auth = useAuth();
  const { paperId } = useParams();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [llmSummary, setLlmSummary] = useState<LlmMetricsResponse["judge"] | null>(null);
  const [llmMetrics, setLlmMetrics] = useState<LlmMetricsResponse["llm_metrics"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const typeKey = paper?.paperType?.toLowerCase() || "";
    const rules = RULESETS[typeKey] || [];
    
    return rules.reduce<Record<string, typeof rules>>((acc, rule) => {
      if (!acc[rule.area]) acc[rule.area] = [];
      acc[rule.area].push(rule);
      return acc;
    }, {});
  }, [paper?.paperType]);

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
            <span className="paper-viewer-dif">
              Impact Factor: {paper.overallRating ? Math.round(paper.overallRating * 20) : "—"}
            </span>
            <span className="paper-viewer-date">
              {paper.uploadedAt ? new Date(paper.uploadedAt).toLocaleDateString() : "Date Pending"}
            </span>
          </div>
        </header>

        <div className="paper-viewer-body">
          {/* 1. Synthesis Summary Section */}
          <div className="paper-viewer-card">
            <h2>Synthesis Summary</h2>
            {llmSummary?.synthesis_summary ? (
              <div className="llm-summary">
                <p>{llmSummary.synthesis_summary.overview}</p>
                {llmSummary.synthesis_summary.feedback && (
                  <p><strong>Feedback:</strong> {llmSummary.synthesis_summary.feedback}</p>
                )}
                <p className="llm-impact">
                  Consensus Impact Score: {llmSummary.synthesis_summary.impact}/10
                </p>
              </div>
            ) : (
              <p className="paper-viewer-placeholder">Analysis results are being processed...</p>
            )}
          </div>

          {/* 2. Detailed Guidelines Matrix */}
          <div className="paper-viewer-card">
            <h2>Compliance Checklist</h2>
            <div className="llm-areas">
              {Object.keys(groupedRules).length === 0 ? (
                <p className="paper-viewer-placeholder">No rulesets found for type: {paper.paperType}</p>
              ) : (
                Object.entries(groupedRules).map(([area, rules]) => (
                  <div key={area} className="llm-area">
                    <h3>{area}</h3>
                    <ol className="llm-area-rules">
                      {rules.map((rule) => (
                        <li key={rule.id} className="llm-area-rule">
                          <p className="llm-opinion-rule">{rule.rule}</p>

                          {/* Each judge's opinion for THIS rule */}
                          <div className="llm-judge-opinions">
                            {llmMetrics && Object.entries(llmMetrics).map(([judgeName, opinions], idx) => {
                              const opinion = opinions[String(rule.id)];
                              // Clean up name for display: "arrive_claude" -> "Claude"
                              const displayName = judgeName.split(/_| /).filter(s => s !== 'arrive' && s !== 'consort' && s !== 'strobe')[0] || judgeName;

                              return (
                                <div key={judgeName} className="llm-judge-opinion">
                                  <div className="llm-judge-header">
                                    <img 
                                      className="llm-judge-avatar" 
                                      src={JUDGE_AVATARS[idx % JUDGE_AVATARS.length]} 
                                      alt="bot" 
                                    />
                                    <div className="llm-judge-meta">
                                      <p className="llm-judge-name">{displayName}</p>
                                      <span className="llm-opinion-score">
                                        Rating: {opinion?.rating ?? "—"}
                                      </span>
                                    </div>
                                  </div>
                                  <p>{opinion?.note ?? "No specific note provided for this item."}</p>
                                </div>
                              );
                            })}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Downloads Section */}
          <div className="paper-viewer-card">
            <h2>Resources</h2>
            {downloadUrl ? (
              <a className="paper-pdf" href={downloadUrl} target="_blank" rel="noreferrer">
                Download Original PDF
              </a>
            ) : (
              <p className="paper-viewer-placeholder">PDF source unavailable.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaperViewer;