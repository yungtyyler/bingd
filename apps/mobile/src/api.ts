import { useAuth } from "@clerk/expo";
import { useMemo, useRef } from "react";

const fallbackApiBaseUrl = "https://getbingd.com";

export function getApiBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    fallbackApiBaseUrl
  );
}

export function useBingdApi() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMemo(() => {
    async function request<T>(
      path: string,
      options: RequestInit = {},
    ): Promise<T> {
      const token = await getTokenRef.current();
      const response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | T
        | null;

      if (!response.ok) {
        const errorMessage =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Request failed.";

        throw new Error(
          errorMessage,
        );
      }

      return data as T;
    }

    return { request };
  }, []);
}
