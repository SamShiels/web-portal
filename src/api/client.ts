export const apiFetch = async (
  input: RequestInfo,
  init: RequestInit = {},
  accessToken?: string,
  tokenType = "Bearer"
) => {
  const headers = new Headers(init.headers);

  if (accessToken) {
    headers.set("Authorization", `${tokenType} ${accessToken}`);
  }

  return fetch(input, { ...init, headers });
};
