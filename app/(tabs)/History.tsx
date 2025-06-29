import { Colors } from '@/constants/Colors';
import { addDummyBookingHistory } from '@/utils/addDummyBookingHistory';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';





type Meal = {
  id: string;
  date: string;
  meal: string;
  cost: number;
  receiptUrl?: string;
  userName?: string;
};

export default function History() {
  const colorScheme = useTheme().dark;
  const mode = colorScheme ? 'dark' : 'light';
  const styles = createStyles(mode);

  const [history, setHistory] = useState<Meal[]>([]);


  const addDummyCards = async () => {
  const dummyData: Meal[] = [
    {
      id: 'ORD123456',
      date: '2025-06-29',
      meal: 'Lunch',
      cost: 75,
      userName: 'Muragesh',
    },
    {
      id: 'ORD789101',
      date: '2025-06-28',
      meal: 'Dinner',
      cost: 90,
      userName: 'Muragesh',
    }
  ];
  await AsyncStorage.setItem('transactions', JSON.stringify(dummyData));
  setHistory(dummyData);
};


  useEffect(() => {
  addDummyBookingHistory();
}, []);



  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('transactions');
        if (stored) setHistory(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    })();
  }, []);
const logoFallback = require('@/assets/IIT-Kanpur.png');

const generatePDFReceipt = async (item: Meal) => {
  try {
    const logo = Asset.fromModule(logoFallback).uri;

    const html = `
      <html>
        <head>
        <head>
          <meta charset="utf-8" />
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f8f9fa;
              padding: 24px;
              color: #333;
            }
            .receipt-box {
              max-width: 600px;
              margin: auto;
              padding: 20px;
              border: 1px solid #eee;
              border-radius: 8px;
              background: #fff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            }
            h1 {
              text-align: center;
              color: #3f51b5;
              margin-bottom: 0;
            }
            .logo {
              max-width: 120px;
              display: block;
              margin: 0 auto 20px;
            }
            table {
              width: 100%;
              line-height: 1.6;
              margin-top: 20px;
              font-size: 14px;
            }
            th {
              text-align: left;
              width: 40%;
              color: #555;
              padding-bottom: 6px;
            }
            td {
              padding-bottom: 6px;
            }
            .footer {
              margin-top: 32px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <img src="${logo}" class="logo" />
            <h1>IITK Mess Receipt</h1>
            <table>
              <tr><th>Order ID</th><td>${item.id}</td></tr>
              <tr><th>Name</th><td>${item.userName || 'Guest'}</td></tr>
              <tr><th>Date</th><td>${item.date}</td></tr>
              <tr><th>Meal</th><td>${item.meal}</td></tr>
              <tr><th>Total Paid</th><td>₹${item.cost}</td></tr>
            </table>
            <div class="footer">
              Thank you for booking with IITK Mess.
            </div>
          </div>
        </body>
      </html>
    `;

    const file = await Print.printToFileAsync({ html, base64: false });

    const filename = `${item.date}_${item.meal}_${item.id}.pdf`;
    const newUri = FileSystem.documentDirectory + filename;

    await FileSystem.moveAsync({ from: file.uri, to: newUri });
    await Sharing.shareAsync(newUri);
  } catch (err) {
    console.error('PDF generation error:', err);
    Alert.alert('Error', 'Could not generate receipt PDF.');
  }
};
return (
  <View style={styles.container}>
    <Text style={styles.heading}>Booking History</Text>
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 40, color: mode === 'dark' ? '#aaa' : '#333' }}>
          No bookings yet.
        </Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => generatePDFReceipt(item)} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.meal}>{item.meal}</Text>
            <Text style={styles.cost}>₹{item.cost}</Text>
          </View>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.id}>ID: {item.id}</Text>
        </TouchableOpacity>
      )}
    />
  </View>
);

function createStyles(mode: 'dark' | 'light') {
  const isDark = mode === 'dark';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      paddingTop: 20,
    },
    listContent: { padding: 16 },
    heading: {
      fontSize: 26,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 14,
      textAlign: 'center',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    card: {
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      shadowColor: isDark ? Colors.dark.text : Colors.light.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 3.6,
      elevation: 3,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    meal: {
      fontSize: 18,
      fontFamily: 'Poppins_600SemiBold',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    cost: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      fontWeight: '700',
      color: isDark ? Colors.dark.tint : Colors.light.tint,
    },
    date: {
      marginTop: 4,
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    id: {
      marginTop: 2,
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault,
    },
  });
}
}