import { useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import PublishedPapers from "./components/PublishedPapers";

const ALLOWED_TYPE = "application/pdf";

const App = () => {
  const auth = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const isPdf = file.type === ALLOWED_TYPE || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setStatus("Only PDF manuscripts are accepted right now.");
      return;
    }

    setStatus(`Selected: ${file.name}`);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const renderAuthState = () => {
    if (auth.isLoading || auth.activeNavigator) {
      return (
        <div className="login">
          <div className="login-card">
            <p className="login-subhead">Finishing sign-in...</p>
          </div>
        </div>
      );
    }

    if (auth.error) {
      return (
        <div className="login">
          <div className="login-card">
            <p className="login-error">{auth.error.message}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  const authState = renderAuthState();
  if (authState) {
    return authState;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={() => auth.signinRedirect()} />
          )
        }
      />
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <div className="page">
              <header className="hero">
                <div className="hero-text">
                  <p className="eyebrow">Hackathon Portal</p>
                  <h1>Dementia X Change</h1>
                  <p className="subhead">
                    Trade rough ideas for real-world momentum. Drop in a manuscript draft and we
                    will shape the next steps together.
                  </p>
                </div>
                <div className="logo-wrap">
                  <img src="/logo.svg" alt="Dementia X Change logo" />
                </div>
                <button
                  className="logout-button"
                  type="button"
                  onClick={() => auth.signoutRedirect()}
                >
                  Sign out
                </button>
              </header>

              <section className="upload">
                <div className="upload-header">
                  <h2>Upload your manuscript</h2>
                  <p>PDF only for now. We will validate the rest once the pipeline is live.</p>
                </div>
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
                    <button type="button" className="dropzone-button" onClick={handleBrowse}>
                      Browse files
                    </button>
                  </div>
                </div>
                <p className="upload-status">{status ?? "No file selected yet."}</p>
              </section>
              <PublishedPapers />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
