import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MealKey = 'breakfast' | 'lunch' | 'dinner';
type MealDetails = { description: string; price: number; coupons: number };
type WeeklyMenu = Record<string, Record<MealKey, MealDetails>>;
type Booking = Record<string, Record<MealKey, number>>;

const MENU_KEY = 'weeklyMenu';
const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// Compute current ISO week range (Mon-Sun)
function getWeekRange(date: Date) {
  const day = date.getDay() || 7; // Sunday -> 7
  const monday = new Date(date);
  monday.setDate(date.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

export default function BookingScreen() {
  const isDark = useTheme().dark;
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const router = useRouter();

  const [menuData, setMenuData] = useState<WeeklyMenu | null>(null);
  const [bookings, setBookings] = useState<Booking>({});
  const today = new Date();
  const { start: weekStart, end: weekEnd } = getWeekRange(today);
  const todayIndex = today.getDay() || 7; // 1-7
  const todayLabel = dayNames[todayIndex - 1];
  const [expandedDay, setExpandedDay] = useState<string>(todayLabel);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(MENU_KEY);
      if (raw) setMenuData(JSON.parse(raw));
    })();
  }, []);

  const daysOfThisWeek = dayNames.filter((dayName, idx) => {
    const dt = new Date(weekStart);
    dt.setDate(weekStart.getDate() + idx);
    return dt >= weekStart && dt <= weekEnd;
  });

  const isPastDay = (dayName: string) => {
    const idx = dayNames.indexOf(dayName);
    const dt = new Date(weekStart);
    dt.setDate(weekStart.getDate() + idx);
    return dt < today;
  };

  const isMealOpen = (day: string, meal: MealKey) => {
    if (day !== todayLabel) return true;
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    if (meal === 'breakfast') return h < 6;
    if (meal === 'lunch') return h < 12 || (h === 11 && m <= 59);
    if (meal === 'dinner') return h < 18;
    return true;
  };

  const toggleMeal = (day: string, meal: MealKey) => {
    if (isPastDay(day) || !isMealOpen(day, meal)) {
      Alert.alert('Booking Closed', 'Booking is closed for this selection.');
      return;
    }
    setBookings(prev => {
      const updated = { ...prev };
      const curr = prev[day]?.[meal] ?? 0;
      if (!updated[day]) updated[day] = {} as any;
      updated[day][meal] = curr === 0 ? 1 : 0;
      return updated;
    });
  };

  const changePeople = (day: string, meal: MealKey, delta: number) => {
    setBookings(prev => {
      const updated = { ...prev };
      const curr = prev[day]?.[meal] ?? 0;
      const next = Math.max(1, curr + delta);
      if (!updated[day]) updated[day] = {} as any;
      updated[day][meal] = next;
      return updated;
    });
  };

  const calculateTotalPrice = () =>
    Object.entries(bookings).reduce((sum, [day, meals]) =>
      sum + Object.entries(meals).reduce((daySum, [meal, cnt]) =>
        daySum + cnt * menuData![day][meal as MealKey].price, 0), 0);

  const handleSubmit = () => {
    const total = calculateTotalPrice();
    router.push({
      pathname: '/payment',
      params: { total: total.toString(), bookings: JSON.stringify(bookings) }
    });
  };

  const showConfirmationAlert = () => {
    setTimeout(() => {
      Alert.alert('Confirm Order', 'Proceed to Payment?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: handleSubmit }
      ], { cancelable: true });
    }, 100);
  };

  if (!menuData) {
    return <View style={styles.container}><Text style={styles.heading}>Loading menu…</Text></View>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left','right','bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} style={styles.container}>
        <Text style={styles.notice}>
          Book only within this week. Past days are locked; today's cut‑offs apply.
        </Text>
        <Text style={styles.heading}>Book Your Meals</Text>

        {daysOfThisWeek.map(day => {
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
                <TouchableOpacity onPress={() => setExpandedDay(ed => ed === day ? '' : day)}>
                  <Text style={styles.dayTitle}>{day}</Text>
                </TouchableOpacity>
              )}

              {!past && isExpanded && (
                <View style={styles.mealSection}>
                  {(Object.keys(menuData![day]) as MealKey[]).map(meal => {
                    const open = isMealOpen(day, meal);
                    const count = bookings[day]?.[meal] ?? 0;
                    const details = menuData![day][meal];
                    return (
                      <View key={meal} style={styles.mealRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mealLabel}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                          <Text style={styles.mealDescription}>{details.description}</Text>
                          <Text style={styles.mealPrice}>₹{details.price}</Text>
                          <Text style={styles.coupon}>{details.coupons} coupon(s)</Text>
                        </View>

                        <Switch
                          value={count > 0}
                          disabled={!open}
                          onValueChange={() => toggleMeal(day, meal)}
                          trackColor={{ true: open ? undefined : '#888' }}
                          thumbColor={open ? undefined : '#555'}
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
          <Text style={styles.totalText}>Total Price: ₹{calculateTotalPrice()}</Text>
        </View>
        <View style={styles.submitContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, calculateTotalPrice() === 0 && styles.buttonDisabled]}
            disabled={calculateTotalPrice() === 0}
            onPress={showConfirmationAlert}
          >
            <Text style={styles.buttonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { StyleSheet } from 'react-native';
function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: isDark ? Colors.dark.screenBg : Colors.light.screenBg,
    },
    notice: {
      fontSize: 14,
      marginBottom: 10,
      color: isDark ? Colors.dark.noticeText : Colors.light.noticeText,
      textAlign: 'center',
      fontFamily: 'OpenSans_400Regular',
    },
    heading: {
      fontSize: 24,
      textAlign: 'center',
      fontFamily: 'Poppins_600SemiBold',
      color: isDark ? Colors.dark.headingText : Colors.light.headingText,
      marginBottom: 12,
    },
    daySection: {
      marginBottom: 14,
      padding: 14,
      borderRadius: 10,
      backgroundColor: isDark ? Colors.dark.cardBg : Colors.light.cardBg,
    },
    dayTitle: {
      fontSize: 20,
      fontFamily: 'Poppins_600SemiBold',
      color: isDark ? Colors.dark.dayTitle : Colors.light.dayTitle,
    },
    deadlineNote: {
      marginTop: 4,
      fontSize: 12,
      fontFamily: 'OpenSans_400Regular',
      color: isDark ? Colors.dark.closedText : Colors.light.closedText,
    },
    mealSection: {
      marginTop: 10,
    },
    mealRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 6,
      paddingVertical: 6,
      borderBottomColor: isDark ? Colors.dark.border : Colors.light.border,
      borderBottomWidth: 0.5,
    },
    mealLabel: {
      fontSize: 16,
      fontFamily: 'Poppins_600SemiBold',
      color: isDark ? Colors.dark.mealLabel : Colors.light.mealLabel,
    },
    mealDescription: {
      fontSize: 12,
      fontFamily: 'OpenSans_400Regular',
      color: isDark ? Colors.dark.subText : Colors.light.subText,
      marginBottom: 2,
    },
    mealPrice: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: isDark ? Colors.dark.price : Colors.light.price,
    },
    coupon: {
      fontSize: 12,
      fontFamily: 'OpenSans_400Regular',
      color: isDark ? Colors.dark.coupon : Colors.light.coupon,
    },
    counterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    counterBtn: {
      fontSize: 20,
      width: 30,
      textAlign: 'center',
      color: isDark ? Colors.dark.buttonText : Colors.light.buttonText,
    },
    counterText: {
      fontSize: 16,
      width: 30,
      textAlign: 'center',
      fontFamily: 'Inter_400Regular',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    closedLabel: {
      fontSize: 13,
      fontStyle: 'italic',
      color: isDark ? Colors.dark.closedLabel : Colors.light.closedLabel,
      fontFamily: 'Poppins_500Medium',
      marginTop: 6,
    },
    totalContainer: {
      marginTop: 20,
      padding: 12,
      borderRadius: 10,
      backgroundColor: isDark ? Colors.dark.totalCard : Colors.light.totalCard,
      alignItems: 'center',
    },
    totalText: {
      fontSize: 16,
      fontFamily: 'OpenSans_600SemiBold',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    submitContainer: {
      marginTop: 16,
    },
    button: {
      backgroundColor: '#3399cc',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginVertical: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    buttonDisabled: {
      backgroundColor: '#a0a0a0',
      shadowOpacity: 0,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins_600SemiBold',
    },
  });
}
