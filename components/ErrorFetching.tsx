import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SvgUri } from "react-native-svg";
const errorImage = require("@/assets/images/index.svg");
import { Asset } from "expo-asset";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native";

type ErrorFetchingProps = {
  mode: "light" | "dark";
  callback: () => {};
};

export default function ErrorFetching({ mode, callback }: ErrorFetchingProps) {
  const styles = createStyles(mode);
  return (
    <View style={{ alignItems: "center", marginTop: 40 }}>
      <SvgUri width={150} height={150} uri={Asset.fromModule(errorImage).uri} />
      <Text style={styles.cardHeading}>Sorry, can't fetch current menu</Text>
      <Text style={styles.description}>Please try again later</Text>
      <TouchableOpacity
        onPress={callback}
        style={{
          marginTop: 10,
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: "#007AFF",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(mode: "light" | "dark") {
  const isDark = mode === "dark";
  return StyleSheet.create({
    cardHeading: {
      fontSize: 20,
      color: isDark ? Colors.dark.tint : Colors.light.tint,
      fontFamily: "Poppins_600SemiBold",
      marginBottom: 2,
    },
    description: {
      fontSize: 14,
      color: isDark ? Colors.dark.descColor : Colors.light.descColor,
      fontFamily: "Poppins_400Regular",
    },
  });
}
