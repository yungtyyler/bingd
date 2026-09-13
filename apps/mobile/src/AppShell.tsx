import { useAuth, useUser } from "@clerk/expo";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { getApiBaseUrl, useBingdApi } from "./api";
import { colors, spacing } from "./theme";
import type {
  FriendActivity,
  LibraryEntry,
  MobileUser,
  ProfileDetail,
  SearchShow,
  SearchUser,
  ShowDetail,
  WatchStatus,
} from "./types";

type TabKey = "dashboard" | "library" | "friends" | "search" | "settings";
type DetailView =
  | { type: "show"; tvmazeId: number }
  | { type: "profile"; username: string };

const tabs: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Home" },
  { key: "library", label: "Library" },
  { key: "friends", label: "Friends" },
  { key: "search", label: "Search" },
  { key: "settings", label: "Settings" },
];

const statusOptions: WatchStatus[] = [
  "PLANNED",
  "WATCHING",
  "COMPLETED",
  "DROPPED",
];

const gridGap = 12;

const statusLabels: Record<WatchStatus, string> = {
  PLANNED: "Planned",
  WATCHING: "Watching",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};

const activityLabels: Record<WatchStatus, string> = {
  PLANNED: "wants to watch",
  WATCHING: "is watching",
  COMPLETED: "finished",
  DROPPED: "dropped",
};

