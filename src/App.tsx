import { useAuth } from "react-oidc-context";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import About from "./components/About";
import Login from "./components/Login";
import PaperViewer from "./components/PaperViewer";
import PublishedPapers from "./components/PublishedPapers";
import UploadPage from "./components/UploadPage";

const App = () => {
  const auth = useAuth();

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
                  <p className="home-topline">
                    We believe that dementia research should be available to all, immediately,
                    without barriers, for free.
                  </p>
                  <div className="home-links">
                    <Link className="home-link" to="/about">
                      Read the mission
                    </Link>
                    <Link className="home-link" to="/upload">
                      Upload a manuscript
                    </Link>
                  </div>
                </div>
                <div className="logo-container">
                  <button
                    className="logout-button"
                    type="button"
                    onClick={() => auth.signoutRedirect()}
                  >
                    Sign out
                  </button>
                  <div className="logo-wrap">
                    <img src="/rad_logo.svg" alt="Dementia X Change logo" />
                  </div>
                </div>
              </header>

              <PublishedPapers />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/about"
        element={auth.isAuthenticated ? <About /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/upload"
        element={auth.isAuthenticated ? <UploadPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/papers/:paperId"
        element={auth.isAuthenticated ? <PaperViewer /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
