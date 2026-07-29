import { useAuth, useUser } from "@clerk/expo";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getApiBaseUrl, useBingdApi } from "./api";
import { colors, spacing } from "./theme";
import type { LibraryEntry, MobileUser, SearchShow, WatchStatus } from "./types";

type TabKey = "dashboard" | "library" | "search" | "settings";

const tabs: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Home" },
  { key: "library", label: "Library" },
  { key: "search", label: "Search" },
  { key: "settings", label: "Settings" },
];

const statusOptions: WatchStatus[] = [
  "PLANNED",
  "WATCHING",
  "COMPLETED",
  "DROPPED",
];

function formatDate(value: string | null) {
  if (!value) return "Soon";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function Card({
  entry,
  onStatusChange,
}: {
  entry: LibraryEntry;
  onStatusChange?: (showId: string, status: WatchStatus) => void;
}) {
  if (!entry.show) return null;

  return (
    <View style={styles.card}>
      <View style={styles.posterWrap}>
        {entry.show.imageUrl ? (
          <Image
            source={{ uri: entry.show.imageUrl }}
            style={styles.poster}
            alt={entry.show.name}
          />
        ) : (
          <View style={styles.emptyPoster}>
            <Text style={styles.mutedSmall}>No image</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={styles.cardTitle}>
        {entry.show.name}
      </Text>
      {entry.show.nextEpisodeDate ? (
        <Text style={styles.cardMeta}>
          Next: {formatDate(entry.show.nextEpisodeDate)}
        </Text>
      ) : (
        <Text style={styles.cardMeta}>{entry.show.network || entry.show.status}</Text>
      )}
      {onStatusChange ? (
        <View style={styles.statusRow}>
          {statusOptions.map((status) => (
            <Pressable
              key={status}
              onPress={() => onStatusChange(entry.showId, status)}
              style={[
                styles.statusPill,
                entry.status === status && styles.statusPillActive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  entry.status === status && styles.statusTextActive,
                ]}
              >
                {status.slice(0, 1)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.headerBlock}>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function UsernameGate({
  user,
  onSaved,
}: {
  user: MobileUser;
  onSaved: (user: MobileUser) => void;
}) {
  const api = useBingdApi();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setError("");
    setIsSaving(true);
    try {
      const result = await api.request<{ user: MobileUser }>("/api/mobile/me", {
        method: "PATCH",
        body: JSON.stringify({ username }),
      });
      onSaved(result.user);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save username.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.productOnlyScreen}>
        <Text style={styles.brand}>bingd.</Text>
        <View style={styles.panel}>
          <Text style={styles.screenTitle}>Choose a username</Text>
          <Text style={styles.subtitle}>
            This is how friends will find your library.
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="yourname"
            placeholderTextColor={colors.faint}
            style={styles.input}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable
            disabled={isSaving}
            onPress={save}
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? "Saving..." : "Continue"}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.mutedSmall}>Signed in as {user.firstName || "Friend"}</Text>
      </View>
    </SafeAreaView>
  );
}

function DashboardScreen() {
  const api = useBingdApi();
  const [activeShows, setActiveShows] = useState<LibraryEntry[]>([]);
  const [upcomingShows, setUpcomingShows] = useState<LibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await api.request<{
      activeShows: LibraryEntry[];
      upcomingShows: LibraryEntry[];
    }>("/api/mobile/dashboard");
    setActiveShows(result.activeShows);
    setUpcomingShows(result.upcomingShows);
  }, [api]);

  useEffect(() => {
    const hydrate = async () => {
      await load();
      setIsLoading(false);
    };

    void hydrate();
  }, [load]);

  const refresh = async () => {
    setIsRefreshing(true);
    await load().finally(() => setIsRefreshing(false));
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
      }
    >
      <ScreenHeader title="Home" subtitle="Tonight, this week, and what is next." />
      {upcomingShows.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Upcoming</Text>
          <FlatList
            horizontal
            data={upcomingShows}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Card entry={item} />}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : null}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Continue Watching</Text>
        {activeShows.length > 0 ? (
          <View style={styles.grid}>
            {activeShows.map((entry) => (
              <Card key={entry.id} entry={entry} />
            ))}
          </View>
        ) : (
          <EmptyState text="Add a show and mark it watching to build your home screen." />
        )}
      </View>
    </ScrollView>
  );
}

function LibraryScreen() {
  const api = useBingdApi();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const result = await api.request<{ entries: LibraryEntry[] }>(
      "/api/mobile/library",
    );
    setEntries(result.entries);
  }, [api]);

  useEffect(() => {
    const hydrate = async () => {
      await load();
      setIsLoading(false);
    };

    void hydrate();
  }, [load]);

  const updateStatus = async (showId: string, status: WatchStatus) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.showId === showId ? { ...entry, status } : entry,
      ),
    );
    await api.request(`/api/mobile/library/${showId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ScreenHeader title="Library" subtitle={`${entries.length} tracked shows`} />
      {entries.length > 0 ? (
        <View style={styles.grid}>
          {entries.map((entry) => (
            <Card key={entry.id} entry={entry} onStatusChange={updateStatus} />
          ))}
        </View>
      ) : (
        <EmptyState text="Your library is empty. Search for a show to get started." />
      )}
    </ScrollView>
  );
}

function SearchScreen({ onAdded }: { onAdded: () => void }) {
  const api = useBingdApi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    const handle = setTimeout(async () => {
      if (trimmed.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.request<{ shows: SearchShow[] }>(
          `/api/mobile/search?q=${encodeURIComponent(trimmed)}`,
        );
        setResults(response.shows);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [api, query]);

  const addShow = async (show: SearchShow) => {
    await api.request("/api/mobile/library", {
      method: "POST",
      body: JSON.stringify(show),
    });
    setResults((current) =>
      current.map((item) =>
        item.tvmazeId === show.tvmazeId ? { ...item, status: "PLANNED" } : item,
      ),
    );
    onAdded();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ScreenHeader title="Search" subtitle="Find shows and add them to your list." />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search TV shows"
        placeholderTextColor={colors.faint}
        style={styles.input}
        autoCapitalize="none"
      />
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.resultList}>
        {results.map((show) => (
          <View key={show.tvmazeId} style={styles.resultRow}>
            {show.imageUrl ? (
              <Image
                source={{ uri: show.imageUrl }}
                style={styles.resultImage}
                alt={show.name}
              />
            ) : (
              <View style={styles.resultImage} />
            )}
            <View style={styles.resultText}>
              <Text numberOfLines={2} style={styles.resultTitle}>
                {show.name}
              </Text>
              <Text style={styles.cardMeta}>
                {show.status ? "In library" : "Ready to add"}
              </Text>
            </View>
            <Pressable
              disabled={!!show.status}
              onPress={() => addShow(show)}
              style={[
                styles.smallButton,
                show.status && styles.disabledButton,
              ]}
            >
              <Text style={styles.smallButtonText}>
                {show.status ? "Saved" : "Add"}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SettingsScreen({ user }: { user: MobileUser }) {
  const api = useBingdApi();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [isRegistering, setIsRegistering] = useState(false);

  const registerPush = async () => {
    setIsRegistering(true);
    try {
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Notification permission was not granted.");
      }

      const token = await Notifications.getDevicePushTokenAsync();
      const platform = Device.osName === "iOS" ? "IOS" : "ANDROID";

      await api.request("/api/push-subscriptions", {
        method: "POST",
        body: JSON.stringify({
          token: token.data,
          platform,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          deviceName: `${Device.manufacturer || ""} ${Device.modelName || "phone"}`.trim(),
        }),
      });

      Alert.alert("Notifications enabled", "This phone is ready for alerts.");
    } catch (caughtError) {
      Alert.alert(
        "Could not enable notifications",
        caughtError instanceof Error
          ? caughtError.message
          : "Please try again later.",
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const openWeb = (path: string) => {
    void Linking.openURL(`${getApiBaseUrl()}${path}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ScreenHeader title="Settings" subtitle={`@${user.username}`} />
      <View style={styles.panel}>
        <Text style={styles.sectionLabel}>Account</Text>
        <Text style={styles.cardTitle}>
          {clerkUser?.firstName || user.firstName || "Friend"}
        </Text>
        <Text style={styles.cardMeta}>{clerkUser?.primaryEmailAddress?.emailAddress}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.sectionLabel}>Notifications</Text>
        <Text style={styles.subtitle}>
          Register this phone so bingd can send episode alerts.
        </Text>
        <Pressable
          disabled={isRegistering}
          onPress={registerPush}
          style={[styles.primaryButton, isRegistering && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>
            {isRegistering ? "Registering..." : "Enable notifications"}
          </Text>
        </Pressable>
      </View>
      <View style={styles.panel}>
        <Text style={styles.sectionLabel}>Legal</Text>
        <Pressable onPress={() => openWeb("/privacy")} style={styles.linkButton}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Pressable>
        <Pressable onPress={() => openWeb("/terms")} style={styles.linkButton}>
          <Text style={styles.linkText}>Terms of Use</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => signOut()} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.subtitle}>{text}</Text>
    </View>
  );
}

