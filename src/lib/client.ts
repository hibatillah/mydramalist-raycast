import { getPreferenceValues } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

const BASE_URL = "https://api.mydramalist.com/v1";

export async function mdlFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const { apiKey } = getPreferenceValues<ExtensionPreferences>();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "mdl-api-key": apiKey,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    showFailureToast(response.statusText, { title: "Failed to fetch data" });
  }

  return response.json() as Promise<T>;
}