function formatDate(value: string | null) {
  if (!value) return "Soon";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatYear(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.getFullYear().toString();
}

function formatPersonName(user: {
  username: string;
  firstName: string | null;
  lastName: string | null;
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || `@${user.username}`;
}

function getErrorMessage(caughtError: unknown, fallback: string) {
  return caughtError instanceof Error ? caughtError.message : fallback;
}

function Card({
  entry,
  onStatusChange,
  onShowPress,
  isUpdating = false,
  cardWidth,
}: {
  entry: LibraryEntry;
  onStatusChange?: (showId: string, status: WatchStatus) => void;
  onShowPress?: (tvmazeId: number) => void;
  isUpdating?: boolean;
  cardWidth?: number;
}) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  if (!entry.show) return null;

  const selectStatus = (status: WatchStatus) => {
    setIsStatusMenuOpen(false);
    if (status !== entry.status) {
      onStatusChange?.(entry.showId, status);
    }
  };

  return (
    <View style={[styles.card, cardWidth ? { width: cardWidth } : null]}>
      <Pressable
        disabled={!onShowPress}
        onPress={() => onShowPress?.(entry.show!.tvmazeId)}
        style={styles.cardPressArea}
        accessibilityRole={onShowPress ? "button" : undefined}
        accessibilityLabel={
          onShowPress ? `Open details for ${entry.show.name}` : undefined
        }
      >
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
          <Text style={styles.cardMeta}>
            {entry.show.network || entry.show.status}
          </Text>
        )}
      </Pressable>
      {onStatusChange ? (
        <>
          <Pressable
            disabled={isUpdating}
            onPress={() => setIsStatusMenuOpen(true)}
            style={[styles.statusSelect, isUpdating && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityLabel={`Change status. Current status is ${statusLabels[entry.status]}.`}
          >
            <Text style={styles.statusSelectLabel}>
              {isUpdating ? "Saving..." : statusLabels[entry.status]}
            </Text>
            <Text style={styles.statusSelectChevron}>v</Text>
          </Pressable>
          <Modal
            visible={isStatusMenuOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsStatusMenuOpen(false)}
          >
            <Pressable
              style={styles.statusOverlay}
              onPress={() => setIsStatusMenuOpen(false)}
            >
              <View
                style={styles.statusMenu}
                onStartShouldSetResponder={() => true}
              >
                <Text numberOfLines={1} style={styles.statusMenuTitle}>
                  {entry.show.name}
                </Text>
                {statusOptions.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => selectStatus(status)}
                    style={[
                      styles.statusOption,
                      entry.status === status && styles.statusOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        entry.status === status &&
                          styles.statusOptionTextActive,
                      ]}
                    >
                      {statusLabels[status]}
                    </Text>
                    {entry.status === status ? (
                      <Text style={styles.statusSelectedText}>Selected</Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>
        </>
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

function Avatar({
  imageUrl,
  label,
  size = 44,
}: {
  imageUrl: string | null;
  label: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatarImage} alt={label} />
      ) : (
        <Text style={styles.avatarText}>{label.slice(0, 1).toUpperCase()}</Text>
      )}
    </View>
  );
}

function DetailHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.detailHeader}>
      <Pressable
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text numberOfLines={1} style={styles.detailHeaderTitle}>
        {title}
      </Text>
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

function DashboardScreen({
  onShowPress,
}: {
  onShowPress: (tvmazeId: number) => void;
}) {
  const api = useBingdApi();
  const { width } = useWindowDimensions();
  const [activeShows, setActiveShows] = useState<LibraryEntry[]>([]);
  const [upcomingShows, setUpcomingShows] = useState<LibraryEntry[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const gridCardWidth = useMemo(
    () => Math.floor((width - spacing.pageX * 2 - gridGap) / 2),
    [width],
  );

  const load = useCallback(async () => {
    try {
      setError("");
      const result = await api.request<{
        activeShows: LibraryEntry[];
        upcomingShows: LibraryEntry[];
      }>("/api/mobile/dashboard");
      setActiveShows(result.activeShows);
      setUpcomingShows(result.upcomingShows);
    } catch (caughtError) {
      setActiveShows([]);
      setUpcomingShows([]);
      setError(getErrorMessage(caughtError, "Could not load your home screen."));
    }
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
      {error ? (
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>{error}</Text>
          <Pressable onPress={load} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {!error && upcomingShows.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Upcoming</Text>
          <FlatList
            horizontal
            data={upcomingShows}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card entry={item} onShowPress={onShowPress} />
            )}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : null}
      {!error ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Continue Watching</Text>
          {activeShows.length > 0 ? (
            <View style={styles.grid}>
              {activeShows.map((entry) => (
                <Card
                  key={entry.id}
                  entry={entry}
                  cardWidth={gridCardWidth}
                  onShowPress={onShowPress}
                />
              ))}
            </View>
          ) : (
            <EmptyState text="Add a show and mark it watching to build your home screen." />
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

function LibraryScreen({
  onShowPress,
}: {
  onShowPress: (tvmazeId: number) => void;
}) {
  const api = useBingdApi();
  const { width } = useWindowDimensions();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const updatingShowIdsRef = useRef<Set<string>>(new Set());
  const [updatingShowIds, setUpdatingShowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const gridCardWidth = useMemo(
    () => Math.floor((width - spacing.pageX * 2 - gridGap) / 2),
    [width],
  );

  const load = useCallback(async () => {
    try {
      setError("");
      const result = await api.request<{ entries: LibraryEntry[] }>(
        "/api/mobile/library",
      );
      setEntries(result.entries);
    } catch (caughtError) {
      setEntries([]);
      setError(getErrorMessage(caughtError, "Could not load your library."));
    }
  }, [api]);

  useEffect(() => {
    const hydrate = async () => {
      await load();
      setIsLoading(false);
    };

    void hydrate();
  }, [load]);

  const updateStatus = async (showId: string, status: WatchStatus) => {
    if (updatingShowIdsRef.current.has(showId)) return;

    const previousEntry = entries.find((entry) => entry.showId === showId);
    if (!previousEntry || previousEntry.status === status) return;

    updatingShowIdsRef.current.add(showId);
    setUpdatingShowIds((current) => {
      const next = new Set(current);
      next.add(showId);
      return next;
    });

    setEntries((current) =>
      current.map((entry) =>
        entry.showId === showId ? { ...entry, status } : entry,
      ),
    );

    try {
      await api.request(`/api/mobile/library/${showId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (caughtError) {
      setEntries((current) =>
        current.map((entry) =>
          entry.showId === showId
            ? { ...entry, status: previousEntry.status }
            : entry,
        ),
      );
      Alert.alert(
        "Could not update status",
        caughtError instanceof Error ? caughtError.message : "Please try again.",
      );
    } finally {
      updatingShowIdsRef.current.delete(showId);
      setUpdatingShowIds((current) => {
        const next = new Set(current);
        next.delete(showId);
        return next;
      });
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ScreenHeader title="Library" subtitle={`${entries.length} tracked shows`} />
      {error ? (
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>{error}</Text>
          <Pressable onPress={load} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : entries.length > 0 ? (
        <View style={styles.grid}>
          {entries.map((entry) => (
            <Card
              key={entry.id}
              entry={entry}
              cardWidth={gridCardWidth}
              isUpdating={updatingShowIds.has(entry.showId)}
              onStatusChange={updateStatus}
              onShowPress={onShowPress}
            />
          ))}
        </View>
      ) : (
        <EmptyState text="Your library is empty. Search for a show to get started." />
      )}
    </ScrollView>
  );
}

function FriendsScreen({
  onFindFriends,
  onProfilePress,
  onShowPress,
}: {
  onFindFriends: () => void;
  onProfilePress: (username: string) => void;
  onShowPress: (tvmazeId: number) => void;
}) {
  const api = useBingdApi();
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const result = await api.request<{
        followingCount: number;
        activities: FriendActivity[];
      }>("/api/mobile/friends");
      setFollowingCount(result.followingCount);
      setActivities(result.activities);
    } catch (caughtError) {
      setFollowingCount(0);
      setActivities([]);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load friend activity.",
      );
    }
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
      <ScreenHeader
        title="Friends"
        subtitle="See what the people you follow are watching."
      />
      {error ? (
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>{error}</Text>
          <Pressable onPress={refresh} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : followingCount === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>Follow friends to build your feed.</Text>
          <Pressable onPress={onFindFriends} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Find friends</Text>
          </Pressable>
        </View>
      ) : activities.length === 0 ? (
        <EmptyState text="No recent activity from your friends yet." />
      ) : (
        <View style={styles.activityList}>
          {activities.map((activity) => {
            if (!activity.user || !activity.show) return null;

            const personName = formatPersonName(activity.user);
            const action = activityLabels[activity.status];

            return (
              <View key={activity.id} style={styles.activityRow}>
                <Pressable
                  onPress={() => onProfilePress(activity.user!.username)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${personName}'s profile`}
                >
                  <Avatar
                    imageUrl={activity.user.profileImageUrl}
                    label={personName}
                  />
                </Pressable>
                <View style={styles.activityBody}>
                  <Text style={styles.activityText}>
                    <Text
                      style={styles.activityName}
                      onPress={() => onProfilePress(activity.user!.username)}
                    >
                      {personName}
                    </Text>{" "}
                    <Text>{action}</Text>
                  </Text>
                  <Pressable
                    onPress={() => onShowPress(activity.show!.tvmazeId)}
                    style={styles.activityShow}
                    accessibilityRole="button"
                    accessibilityLabel={`Open details for ${activity.show.name}`}
                  >
                    {activity.show.imageUrl ? (
                      <Image
                        source={{ uri: activity.show.imageUrl }}
                        style={styles.activityPoster}
                        alt={activity.show.name}
                      />
                    ) : (
                      <View style={styles.activityPoster} />
                    )}
                    <View style={styles.activityShowText}>
                      <Text numberOfLines={2} style={styles.resultTitle}>
                        {activity.show.name}
                      </Text>
                      {activity.show.network ? (
                        <Text style={styles.cardMeta}>
                          {activity.show.network}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                  <Text style={styles.activityDate}>
                    {formatDate(activity.updatedAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function SearchScreen({
  onAdded,
  onFollowChange,
  onProfilePress,
  onShowPress,
}: {
  onAdded: () => void;
  onFollowChange: () => void;
  onProfilePress: (username: string) => void;
  onShowPress: (tvmazeId: number) => void;
}) {
  const api = useBingdApi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchShow[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const updatingUserIdsRef = useRef<Set<string>>(new Set());
  const [updatingUserIds, setUpdatingUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const searchRequestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    const handle = setTimeout(async () => {
      const requestId = searchRequestId.current + 1;
      searchRequestId.current = requestId;

      if (trimmed.length < 2) {
        setResults([]);
        setUsers([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.request<{
          shows: SearchShow[];
          users: SearchUser[];
        }>(
          `/api/mobile/search?q=${encodeURIComponent(trimmed)}`,
        );
        if (searchRequestId.current === requestId) {
          setResults(response.shows);
          setUsers(response.users);
        }
      } catch {
        if (searchRequestId.current === requestId) {
          setResults([]);
          setUsers([]);
        }
      } finally {
        if (searchRequestId.current === requestId) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [api, query]);

  const addShow = async (show: SearchShow) => {
    try {
      await api.request("/api/mobile/library", {
        method: "POST",
        body: JSON.stringify(show),
      });
      setResults((current) =>
        current.map((item) =>
          item.tvmazeId === show.tvmazeId
            ? { ...item, status: "PLANNED" }
            : item,
        ),
      );
      onAdded();
    } catch (caughtError) {
      Alert.alert(
        "Could not add show",
        getErrorMessage(caughtError, "Please try again."),
      );
    }
  };

  const toggleFollow = async (user: SearchUser) => {
    if (user.isCurrentUser || updatingUserIdsRef.current.has(user.id)) return;

    const nextIsFollowing = !user.isFollowing;

    updatingUserIdsRef.current.add(user.id);
    setUpdatingUserIds((current) => {
      const next = new Set(current);
      next.add(user.id);
      return next;
    });
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, isFollowing: nextIsFollowing } : item,
      ),
    );

    try {
      await api.request(`/api/mobile/follows/${user.id}`, {
        method: nextIsFollowing ? "POST" : "DELETE",
      });
      onFollowChange();
    } catch (caughtError) {
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, isFollowing: user.isFollowing } : item,
        ),
      );
      Alert.alert(
        "Could not update follow",
        caughtError instanceof Error ? caughtError.message : "Please try again.",
      );
    } finally {
      updatingUserIdsRef.current.delete(user.id);
      setUpdatingUserIds((current) => {
        const next = new Set(current);
        next.delete(user.id);
        return next;
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ScreenHeader
        title="Search"
        subtitle="Find shows to watch and friends to follow."
      />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search shows or friends"
        placeholderTextColor={colors.faint}
        style={styles.input}
        autoCapitalize="none"
      />
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {users.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>People</Text>
          <View style={styles.resultList}>
            {users.map((user) => {
              const personName = formatPersonName(user);
              const isUpdating = updatingUserIds.has(user.id);

              return (
                <View key={user.id} style={styles.personRow}>
                  <Pressable
                    onPress={() => onProfilePress(user.username)}
                    style={styles.rowPressArea}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${personName}'s profile`}
                  >
                    <Avatar
                      imageUrl={user.profileImageUrl}
                      label={personName}
                      size={46}
                    />
                    <View style={styles.resultText}>
                      <Text numberOfLines={1} style={styles.resultTitle}>
                        {personName}
                      </Text>
                      <Text style={styles.cardMeta}>@{user.username}</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    disabled={user.isCurrentUser || isUpdating}
                    onPress={() => toggleFollow(user)}
                    style={[
                      styles.smallButton,
                      user.isFollowing && styles.followingButton,
                      (user.isCurrentUser || isUpdating) && styles.disabledButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        user.isFollowing && styles.followingButtonText,
                      ]}
                    >
                      {user.isCurrentUser
                        ? "You"
                        : isUpdating
                          ? "Saving"
                          : user.isFollowing
                            ? "Following"
                            : "Follow"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
      {results.length > 0 ? (
        <Text style={styles.sectionLabel}>Shows</Text>
      ) : null}
      <View style={styles.resultList}>
        {results.map((show) => (
          <View key={show.tvmazeId} style={styles.resultRow}>
            <Pressable
              onPress={() => onShowPress(show.tvmazeId)}
              style={styles.rowPressArea}
              accessibilityRole="button"
              accessibilityLabel={`Open details for ${show.name}`}
            >
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
            </Pressable>
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

function ShowDetailScreen({
  tvmazeId,
  onBack,
  onLibraryChange,
}: {
  tvmazeId: number;
  onBack: () => void;
  onLibraryChange: () => void;
}) {
  const api = useBingdApi();
  const [detail, setDetail] = useState<ShowDetail | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const result = await api.request<{ show: ShowDetail }>(
        `/api/mobile/shows/${tvmazeId}`,
      );
      setDetail(result.show);
    } catch (caughtError) {
      setDetail(null);
      setError(getErrorMessage(caughtError, "Could not load this show."));
    }
  }, [api, tvmazeId]);

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    };

    void hydrate();
  }, [load]);

  const addToLibrary = async () => {
    if (!detail) return;

    setIsSaving(true);
    try {
      await api.request("/api/mobile/library", {
        method: "POST",
        body: JSON.stringify({
          tvmazeId: detail.tvmazeId,
          name: detail.name,
          imageUrl: detail.imageUrl,
          status: "PLANNED",
        }),
      });
      await load();
      onLibraryChange();
    } catch (caughtError) {
      Alert.alert(
        "Could not add show",
        getErrorMessage(caughtError, "Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (status: WatchStatus) => {
    if (!detail?.libraryEntry || detail.libraryEntry.status === status) {
      setIsStatusMenuOpen(false);
      return;
    }

    const previousDetail = detail;
    setIsStatusMenuOpen(false);
    setIsSaving(true);
    setDetail({
      ...detail,
      libraryEntry: { ...detail.libraryEntry, status },
    });

    try {
      await api.request(`/api/mobile/library/${detail.libraryEntry.showId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      onLibraryChange();
    } catch (caughtError) {
      setDetail(previousDetail);
      Alert.alert(
        "Could not update status",
        getErrorMessage(caughtError, "Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeFromLibrary = async () => {
    if (!detail?.libraryEntry) return;

    const previousDetail = detail;
    setIsSaving(true);
    setDetail({ ...detail, libraryEntry: null });

    try {
      await api.request(`/api/mobile/library/${detail.libraryEntry.showId}`, {
        method: "DELETE",
      });
      onLibraryChange();
    } catch (caughtError) {
      setDetail(previousDetail);
      Alert.alert(
        "Could not remove show",
        getErrorMessage(caughtError, "Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <DetailHeader title={detail?.name || "Show"} onBack={onBack} />
      {error || !detail ? (
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>{error || "Show not found."}</Text>
          <Pressable onPress={load} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.detailHero}>
            <View style={styles.detailPosterWrap}>
              {detail.imageUrl ? (
                <Image
                  source={{ uri: detail.imageUrl }}
                  style={styles.poster}
                  alt={detail.name}
                />
              ) : (
                <View style={styles.emptyPoster}>
                  <Text style={styles.mutedSmall}>No image</Text>
                </View>
              )}
            </View>
            <View style={styles.detailHeroBody}>
              <Text style={styles.detailTitle}>{detail.name}</Text>
              <Text style={styles.cardMeta}>
                {[detail.network, detail.status, formatYear(detail.premiered)]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
              {detail.genres.length > 0 ? (
                <View style={styles.chipRow}>
                  {detail.genres.map((genre) => (
                    <View key={genre} style={styles.chip}>
                      <Text style={styles.chipText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.bodyCopy}>
              {detail.summary || "No description available."}
            </Text>
          </View>

          {detail.nextEpisodeDate ? (
            <View style={styles.panel}>
              <Text style={styles.sectionLabel}>Next Episode</Text>
              <Text style={styles.cardTitle}>
                {detail.nextEpisodeName || "Upcoming episode"}
              </Text>
              <Text style={styles.cardMeta}>
                {[
                  `Airs ${formatDate(detail.nextEpisodeDate)}`,
                  detail.nextEpisodeSeason && detail.nextEpisodeNumber
                    ? `S${detail.nextEpisodeSeason} E${detail.nextEpisodeNumber}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
            </View>
          ) : null}

          <View style={styles.panel}>
            <Text style={styles.sectionLabel}>Your Library</Text>
            {detail.libraryEntry ? (
              <>
                <Pressable
                  disabled={isSaving}
                  onPress={() => setIsStatusMenuOpen(true)}
                  style={[styles.statusSelect, isSaving && styles.disabledButton]}
                  accessibilityRole="button"
                  accessibilityLabel={`Change status. Current status is ${
                    statusLabels[detail.libraryEntry.status]
                  }.`}
                >
                  <Text style={styles.statusSelectLabel}>
                    {isSaving
                      ? "Saving..."
                      : statusLabels[detail.libraryEntry.status]}
                  </Text>
                  <Text style={styles.statusSelectChevron}>v</Text>
                </Pressable>
                <Pressable
                  disabled={isSaving}
                  onPress={removeFromLibrary}
                  style={[styles.dangerButton, isSaving && styles.disabledButton]}
                >
                  <Text style={styles.dangerButtonText}>Remove from library</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                disabled={isSaving}
                onPress={addToLibrary}
                style={[styles.primaryButton, isSaving && styles.disabledButton]}
              >
                <Text style={styles.primaryButtonText}>
                  {isSaving ? "Saving..." : "Add to Library"}
                </Text>
              </Pressable>
            )}
          </View>

          <Modal
            visible={isStatusMenuOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsStatusMenuOpen(false)}
          >
            <Pressable
              style={styles.statusOverlay}
              onPress={() => setIsStatusMenuOpen(false)}
            >
              <View style={styles.statusMenu} onStartShouldSetResponder={() => true}>
                <Text numberOfLines={1} style={styles.statusMenuTitle}>
                  {detail.name}
                </Text>
                {statusOptions.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => updateStatus(status)}
                    style={[
                      styles.statusOption,
                      detail.libraryEntry?.status === status &&
                        styles.statusOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        detail.libraryEntry?.status === status &&
                          styles.statusOptionTextActive,
                      ]}
                    >
                      {statusLabels[status]}
                    </Text>
                    {detail.libraryEntry?.status === status ? (
                      <Text style={styles.statusSelectedText}>Selected</Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>
        </>
      )}
    </ScrollView>
  );
}

function ProfileDetailScreen({
  username,
  onBack,
  onShowPress,
  onFollowChange,
}: {
  username: string;
  onBack: () => void;
  onShowPress: (tvmazeId: number) => void;
  onFollowChange: () => void;
}) {
  const api = useBingdApi();
  const { width } = useWindowDimensions();
  const [detail, setDetail] = useState<ProfileDetail | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingFollow, setIsSavingFollow] = useState(false);
  const gridCardWidth = useMemo(
    () => Math.floor((width - spacing.pageX * 2 - gridGap) / 2),
    [width],
  );

  const load = useCallback(async () => {
    try {
      setError("");
      const result = await api.request<ProfileDetail>(
        `/api/mobile/users/${encodeURIComponent(username)}`,
      );
      setDetail(result);
    } catch (caughtError) {
      setDetail(null);
      setError(getErrorMessage(caughtError, "Could not load this profile."));
    }
  }, [api, username]);

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    };

    void hydrate();
  }, [load]);

  const toggleFollow = async () => {
    if (!detail || detail.user.isCurrentUser || isSavingFollow) return;

    const nextIsFollowing = !detail.user.isFollowing;
    const previousDetail = detail;

    setIsSavingFollow(true);
    setDetail({
      ...detail,
      user: {
        ...detail.user,
        isFollowing: nextIsFollowing,
        counts: {
          ...detail.user.counts,
          followers: Math.max(
            0,
            detail.user.counts.followers + (nextIsFollowing ? 1 : -1),
          ),
        },
      },
    });

    try {
      await api.request(`/api/mobile/follows/${detail.user.id}`, {
        method: nextIsFollowing ? "POST" : "DELETE",
      });
      onFollowChange();
    } catch (caughtError) {
      setDetail(previousDetail);
      Alert.alert(
        "Could not update follow",
        getErrorMessage(caughtError, "Please try again."),
      );
    } finally {
      setIsSavingFollow(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  const personName = detail ? formatPersonName(detail.user) : username;
  const watching =
    detail?.entries.filter((entry) => entry.status === "WATCHING") || [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <DetailHeader title={`@${username}`} onBack={onBack} />
      {error || !detail ? (
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>{error || "Profile not found."}</Text>
          <Pressable onPress={load} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.profileHero}>
            <Avatar
              imageUrl={detail.user.profileImageUrl}
              label={personName}
              size={88}
            />
            <View style={styles.profileHeroBody}>
              <Text style={styles.detailTitle}>{personName}</Text>
              <Text style={styles.cardMeta}>@{detail.user.username}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{detail.user.counts.shows}</Text>
                  <Text style={styles.statLabel}>Shows</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>
                    {detail.user.counts.followers}
                  </Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>
                    {detail.user.counts.following}
                  </Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>
          </View>

          {detail.user.isCurrentUser ? (
            <View style={styles.panel}>
              <Text style={styles.cardMeta}>This is your profile.</Text>
            </View>
          ) : (
            <Pressable
              disabled={isSavingFollow}
              onPress={toggleFollow}
              style={[
                styles.primaryButton,
                detail.user.isFollowing && styles.followingButton,
                isSavingFollow && styles.disabledButton,
              ]}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  detail.user.isFollowing && styles.followingButtonText,
                ]}
              >
                {isSavingFollow
                  ? "Saving..."
                  : detail.user.isFollowing
                    ? "Following"
                    : "Follow"}
              </Text>
            </Pressable>
          )}

          {watching.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Currently Watching</Text>
              <FlatList
                horizontal
                data={watching}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card entry={item} onShowPress={onShowPress} />
                )}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Library</Text>
            {detail.entries.length > 0 ? (
              <View style={styles.grid}>
                {detail.entries.map((entry) => (
                  <Card
                    key={entry.id}
                    entry={entry}
                    cardWidth={gridCardWidth}
                    onShowPress={onShowPress}
                  />
                ))}
              </View>
            ) : (
              <EmptyState text="No shows in this library yet." />
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function SettingsScreen({
  user,
  onUserChange,
}: {
  user: MobileUser;
  onUserChange: (user: MobileUser) => void;
}) {
  const api = useBingdApi();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [username, setUsername] = useState(user.username);
  const [usernameError, setUsernameError] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    setUsername(user.username);
  }, [user.username]);

  const saveUsername = async () => {
    setUsernameError("");
    setUsernameMessage("");
    setIsSavingUsername(true);

    try {
      const result = await api.request<{ user: MobileUser }>("/api/mobile/me", {
        method: "PATCH",
        body: JSON.stringify({ username }),
      });
      onUserChange(result.user);
      setUsername(result.user.username);
      setUsernameMessage("Username updated.");
    } catch (caughtError) {
      setUsernameError(
        getErrorMessage(caughtError, "Could not update username."),
      );
    } finally {
      setIsSavingUsername(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;

    Alert.alert(
      "Delete account?",
      "This permanently deletes your bingd account, watch library, follows, notification settings, devices, and alert history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleteError("");
            setIsDeletingAccount(true);

            try {
              await api.request("/api/mobile/me", {
                method: "DELETE",
                body: JSON.stringify({ confirmation: deleteConfirmation }),
              });
              await signOut();
            } catch (caughtError) {
              setDeleteError(
                getErrorMessage(caughtError, "Could not delete your account."),
              );
              setIsDeletingAccount(false);
            }
          },
        },
      ],
    );
  };

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
        <Text style={styles.sectionLabel}>Public Profile</Text>
        <Text style={styles.subtitle}>
          Pick the username friends use to find your library.
        </Text>
        <TextInput
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            setUsernameError("");
            setUsernameMessage("");
          }}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="yourname"
          placeholderTextColor={colors.faint}
          style={styles.input}
        />
        {usernameError ? (
          <Text style={styles.errorText}>{usernameError}</Text>
        ) : null}
        {usernameMessage ? (
          <Text style={styles.successText}>{usernameMessage}</Text>
        ) : null}
        <Pressable
          disabled={isSavingUsername || username.trim() === user.username}
          onPress={saveUsername}
          style={[
            styles.primaryButton,
            (isSavingUsername || username.trim() === user.username) &&
              styles.disabledButton,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isSavingUsername ? "Saving..." : "Save username"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => openWeb(`/u/${user.username}`)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>View public profile</Text>
        </Pressable>
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
        <Text style={styles.sectionLabel}>Help & Info</Text>
        <Pressable onPress={() => openWeb("/about")} style={styles.linkButton}>
          <Text style={styles.linkText}>About bingd</Text>
        </Pressable>
        <Pressable onPress={() => openWeb("/contact")} style={styles.linkButton}>
          <Text style={styles.linkText}>Contact support</Text>
        </Pressable>
        <Pressable onPress={() => openWeb("/privacy")} style={styles.linkButton}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Pressable>
        <Pressable onPress={() => openWeb("/terms")} style={styles.linkButton}>
          <Text style={styles.linkText}>Terms of Use</Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL("https://www.tvmaze.com")}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>TV metadata provided by TVmaze</Text>
        </Pressable>
      </View>
      <View style={styles.dangerPanel}>
        <Text style={styles.sectionLabel}>Delete Account</Text>
        <Text style={styles.subtitle}>
          Permanently delete your account, watch library, profile, follows,
          notification settings, devices, and alert history.
        </Text>
        <TextInput
          value={deleteConfirmation}
          onChangeText={(value) => {
            setDeleteConfirmation(value);
            setDeleteError("");
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="Type DELETE"
          placeholderTextColor={colors.faint}
          style={styles.input}
        />
        {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}
        <Pressable
          disabled={isDeletingAccount || deleteConfirmation !== "DELETE"}
          onPress={deleteAccount}
          style={[
            styles.dangerButton,
            (isDeletingAccount || deleteConfirmation !== "DELETE") &&
              styles.disabledButton,
          ]}
        >
          <Text style={styles.dangerButtonText}>
            {isDeletingAccount ? "Deleting..." : "Delete account"}
          </Text>
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
  const [detailStack, setDetailStack] = useState<DetailView[]>([]);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [startupError, setStartupError] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);
  const [friendsRefreshKey, setFriendsRefreshKey] = useState(0);

  const loadCurrentUser = useCallback(async () => {
    setIsLoadingUser(true);
    setStartupError("");
    try {
      const result = await api.request<{ user: MobileUser }>("/api/mobile/me");
      setUser(result.user);
    } catch (caughtError) {
      setUser(null);
      setStartupError(getErrorMessage(caughtError, "Could not load your account."));
    } finally {
      setIsLoadingUser(false);
    }
  }, [api]);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const detailView =
    detailStack.length > 0 ? detailStack[detailStack.length - 1] : null;

  const openShow = useCallback((tvmazeId: number) => {
    setDetailStack((current) => [...current, { type: "show", tvmazeId }]);
  }, []);

  const openProfile = useCallback((username: string) => {
    setDetailStack((current) => [...current, { type: "profile", username }]);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailStack((current) => current.slice(0, -1));
  }, []);

  const content = useMemo(() => {
    if (detailView?.type === "show") {
      return (
        <ShowDetailScreen
          key={`show-${detailView.tvmazeId}`}
          tvmazeId={detailView.tvmazeId}
          onBack={closeDetail}
          onLibraryChange={() =>
            setLibraryRefreshKey((current) => current + 1)
          }
        />
      );
    }
    if (detailView?.type === "profile") {
      return (
        <ProfileDetailScreen
          key={`profile-${detailView.username}`}
          username={detailView.username}
          onBack={closeDetail}
          onShowPress={openShow}
          onFollowChange={() =>
            setFriendsRefreshKey((current) => current + 1)
          }
        />
      );
    }
    if (tab === "dashboard") return <DashboardScreen onShowPress={openShow} />;
    if (tab === "library") {
      return (
        <LibraryScreen key={libraryRefreshKey} onShowPress={openShow} />
      );
    }
    if (tab === "friends") {
      return (
        <FriendsScreen
          key={friendsRefreshKey}
          onFindFriends={() => setTab("search")}
          onProfilePress={openProfile}
          onShowPress={openShow}
        />
      );
    }
    if (tab === "search") {
      return (
        <SearchScreen
          onAdded={() => setLibraryRefreshKey((current) => current + 1)}
          onFollowChange={() => setFriendsRefreshKey((current) => current + 1)}
          onProfilePress={openProfile}
          onShowPress={openShow}
        />
      );
    }
    if (user) return <SettingsScreen user={user} onUserChange={setUser} />;
    return null;
  }, [
    closeDetail,
    detailView,
    friendsRefreshKey,
    libraryRefreshKey,
    openProfile,
    openShow,
    tab,
    user,
  ]);

  if (isLoadingUser || !user) {
    if (startupError) {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.productOnlyScreen}>
            <Text style={styles.brand}>bingd.</Text>
            <View style={styles.emptyState}>
              <Text style={styles.subtitle}>{startupError}</Text>
              <Pressable onPress={loadCurrentUser} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Try again</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    }

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
            onPress={() => {
              setDetailStack([]);
              setTab(item.key);
            }}
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
  bodyCopy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
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
  cardPressArea: {
    gap: 8,
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
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
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
  statusSelect: {
    minHeight: 34,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSoft,
  },
  statusSelectLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  statusSelectChevron: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  statusOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  statusMenu: {
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  statusMenuTitle: {
    marginBottom: 4,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  statusOption: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
  },
  statusOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusOptionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  statusOptionTextActive: {
    color: colors.black,
  },
  statusSelectedText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: "900",
  },
  panel: {
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  dangerPanel: {
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.42)",
    backgroundColor: colors.card,
  },
  detailHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSoft,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  detailHeaderTitle: {
    flex: 1,
    color: colors.faint,
    fontSize: 13,
    fontWeight: "800",
  },
  detailHero: {
    flexDirection: "row",
    gap: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  detailPosterWrap: {
    width: 118,
    aspectRatio: 2 / 3,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.black,
  },
  detailHeroBody: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  detailTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSoft,
  },
  chipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  profileHeroBody: {
    flex: 1,
    gap: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 4,
  },
  stat: {
    gap: 2,
  },
  statNumber: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: "800",
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
  dangerButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: 14,
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
  successText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  resultList: {
    gap: 12,
  },
  activityList: {
    gap: 14,
  },
  activityRow: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  activityBody: {
    flex: 1,
    gap: 10,
  },
  activityText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  activityName: {
    color: colors.text,
    fontWeight: "900",
  },
  activityShow: {
    flexDirection: "row",
    gap: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.base,
  },
  activityPoster: {
    width: 46,
    height: 66,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
  activityShowText: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  activityDate: {
    color: colors.faint,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rowPressArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  followingButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSoft,
  },
  followingButtonText: {
    color: colors.text,
  },
  secondaryButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardSoft,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
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
