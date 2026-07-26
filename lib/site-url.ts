const fallbackBaseAddress = "http://localhost:3000";

export const SITE_URL = (
  process.env.BASE_ADDRESS || fallbackBaseAddress
).replace(/\/$/, "");

export const SITE_URL_OBJECT = new URL(SITE_URL);
