import type { AuthProviderProps } from "react-oidc-context";

const authority = import.meta.env.VITE_COGNITO_AUTHORITY as string | undefined;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI as string | undefined;
const postLogoutRedirectUri = import.meta.env
  .VITE_COGNITO_POST_LOGOUT_REDIRECT_URI as string | undefined;

if (!authority || !clientId || !redirectUri) {
  throw new Error(
    "Missing Cognito config. Set VITE_COGNITO_AUTHORITY, VITE_COGNITO_CLIENT_ID, and VITE_COGNITO_REDIRECT_URI."
  );
}

export const oidcConfig: AuthProviderProps = {
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: postLogoutRedirectUri ?? redirectUri,
  response_type: "code",
  scope: "openid email profile",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};
