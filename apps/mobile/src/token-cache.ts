import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/expo";

export const tokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key, token) {
    await SecureStore.setItemAsync(key, token);
  },
  async clearToken(key) {
    await SecureStore.deleteItemAsync(key);
  },
};
