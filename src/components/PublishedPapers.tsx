import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CommentThread, { type Comment } from "./CommentThread";
import { PAPERS, type Paper } from "../data/papers";

type PapersListProps = {
  papers: Paper[];
};

const PapersList = ({ papers }: PapersListProps) => {
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
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

  return (
    <>
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
                <a className="paper-pdf" href={paper.pdfUrl} download>
                  PDF
                </a>

                <CommentThread
                  isOpen={isOpen}
                  comments={comments}
                  commentId={`comment-${paper.id}`}
                  onToggle={() => setOpenCommentId(isOpen ? null : paper.id)}
                />
              </div>
              <div className="paper-meta">
                <a className="paper-dif" href={paper.pdfUrl} target="_blank" rel="noreferrer">
                  DIF: {paper.dif}
                </a>
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
            </article>
          );
        })}
      </div>
    </>

  );
};

const PublishedPapers = () => {
  return (
    <section className="papers">
      <div className="papers-header">
        <h2>Published Papers</h2>
        <p>Peer-reviewed insights and collaborative drafts from the exchange.</p>
      </div>
      <PapersList papers={PAPERS} />
    </section>
  );
};

export default PublishedPapers;