export default function AppShell() {
  const api = useBingdApi();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [user, setUser] = useState<MobileUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  useEffect(() => {
    api
      .request<{ user: MobileUser }>("/api/mobile/me")
      .then((result) => setUser(result.user))
      .finally(() => setIsLoadingUser(false));
  }, [api]);

  const content = useMemo(() => {
    if (tab === "dashboard") return <DashboardScreen />;
    if (tab === "library") return <LibraryScreen key={libraryRefreshKey} />;
    if (tab === "search") {
      return (
        <SearchScreen
          onAdded={() => setLibraryRefreshKey((current) => current + 1)}
        />
      );
    }
    if (user) return <SettingsScreen user={user} />;
    return null;
  }, [libraryRefreshKey, tab, user]);

  if (isLoadingUser || !user) {
    return <LoadingState />;
  }

  if (user.needsUsername) {
    return <UsernameGate user={user} onSaved={setUser} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appHeader}>
        <Text style={styles.brand}>bingd.</Text>
      </View>
      <View style={styles.content}>{content}</View>
      <View style={styles.tabBar}>
        {tabs.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setTab(item.key)}
            style={[styles.tab, tab === item.key && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === item.key && styles.tabTextActive]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base,
  },
  appHeader: {
    paddingHorizontal: spacing.pageX,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productOnlyScreen: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.pageX,
    gap: 24,
    backgroundColor: colors.base,
  },
  brand: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.pageX,
    paddingTop: 22,
    paddingBottom: 36,
    gap: 22,
  },
  headerBlock: {
    gap: 6,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: 156,
    padding: 10,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  posterWrap: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.black,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  emptyPoster: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mutedSmall: {
    color: colors.faint,
    fontSize: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    gap: 6,
    paddingTop: 2,
  },
  statusPill: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  statusPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
  },
  statusTextActive: {
    color: colors.black,
  },
  panel: {
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    color: colors.text,
    fontSize: 16,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.55,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  resultList: {
    gap: 12,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  resultImage: {
    width: 48,
    height: 72,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
  resultText: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  smallButton: {
    minWidth: 62,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: colors.primary,
  },
  smallButtonText: {
    color: colors.black,
    fontSize: 13,
    fontWeight: "900",
  },
  linkButton: {
    minHeight: 42,
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "800",
  },
  signOutButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  signOutText: {
    color: colors.text,
    fontWeight: "900",
  },
  emptyState: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.base,
  },
  tabBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.base,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.cardSoft,
  },
  tabText: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: "800",
  },
  tabTextActive: {
    color: colors.primary,
  },
});
