/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_COGNITO_AUTHORITY: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
  readonly VITE_COGNITO_REDIRECT_URI: string;
  readonly VITE_COGNITO_POST_LOGOUT_REDIRECT_URI?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
