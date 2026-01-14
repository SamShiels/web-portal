type LoginProps = {
  onLogin: () => void;
};

const Login = ({ onLogin }: LoginProps) => {
  return (
    <div className="login">
      <div className="login-card">
        <div className="login-header">
          <p className="eyebrow">Hackathon Portal</p>
          <h1>Sign in</h1>
          <p className="login-subhead">Use the demo account to access the exchange.</p>
        </div>
        <button className="login-button" type="button" onClick={onLogin}>
          Sign in with Cognito
        </button>
        <p className="login-note">No registration needed. Ask the organizer for the demo login.</p>
      </div>
    </div>
  );
};

export default Login;
