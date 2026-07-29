import { StyleSheet } from "react-native";

export const colors = {
  base: "#050805",
  card: "#0f1511",
  cardSoft: "#111a14",
  border: "#213027",
  borderStrong: "#2f4637",
  primary: "#22c55e",
  primaryDark: "#16a34a",
  text: "#f8fafc",
  muted: "#94a3b8",
  faint: "#64748b",
  danger: "#f87171",
  black: "#020403",
};

export const spacing = {
  pageX: 18,
};

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.base,
  },
  centeredScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.base,
  },
  authHeader: {
    paddingTop: 72,
    paddingHorizontal: spacing.pageX,
    paddingBottom: 20,
  },
  authPanel: {
    flex: 1,
    overflow: "hidden",
  },
  brand: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
  },
  bodyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
