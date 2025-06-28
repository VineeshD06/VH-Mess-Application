import { Colors } from '@/constants/Colors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


type MealKey = "breakfast" | "lunch" | "dinner";
type MealDetails = { description: string; price: number; coupons: number };
type WeeklyMenu = Record<string, Record<MealKey, MealDetails>>;
type Booking = Record<string, Record<MealKey, number>>;



const MENU_KEY = "weeklyMenu";
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function BookingScreen() {
  const isDark = useTheme().dark;
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const router = useRouter();

  const [menuData, setMenuData] = useState<WeeklyMenu | null>(null);
  const [bookings, setBookings] = useState<Booking>({});
  const todayIndex = new Date().getDay();
  const todayLabel = days[todayIndex];
  const [expandedDay, setExpandedDay] = useState<string>(todayLabel);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(MENU_KEY);
      if (raw) setMenuData(JSON.parse(raw));
    })();
  }, []);

  const isPastDay = (day: string) => days.indexOf(day) < todayIndex;


  const isMealOpen = (day: string, meal: MealKey) => {
    if (day !== todayLabel) return true; // future day — always open

    // Today: enforce cut‑off times
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    if (meal === "breakfast") return h < 6;
    if (meal === "lunch") return h < 12 || (h === 11 && m <= 59);
    if (meal === "dinner") return h < 18;
    return true;
  };

  const toggleMeal = (day: string, meal: MealKey) => {
    if (isPastDay(day) || !isMealOpen(day, meal)) {
      Alert.alert("Booking Closed", "Booking is closed for this selection.");
      return;
    }
    setBookings((prev) => {
      const updated = { ...prev };
      const curr = prev[day]?.[meal] ?? 0;
      if (!updated[day]) updated[day] = {} as any;
      updated[day][meal] = curr === 0 ? 1 : 0;
      return updated;
    });
  };

  const changePeople = (day: string, meal: MealKey, delta: number) => {
    setBookings((prev) => {
      const updated = { ...prev };
      const curr = prev[day]?.[meal] ?? 0;
      const next = Math.max(1, curr + delta);
      if (!updated[day]) updated[day] = {} as any;
      updated[day][meal] = next;
      return updated;
    });
  };

  const calculateTotalPrice = () =>
    Object.entries(bookings).reduce(
      (sum, [day, meals]) =>
        sum +
        Object.entries(meals).reduce(
          (daySum, [meal, cnt]) =>
            daySum + cnt * (menuData![day][meal as MealKey].price),
          0
        ),
      0
    );

  const handleSubmit = () => {
    const total = calculateTotalPrice();

    router.push({
      pathname:'/payment',
      params: { total: total.toString() , bookings:JSON.stringify(bookings)},

    });
  };

  const showConfirmationAlert = () => {
    setTimeout(() => {
      Alert.alert(
        "Confirm Order",
        "Proceed to Payment?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit", onPress: handleSubmit },
        ],
        { cancelable: true }
      );
    }, 100);
  };

  if (!menuData)
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading menu…</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <ScrollView style={[
            styles.container,
            { flexGrow: 1, paddingBottom: 80 }]}>
        <Text style={styles.notice}>
          Book today before cut-off times, or any time for future days. Past days are locked.
        </Text>
        <Text style={styles.heading}>Book Your Meals</Text>

        {Object.entries(menuData).map(([day, meals]) => {
          const past = isPastDay(day);
          const isExpanded = expandedDay === day;
          return (
            <View key={day} style={styles.daySection}>
              {past ? (
                <>
                  <Text style={styles.dayTitle}>{day}</Text>
                  <Text style={styles.deadlineNote}>(Booking closed)</Text>
                </>
              ) : (
                <TouchableOpacity onPress={() => setExpandedDay((ed) => (ed === day ? "" : day))}>
                  <Text style={styles.dayTitle}>{day}</Text>
                </TouchableOpacity>
              )}

              {!past && isExpanded && (
                <View style={styles.mealSection}>
                  {(Object.keys(meals) as MealKey[]).map((meal) => {
                    const open = isMealOpen(day, meal);
                    const count = bookings[day]?.[meal] ?? 0;
                    return (
                      <View key={meal} style={styles.mealRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mealLabel}>
                            {meal.charAt(0).toUpperCase() + meal.slice(1)}
                          </Text>
                          <Text style={styles.mealDescription}>{meals[meal].description}</Text>
                          <Text style={styles.mealPrice}>₹{meals[meal].price}</Text>
                          <Text style={styles.coupon}>{meals[meal].coupons} coupon(s)</Text>
                        </View>

                        <Switch
                          value={count > 0}
                          disabled={!open}
                          onValueChange={() => toggleMeal(day, meal)}
                          trackColor={{ true: open ? undefined : "#888" }}
                          thumbColor={open ? undefined : "#555"}
                        />

                        {open && count > 0 && (
                          <View style={styles.counterContainer}>
                            <TouchableOpacity onPress={() => changePeople(day, meal, -1)}>
                              <Text style={styles.counterBtn}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.counterText}>{count}</Text>
                            <TouchableOpacity onPress={() => changePeople(day, meal, 1)}>
                              <Text style={styles.counterBtn}>+</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {!open && day === todayLabel && (
                          <Text style={styles.closedLabel}>Closed for today</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Price:=: ₹{calculateTotalPrice()}</Text>
        </View>
        <View style={[styles.submitContainer,{marginBottom:10}]}>
          <TouchableOpacity style={styles.button} onPress={()=>{router.push('/(tabs)');}}>
          <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button,(calculateTotalPrice()==0) && styles.buttonDisabled]} disabled={calculateTotalPrice()==0} onPress={showConfirmationAlert}>
          <Text style={styles.buttonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    notice: {
      fontSize: 14,
      marginBottom: 8,
      color: isDark ? Colors.dark.notice : Colors.light.notice,
      textAlign: "center",
      fontFamily: 'OpenSans_400Regular',
    },
    heading: {
      fontSize: 24,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 12,
      textAlign:'center',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    daySection: {
      marginBottom: 12,
      padding: 12,
      backgroundColor: isDark ? Colors.dark.daySection : Colors.light.daySection,
      borderRadius: 8,
    },
    dayTitle: {
      fontSize: 20,
      fontFamily: 'Poppins_600SemiBold',
      color: isDark ? Colors.dark.dayTitle : Colors.light.dayTitle,
    },
    deadlineNote: {
      fontSize: 12,
      fontFamily: 'OpenSans_400Regular',
      color: isDark ? Colors.dark.deadlineNote : Colors.light.deadlineNote,
      marginTop: 4,
    },
    mealSection: {
      marginTop: 10,
    },
    mealRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 6,
    },
    mealLabel: {
      fontSize: 16,
      fontFamily: 'Poppins_600SemiBold',
      color: isDark ? Colors.dark.mealLabel : Colors.light.mealLabel,
    },
    mealDescription: {
      fontSize: 12,
      fontFamily: 'OpenSans_400Regular',
      color: isDark ? Colors.dark.mealDescription : Colors.light.mealDescription,
      marginBottom: 2,
    },
    mealPrice: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: isDark ? Colors.dark.mealPrice : Colors.light.mealPrice,
    },
    coupon: {
      fontSize: 12,
      fontFamily: 'OpenSans_400Regular',
      color: isDark ? Colors.dark.coupon : Colors.light.coupon,
    },
    counterContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
    },
    counterBtn: {
      fontSize: 20,
      width: 30,
      textAlign: "center",
      fontFamily: 'Inter_400Regular',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    counterText: {
      fontSize: 16,
      width: 30,
      textAlign: "center",
      fontFamily: 'Inter_400Regular',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    closedLabel: {
      fontFamily: 'Poppins_600SemiBold',
      color: isDark ? Colors.dark.closedLabel : Colors.light.closedLabel,
    },
    totalContainer: {
      marginTop: 20,
      padding: 12,
      backgroundColor: isDark ? Colors.dark.daySection : Colors.light.daySection,
      borderRadius: 12,
      alignItems: "center",
    },
    totalText: {
      fontSize: 16,
      fontFamily: 'OpenSans_400Regular',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    submitContainer: {
      marginTop: 10,
      marginBottom: 10,
      flex:1,
    },
    button: {
    backgroundColor: '#3399cc',     // primary color
    paddingVertical: 12,            // vertical padding
    paddingHorizontal: 20,          // horizontal padding
    borderRadius: 10,               // rounded corners
    alignItems: 'center',           // center text
    justifyContent: 'center',
    marginVertical: 8,              // vertical spacing between buttons
    elevation: 2,                   // subtle shadow (Android)
    shadowColor: '#000',            // subtle shadow (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',         // greyed out
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',              // semi-bold
    fontFamily: 'Poppins_600SemiBold', // optional custom font
  },
  });
}