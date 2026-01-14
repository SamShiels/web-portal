import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router-dom";
import { getDownloadUrl, getPaper, type Paper } from "../api/client";

const PaperViewer = () => {
  const auth = useAuth();
  const { paperId } = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
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
        <section className="paper-viewer">
          <p className="eyebrow">Paper viewer</p>
          <p className="subhead">Loading paper...</p>
        </section>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="page">
        <section className="paper-viewer">
          <p className="eyebrow">Paper viewer</p>
          <h1>Paper not found</h1>
          <p className="subhead">{error ?? "The paper you are looking for is unavailable."}</p>
          <Link className="paper-back" to="/">
            Back to papers
          </Link>
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

  return (
    <div className="page">
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
            <h2>Abstract</h2>
            <p>{paper.reviewText ?? "Abstract coming soon."}</p>
          </div>
          <div className="paper-viewer-card">
            <h2>Downloads</h2>
            {downloadUrl ? (
              <a className="paper-pdf" href={downloadUrl}>
                Download PDF
              </a>
            ) : (
              <p className="paper-viewer-placeholder">Download link pending.</p>
            )}
          </div>
        </div>
        <Link className="paper-back" to="/">
          Back to papers
        </Link>
      </section>
    </div>
  );
};

export default PaperViewer;
