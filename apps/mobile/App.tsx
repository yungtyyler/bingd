import { ClerkProvider, useAuth } from "@clerk/expo";
import { AuthView } from "@clerk/expo/native";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
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

function AuthScreen() {
  return (
    <View style={globalStyles.screen}>
      <View style={globalStyles.authHeader}>
        <Text style={globalStyles.brand}>bingd.</Text>
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
    return (
      <View style={globalStyles.centeredScreen}>
        <Text style={globalStyles.brand}>bingd.</Text>
      </View>
    );
  }

  return isSignedIn ? <AppShell /> : <AuthScreen />;
}

export default function App() {
  if (!publishableKey) {
    return <MissingConfig />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StatusBar style="light" />
      <Root />
    </ClerkProvider>
  );
}
