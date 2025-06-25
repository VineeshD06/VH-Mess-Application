import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
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




export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(true)
  SystemUI.setBackgroundColorAsync(!theme ? Colors.dark.background : Colors.light.background );
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Inter_400Regular,
    PlayfairDisplay_700Bold,
  });

  return (
    <SafeAreaProvider >
      <StatusBar barStyle={!theme ? 'light-content' : 'dark-content'} translucent />

    <View style={{ flex: 1, backgroundColor: !theme? Colors.dark.background:Colors.light.background, paddingTop: 40 }}>
      <ThemeProvider value={!theme ? DarkTheme : DefaultTheme}>
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          paddingHorizontal: 16,
          marginBottom: 5,
        }}
      >
        {/* <View >
        <Image
          source={require('@/assets/IIT-Kanpur.png')} // or your actual image path
          style={{ width: 55, height: 55 }}
          resizeMode="contain"
          />
        </View> */}
        <Text
          style={{
            color: !theme ? '#fff' : '#000',
            fontSize: 27,
            alignItems:'center',
            fontFamily: 'PlayfairDisplay_700Bold',            
          }}
        >
          Visitor's Hostel
        </Text>

        <TouchableOpacity
          onPress={() => setTheme(!theme)}
          style={{
            // backgroundColor: theme ? '#e5e5e5':'#444',
            padding: 10,
            borderRadius: 30,
          }}
        >
          {theme ? (
            <Feather name="sun" size={22} color="#000" />
          ) : (
            <Feather name="moon" size={22} color="#fff" />
          )}
        </TouchableOpacity>
        
      </View>
      <View style={{height: 1,
          backgroundColor: theme ? '#333' : '#e0e0e0',
          marginVertical: 8}} />


      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect              
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
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
            title: 'Payment History',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="clock.arrow.circlepath" color={color} />
            ),
          }}
        />
        <Tabs.Screen name="booking" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      </Tabs>
      </ThemeProvider>
    </View>
    </SafeAreaProvider>
  );
}
