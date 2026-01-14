import type { AuthProviderProps } from "react-oidc-context";

const authority = import.meta.env.VITE_COGNITO_AUTHORITY as string | undefined;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN as string | undefined;
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI as string | undefined;
const postLogoutRedirectUri = import.meta.env
  .VITE_COGNITO_POST_LOGOUT_REDIRECT_URI as string | undefined;

if (!authority || !clientId || !redirectUri || !cognitoDomain || !userPoolId) {
  throw new Error(
    "Missing Cognito config. Set VITE_COGNITO_AUTHORITY, VITE_COGNITO_DOMAIN, VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID, and VITE_COGNITO_REDIRECT_URI."
  );
}

export const oidcConfig: AuthProviderProps = {
  authority: `https://cognito-idp.us-west-2.amazonaws.com/${userPoolId}`,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: postLogoutRedirectUri ?? redirectUri,
  response_type: "code",
  scope: "openid email profile",
  // We only need to manually specify endpoints that Cognito deviates from (like logout)
  // The library will auto-discover the rest from the 'authority' URL
  metadataSeed: {
    end_session_endpoint: `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(postLogoutRedirectUri ?? redirectUri)}`,
  },
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};