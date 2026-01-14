import { useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import { createPaper } from "../api/client";

const ALLOWED_TYPE = "application/pdf";

const UploadPage = () => {
  const auth = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const isPdf = file.type === ALLOWED_TYPE || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setStatus("Only PDF manuscripts are accepted right now.");
      return;
    }

    setFile(file);
    setStatus(`Selected: ${file.name}`);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleBrowse = () => {
    if (inputRef.current) {
      // Clear the value so picking the same file twice still triggers onChange
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formElement = event.currentTarget;
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    const formData = new FormData(formElement);
    const paperName = String(formData.get("paperTitle") ?? "").trim();
    const authorsRaw = String(formData.get("paperAuthors") ?? "").trim();
    const paperType = String(formData.get("paperType") ?? "").trim();
    const authors = authorsRaw
      .split(",")
      .map((author) => author.trim())
      .filter(Boolean);

    if (!paperName || authors.length === 0 || !paperType) {
      setError("Please complete all required fields.");
      return;
    }

    const accessToken = auth.user?.id_token;
    if (!accessToken) {
      setError("You are not authenticated. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPaper(
        {
          paperName,
          authors,
          paperType
        },
        accessToken
      );

      const uploadData = new FormData();
      Object.entries(response.uploadUrl.fields).forEach(([key, value]) => {
        uploadData.append(key, value);
      });
      uploadData.append("file", file);

      const uploadResponse = await fetch(response.uploadUrl.url, {
        method: "POST",
        body: uploadData
      });

      if (!uploadResponse.ok) {
        const message = await uploadResponse.text();
        throw new Error(message || "Upload failed");
      }

      setStatus("Upload complete. Processing will begin shortly.");
      formElement.reset();
      setFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Back
      </Link>
      <section className="upload">
        <div className="upload-header">
          <h2>Upload your manuscript</h2>
          <p>PDF only for now. We will validate the rest once the pipeline is live.</p>
        </div>
        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="upload-label" htmlFor="paper-title">
            Title
          </label>
          <input id="paper-title" name="paperTitle" type="text" placeholder="Paper title" required />
          <label className="upload-label" htmlFor="paper-authors">
            Authors
          </label>
          <input
            id="paper-authors"
            name="paperAuthors"
            type="text"
            placeholder="Author names"
            required
          />
          <label className="upload-label" htmlFor="paper-type">
            Paper type
          </label>
          <select id="paper-type" name="paperType" className="paper-select" defaultValue="" required>
            <option value="" disabled>
              Select a type
            </option>
            <option value="strobe">STROBE</option>
            <option value="consort">CONSORT</option>
            <option value="arrive">ARRIVE</option>
          </select>
          <div
            className={`dropzone ${dragActive ? "is-active" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={handleBrowse}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleBrowse();
              }
            }}
            aria-label="Upload your manuscript as a PDF"
          >
            <input
              ref={inputRef}
              id="paper-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => handleFiles(event.target.files)}
              hidden
            />
            <div className="dropzone-inner">
              <div className="dropzone-icon">PDF</div>
              <div>
                <p className="dropzone-title">Drag and drop your file here</p>
                <p className="dropzone-caption">or click to browse your device</p>
              </div>
              <button
                type="button"
                className="dropzone-button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleBrowse();
                }}
              >
                Browse files
              </button>
            </div>
          </div>
          {error ? <p className="upload-error">{error}</p> : null}
          <button className="upload-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Submit paper"}
          </button>
        </form>
        <p className="upload-status">{status ?? "No file selected yet."}</p>
      </section>
    </div>
  );
};

export default UploadPage;
