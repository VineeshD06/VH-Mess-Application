import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Tabs, useRouter, usePathname } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { useState } from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

import {
  Poppins_400Regular,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';

import {
  Inter_400Regular,
} from '@expo-google-fonts/inter';

// Map route names to readable titles
const PAGE_TITLES: Record<string, string> = {
  index: 'Book Now',
  explore: 'Weekly Menu',
  History: 'Booking History',
  booking: 'Book Room',
  payment: 'Payment',
  success: 'Payment Success',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(true);

  // Set system nav bar color
  SystemUI.setBackgroundColorAsync(!theme ? Colors.dark.background : Colors.light.background);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Inter_400Regular,
    PlayfairDisplay_700Bold,
  });

  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);

  // Handle dynamic success/[id] route
  const isDynamicSuccess = segments[0] === 'success' && segments.length > 1;
  const currentRoute = isDynamicSuccess ? 'success' : segments[segments.length - 1] || 'index';

  const pageTitle = PAGE_TITLES[currentRoute] || currentRoute;

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={!theme ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="rgba(0,0,0,0.5)"
      />

      <View style={{ flex: 1, backgroundColor: !theme ? Colors.dark.background : Colors.light.background, paddingTop: 40 }}>
        <ThemeProvider value={!theme ? DarkTheme : DefaultTheme}>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              marginTop: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {['booking', 'payment', 'success'].includes(currentRoute) && (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{ marginRight: 10, padding: 6, borderRadius: 20 }}
                >
                  <Feather name="arrow-left" size={22} color={!theme ? '#fff' : '#000'} />
                </TouchableOpacity>
              )}
              <Text
                style={{
                  color: !theme ? '#fff' : '#000',
                  fontSize: 22,
                  fontFamily: 'Poppins_600SemiBold',
                }}
              >
                {pageTitle}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setTheme(!theme)}
              style={{ padding: 10, borderRadius: 30 }}
            >
              {theme ? (
                <Feather name="sun" size={22} color="#000" />
              ) : (
                <Feather name="moon" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: theme ? '#333' : '#e0e0e0',
              marginVertical: 8,
            }}
          />

          {/* Bottom Tabs */}
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarBackground: TabBarBackground,
              tabBarStyle: Platform.select({
                ios: {
                  position: 'absolute',
                },
                default: {},
              }),
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Book Now',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="explore"
              options={{
                title: 'Weekly Menu',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="fork.knife.circle.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="History"
              options={{
                title: 'Booking History',
                tabBarIcon: ({ color }) => (
                  <IconSymbol size={28} name="clock.arrow.circlepath" color={color} />
                ),
              }}
            />
            <Tabs.Screen name="booking" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="Order" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="success/[orderID]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
          </Tabs>
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}
