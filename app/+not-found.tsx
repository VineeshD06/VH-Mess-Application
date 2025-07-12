import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { SvgUri } from "react-native-svg";
import { Asset } from "expo-asset";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
const NotFound = require("@/assets/images/NotFound.svg");

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <SvgUri
            width={150}
            height={150}
            uri={Asset.fromModule(NotFound).uri}
          />
          <Text style={styles.meal}>Page Not Found</Text>
          <Text style={styles.row}>
            The page you are looking for does not exist.
          </Text>
        </View>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  meal: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  row: {
    fontSize: 16,
    marginTop: 10,
    color: "#666",
  },
});
