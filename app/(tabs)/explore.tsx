import { Colors } from "@/constants/Colors";
import { getWeeklyMenu } from "@/utils/menuUtils";
import { WeeklyMenu, MealDetails, mealImages, MealKey } from "@/utils/initMenu";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";

import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import ErrorFetching from "@/components/ErrorFetching";

export default function ExploreScreen() {
  const colorScheme = useTheme().dark;
  const mode = colorScheme ? "dark" : "light";
  const styles = useMemo(() => createStyles(mode), [mode]);
  const [menuData, setMenuData] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);
  const loadMenu = async () => {
    try {
      const menu = await getWeeklyMenu();
      setMenuData(menu);
    } catch (err) {
      console.error("Error loading menu in ExploreScreen:", err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading menu...</Text>
      </View>
    );
  }

  if (!menuData || Object.keys(menuData).length === 0) {
    return <ErrorFetching mode={mode} callback={loadMenu} />;
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ marginBottom: 8, paddingBottom: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(menuData).map(([day, meals]) => (
            <View key={day} style={styles.card}>
              <Text style={styles.day}>{day}</Text>              
              {(["Breakfast", "Lunch", "Dinner"] as MealKey[]).map((mealKey, idx, arr) => {
                const meal = meals[mealKey];
                if (!meal) return null; // 🧹 Skip rendering if null

                const isLast = arr.slice(idx + 1).every(k => !meals[k]);

                return (
                  <React.Fragment key={mealKey}>
                    <View style={styles.row}>
                      <Image
                        source={mealImages[mealKey]}
                        style={styles.image}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>
                          {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
                        </Text>
                        <Text style={styles.desc}>{meal.description}</Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{meal.price}</Text>
                      </View>
                    </View>

                    {!isLast && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}

            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
function createStyles(mode: "light" | "dark") {
  const isDark = mode === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
    },
    heading: {
      fontSize: 26,
      fontFamily: "Poppins_600SemiBold",
      marginBottom: 14,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    card: {
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      borderRadius: 14,
      padding: 18,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeading: {
      fontSize: 20,
      color: isDark ? Colors.dark.tint : Colors.light.tint,
      fontFamily: "Poppins_600SemiBold",
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: isDark ? Colors.dark.descColor : Colors.light.descColor,
      fontFamily: "Poppins_400Regular",
      marginTop: 8,
    },
    day: {
      fontSize: 22,
      fontFamily: "Poppins_600SemiBold",
      marginBottom: 10,
      color: isDark ? Colors.dark.heading : Colors.light.heading,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 6,
    },
    label: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
      marginBottom: 2,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    desc: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: isDark
        ? Colors.dark.mealDescription
        : Colors.light.mealDescription,
    },
    priceContainer: {
      alignItems: "flex-end",
      justifyContent: "center",
      minWidth: 80,
    },
    price: {
      fontSize: 16,
      fontFamily: "OpenSans_400Regular",
      color: isDark ? Colors.dark.mealPrice : Colors.light.mealPrice,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? Colors.dark.divider : Colors.light.divider,
      marginVertical: 8,
    },
    image: {
      width: 45,
      height: 50,
      borderRadius: 10,
    },
  });
}
