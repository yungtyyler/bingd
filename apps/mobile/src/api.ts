import { useAuth } from "@clerk/expo";
import Constants from "expo-constants";
import { useMemo, useRef } from "react";
import { Platform } from "react-native";

const fallbackApiBaseUrl = "https://getbingd.com";
const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

function getExpoHostName() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) return null;

  const hostWithPort = hostUri.replace(/^[a-z]+:\/\//i, "").split("/")[0];
  return hostWithPort.split(":")[0] || null;
}

function resolveLocalApiBaseUrl(apiBaseUrl: string) {
  try {
    const url = new URL(apiBaseUrl);

    if (!localHostnames.has(url.hostname)) {
      return apiBaseUrl;
    }

    if (Platform.OS === "android") {
      url.hostname = "10.0.2.2";
      return url.toString().replace(/\/$/, "");
    }

    const expoHostName = getExpoHostName();

    if (expoHostName && !localHostnames.has(expoHostName)) {
      url.hostname = expoHostName;
      return url.toString().replace(/\/$/, "");
    }

    return apiBaseUrl;
  } catch {
    return apiBaseUrl;
  }
}

export function getApiBaseUrl() {
  const configuredApiBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    fallbackApiBaseUrl;

  return resolveLocalApiBaseUrl(configuredApiBaseUrl);
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
      const apiBaseUrl = getApiBaseUrl();
      let response: Response;

      try {
        response = await fetch(`${apiBaseUrl}${path}`, {
          ...options,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
        });
      } catch {
        throw new Error(`Could not connect to ${apiBaseUrl}.`);
      }

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

        const devDetails = __DEV__
          ? ` (${response.status} from ${apiBaseUrl}${path})`
          : "";

        throw new Error(`${errorMessage}${devDetails}`);
      }

      return data as T;
    }

    return { request };
  }, []);
}
