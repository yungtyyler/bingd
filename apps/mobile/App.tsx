import { ClerkProvider, useAuth } from "@clerk/expo";
import { AuthView } from "@clerk/expo/native";
import { StatusBar } from "expo-status-bar";
import { Component, type ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import AppShell from "./src/AppShell";
import { tokenCache } from "./src/token-cache";
import { globalStyles } from "./src/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MissingConfig() {
  return (
    <View style={globalStyles.centeredScreen}>
      <Text style={globalStyles.brand}>bingd.</Text>
      <Text style={globalStyles.bodyText}>
        Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.
      </Text>
    </View>
  );
}

function BootScreen({ message = "Loading secure session..." }: { message?: string }) {
  return (
    <View style={globalStyles.centeredScreen}>
      <Text style={globalStyles.brand}>bingd.</Text>
      <ActivityIndicator />
      <Text style={globalStyles.bodyText}>{message}</Text>
    </View>
  );
}

function AuthScreen() {
  return (
    <View style={globalStyles.screen}>
      <View style={globalStyles.authHeader}>
        <Text style={globalStyles.brand}>bingd.</Text>
        <Text style={globalStyles.bodyText}>Sign in to keep your shows in sync.</Text>
      </View>
      <View style={globalStyles.authPanel}>
        <AuthView mode="signInOrUp" isDismissible={false} />
      </View>
    </View>
  );
}

function Root() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <BootScreen />;
  }

  return isSignedIn ? <AppShell /> : <AuthScreen />;
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[bingd mobile] app error", error);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={globalStyles.centeredScreen}>
          <Text style={globalStyles.brand}>bingd.</Text>
          <Text style={globalStyles.bodyText}>
            Something went wrong loading the app.
          </Text>
          <Text style={globalStyles.bodyText}>{this.state.error.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  if (!publishableKey) {
    return <MissingConfig />;
  }

  return (
    <AppErrorBoundary>
      <View style={globalStyles.screen}>
        <StatusBar style="light" />
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <Root />
        </ClerkProvider>
      </View>
    </AppErrorBoundary>
  );
}
