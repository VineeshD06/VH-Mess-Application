import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Meal = {
  id: string;
  day:string;
  date: string;
  meal: string;
  qty: number;
  cost: number;
  receiptUrl?: string;
  userName?: string;
  booked:string;
};

export default function History() {
  const isDark = useTheme().dark;
  const mode = isDark ? 'dark' : 'light';
  const styles = createStyles(mode);

  const [history, setHistory] = useState<Meal[]>([]);
  const logoFallback = require('@/assets/IIT-Kanpur.png');


  // Load real transactions from AsyncStorage
useFocusEffect(
  useCallback(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('transactions');
        if (stored) {
        const parsed: Meal[] = JSON.parse(stored);

        // Sort: newest date first
        const sorted = parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(sorted);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } 
    };
    loadData();
  }, [])
);

  const generatePDFReceipt = async (item: Meal) => {
    try {
      const logo = Asset.fromModule(logoFallback).uri;
      const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Meal Coupon Receipt</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              background: #f7f7f7;
              margin: 0;
              padding: 0;
            }
            .receipt-box {
              max-width: 380px;
              margin: 40px auto;
              padding: 24px 24px 16px 24px;
              border: 1.5px dashed #333;
              background: #fff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            }
            h1 {
              font-size: 22px;
              text-align: center;
              margin: 0 0 12px 0;
              letter-spacing: 1px;
            }
            p {
              font-size: 13px;
              margin: 6px 0;
            }
            .footer {
              margin-top: 18px;
              text-align: center;
              font-size: 11px;
              color: #888;
              border-top: 1px dashed #bbb;
              padding-top: 8px;
              letter-spacing: 0.5px;
            }
            .label {
              color: #555;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <h1>Meal Coupon</h1>
            <p><span class="label">Name:</span> ${item.userName || 'Guest'}</p>
            <p><span class="label">Order ID:</span> ${item.id}</p>
            <p><span class="label">Booked For:</span> ${item.day} ${item.date} </p>
            <p><span class="label">Meal:</span> ${item.meal}</p>
            <p><span class="label">Each Meal Cost:</span> ₹${item.cost}</p>
            <p><span class="label">Amount Paid:</span> ₹${item.cost*item.qty}</p>
            <p><span class="label">Booked On:</span> ${item.booked}</p>
            <div class="footer">
              VH Mess Application • IIT Kanpur
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
        keyExtractor={(item) => `${item.id}_${item.date}_${item.meal}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: mode === 'dark' ? '#aaa' : '#333' }}>
            No bookings yet.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => generatePDFReceipt(item)} style={[styles.card, { borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' }]}>
            <View style={styles.row}>
              <Text style={styles.meal}>{item.meal.charAt(0).toUpperCase() + item.meal.slice(1,)} Coupon {'\n'} {item.date} </Text>
              <Text style={styles.cost}>₹{item.cost * item.qty}</Text>
            </View>
            <Text style={styles.date}>Bought For: {item.day}</Text>
            <Text style={styles.id}>Order ID: {item.id}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

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
