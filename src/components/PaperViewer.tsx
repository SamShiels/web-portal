import { Link, useParams } from "react-router-dom";
import { PAPERS } from "../data/papers";

const PaperViewer = () => {
  const { paperId } = useParams();
  const paper = PAPERS.find((item) => item.id === paperId);

  if (!paper) {
    return (
      <div className="page">
        <section className="paper-viewer">
          <p className="eyebrow">Paper viewer</p>
          <h1>Paper not found</h1>
          <p className="subhead">
            The paper you are looking for does not exist in the demo list.
          </p>
          <Link className="paper-back" to="/">
            Back to papers
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="paper-viewer">
        <p className="eyebrow">Research dossier</p>
        <div className="paper-viewer-header">
          <div>
            <h1>{paper.title}</h1>
            <p className="paper-viewer-authors">{paper.authors}</p>
          </div>
          <div className="paper-viewer-meta">
            <span className="paper-viewer-dif">DIF {paper.dif}</span>
            <span className="paper-viewer-date">{paper.publishedAt}</span>
          </div>
        </div>
        <div className="paper-viewer-body">
          <div className="paper-viewer-card">
            <h2>Abstract</h2>
            <p>{paper.abstract}</p>
          </div>
          <div className="paper-viewer-card">
            <h2>Downloads</h2>
            <a className="paper-pdf" href={paper.pdfUrl} download>
              Download PDF
            </a>
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
