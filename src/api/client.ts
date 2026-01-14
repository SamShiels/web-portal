export type CreatePaperInput = {
  paperName: string;
  authors: string[];
  paperType: string;
};

export type Paper = {
  paperId: string;
  name?: string;
  paperType?: string;
  authors?: string[];
  s3Uri?: string;
  s3MarkdownUri?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  published?: boolean;
  ratings?: Record<string, number>;
  overallRating?: number;
  reviewText?: string | LlmMetricsResponse;
};

export type CreatePaperResponse = {
  paperId: string;
  uploadUrl: {
    url: string;
    fields: Record<string, string>;
  };
};

export type ListPapersResponse = {
  papers: Paper[];
};

export type DownloadUrlResponse = {
  downloadUrl: string;
};

export type LlmMetricItem = {
  rating: number;
  note: string;
};

export type LlmMetricsGroup = Record<string, LlmMetricItem>;

export type LlmMetricsResponse = {
  llm_metrics: Record<string, LlmMetricsGroup>;
  judge?: {
    synthesis_summary?: {
      overview?: string;
      common_themes?: string;
      areas_of_agreement?: string;
      areas_of_disagreement?: string;
      feedback?: string;
      impact?: string;
      impact_rating_explanation?: string;
    };
  };
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatRequest = {
  query: string;
  reviewUri?: string | LlmMetricsResponse;
  history: Array<{ role: ChatMessage["role"]; content: Array<{ text: string }> }>;
};

export type ChatResponse =
  | string
  | { answer?: string; last_message?: string; response?: string; output?: string; message?: string };

const getApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (!apiBaseUrl) {
    throw new Error("Missing API base URL. Set VITE_API_BASE_URL.");
  }

  return apiBaseUrl.replace(/\/$/, "");
};

export const apiFetch = async (
  input: RequestInfo,
  init: RequestInit = {},
  accessToken?: string,
  tokenType = "Bearer"
) => {
  const headers = new Headers(init.headers);

  if (accessToken) {
    headers.set("authorization", `${tokenType} ${accessToken}`);
  }

  return fetch(input, { ...init, headers });
};

const apiRequest = async <T>(
  path: string,
  options: RequestInit,
  accessToken?: string
): Promise<T> => {
  const response = await apiFetch(`${getApiBaseUrl()}${path}`, options, accessToken);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
};

export const createPaper = (payload: CreatePaperInput, accessToken?: string) =>
  apiRequest<CreatePaperResponse>(
    "/papers",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    },
    accessToken
  );

export const listPapers = (accessToken?: string, rating?: number) => {
  const params = rating ? `?rating=${rating}` : "";
  return apiRequest<ListPapersResponse>(`/papers${params}`, { method: "GET" }, accessToken);
};

export const getPaper = (paperId: string, accessToken?: string) =>
  apiRequest<Paper>(`/papers/${paperId}`, { method: "GET" }, accessToken);

export const getDownloadUrl = (paperId: string, accessToken?: string) =>
  apiRequest<DownloadUrlResponse>(`/papers/${paperId}/download`, { method: "GET" }, accessToken);

export const sendChat = (payload: ChatRequest, accessToken?: string) =>
  apiRequest<ChatResponse>(
    "/query",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    },
    accessToken
  );
