import { useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import CommentThread, { type Comment } from "./CommentThread";
import Skeleton from "./Skeleton";
import { getDownloadUrl, listPapers, type Paper } from "../api/client";

type UiPaper = {
  id: string;
  title: string;
  authors: string;
  detailUrl: string;
  impactFactor: number | null;
};

type PapersListProps = {
  papers: UiPaper[];
  accessToken: string;
};

const PapersList = ({ papers, accessToken }: PapersListProps) => {
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(papers.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const pagedPapers = papers.slice(startIndex, startIndex + pageSize);
  const comments: Comment[] = [
    {
      id: "comment-01",
      author: "Maya P.",
      message: "Love the framing. Curious about the pilot cohort size?"
    },
    {
      id: "comment-02",
      author: "Sam R.",
      message: "The methods section is clear and crisp. Nice work."
    },
    {
      id: "comment-03",
      author: "Lena T.",
      message: "Would be great to see a quick visual summary or chart."
    }
  ];

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [clampedPage]);

  const handleDownload = async (paperId: string) => {
    setDownloadError(null);
    try {
      const response = await getDownloadUrl(paperId, accessToken);
      window.location.href = response.downloadUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed.";
      setDownloadError(message);
    }
  };

  return (
    <>
      {downloadError ? <p className="papers-status papers-error">{downloadError}</p> : null}
      <div className="papers-pagination">
        <button
          className="papers-page-button"
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={clampedPage === 1}
        >
          Previous
        </button>
        <p className="papers-page-status">
          Page {clampedPage} of {totalPages}
        </p>
        <button
          className="papers-page-button"
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={clampedPage === totalPages}
        >
          Next
        </button>
      </div>
      <div className="papers-list">
        {pagedPapers.map((paper) => {
          const isOpen = openCommentId === paper.id;

          return (
            <article key={paper.id} className="paper-card">
              <div className="paper-main">
                <Link className="paper-title" to={`/papers/${paper.id}`}>
                  {paper.title}
                </Link>
                <p className="paper-authors">{paper.authors}</p>
                <div className="paper-actions-row">
                  <button
                    className="paper-pdf paper-pdf-inline"
                    type="button"
                    onClick={() => handleDownload(paper.id)}
                  >
                    PDF
                  </button>
                  <div className="paper-actions">
                    <a className="paper-action" href="#">
                      Like
                    </a>
                    <a
                      className="paper-action"
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setOpenCommentId(isOpen ? null : paper.id);
                      }}
                    >
                      Comment
                    </a>
                    <a className="paper-action" href="#">
                      Share
                    </a>
                  </div>
                </div>

                <CommentThread
                  isOpen={isOpen}
                  comments={comments}
                  commentId={`comment-${paper.id}`}
                  onToggle={() => setOpenCommentId(isOpen ? null : paper.id)}
                />
              </div>
            </article>
          );
        })}
      </div>
    </>

  );
};

const PublishedPapers = () => {
  const auth = useAuth();
  const [papers, setPapers] = useState<UiPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const skeletonCards = Array.from({ length: 3 }, (_, index) => index);

  useEffect(() => {
    let isMounted = true;

    const fetchPapers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const accessToken = auth.user?.id_token;
        if (!accessToken) {
          throw new Error("Missing access token.");
        }

        const response = await listPapers(accessToken);
        if (isMounted) {
          const mapped = (response.papers ?? [])
            .filter((paper) => Boolean(paper.paperId))
            .sort((a, b) => {
              const dateA = new Date(a.uploadedAt ?? 0).getTime();
              const dateB = new Date(b.uploadedAt ?? 0).getTime();
              return dateB - dateA;
            })
            .map((paper: Paper) => {
              const title = paper.name ?? "Untitled paper";
              const authors = paper.authors?.join(", ") ?? "Unknown authors";
              const impactFactor =
                paper.overallRating !== undefined && paper.overallRating !== null
                  ? Math.round(paper.overallRating * 20)
                  : null;

            return {
              id: paper.paperId,
              title,
              authors,
              detailUrl: `/papers/${paper.paperId}`,
              impactFactor
            };
          });
          setPapers(mapped);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load papers.";
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPapers();

    return () => {
      isMounted = false;
    };
  }, [auth.user?.id_token]);

  return (
    <section className="papers">
      <div className="papers-header">
        <h2>Published Papers</h2>
        <p>Peer-reviewed insights and collaborative drafts from the exchange.</p>
      </div>
      {isLoading ? (
        <div className="papers-skeleton">
          <Skeleton className="skeleton-line skeleton-title" />
          {skeletonCards.map((index) => (
            <div key={index} className="paper-card">
              <div className="paper-main">
                <Skeleton className="skeleton-line skeleton-title" />
                <Skeleton className="skeleton-line skeleton-text" />
                <Skeleton className="skeleton-pill" />
              </div>
              <div className="paper-meta">
                <Skeleton className="skeleton-pill" />
                <Skeleton className="skeleton-line skeleton-text" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {error ? <p className="papers-status papers-error">{error}</p> : null}
      {!isLoading && !error && papers.length === 0 ? (
        <p className="papers-status">No papers yet.</p>
      ) : null}
      {!isLoading && !error && papers.length > 0 ? (
        <PapersList papers={papers} accessToken={auth.user?.id_token ?? ""} />
      ) : null}
    </section>
  );
};

export default PublishedPapers;
