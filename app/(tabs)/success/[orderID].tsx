// app/success/[paymentId].tsx
import { Colors } from '@/constants/Colors';
import { useTheme } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Item = { day: string; meal: string; qty: number };

export default function Success() {
  const {orderID, items = '[]', total = '0' } =
    useLocalSearchParams<{ orderID: string ;  items: string; total: string }>();

  const itemArr: Item[] = JSON.parse(items);

  const isDark  = useTheme().dark;
  const styles  = useMemo(() => createStyles(isDark), [isDark]);
  const router  = useRouter();

  const generatePDFReceipt = async () => {
    try {
      const html = `
       <html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt</title>
    <style>
      body {
        font-family: 'Courier New', Courier, monospace;
        background: #f5f5f5;
        margin: 0;
        padding: 0;
      }

      .receipt-box {
        max-width: 420px;
        margin: 40px auto;
        padding: 24px;
        background: #fff;
        border: 2px dashed #333;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
      }

      h1 {
        font-size: 24px;
        text-align: center;
        margin: 0 0 16px 0;
        letter-spacing: 1.2px;
        color: #222;
      }

      h2 {
        font-size: 16px;
        margin: 20px 0 8px 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
        color: #333;
      }

      h3 {
        font-size: 18px;
        margin-top: 20px;
        text-align: right;
        color: #222;
        font-weight: bold;
      }

      p {
        font-size: 14px;
        margin: 6px 0;
        color: #444;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      li {
        font-size: 14px;
        padding: 6px 0;
        border-bottom: 1px dotted #ccc;
        display: flex;
        justify-content: space-between;
        color: #333;
      }

      .label {
        font-weight: bold;
        color: #333;
      }

      .footer {
        margin-top: 24px;
        text-align: center;
        font-size: 12px;
        color: #777;
        border-top: 1px dashed #bbb;
        padding-top: 10px;
        letter-spacing: 0.6px;
      }
    </style>
  </head>
  <body>
    <div class="receipt-box">
      <h1>Payment Receipt</h1>

      <p><span class="label">Order ID:</span> ${orderID}</p>
      <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>

      <h2>Items Purchased</h2>
      <ul>
        ${itemArr
          .map(
            (it) =>
              `<li><span>${it.day} - ${it.meal.charAt(0).toUpperCase() + it.meal.slice(1)}</span><span>${it.qty}×</span></li>`
          )
          .join('')}
      </ul>

      <h3>Total Paid: ₹${Number(total).toFixed(2)}</h3>

      <div class="footer">
        Thank you for your purchase!<br />
        VH Mess Application
      </div>
    </div>
  </body>
</html>

      `;

      
      const file = await Print.printToFileAsync({ html: html, base64: false });
      const newUri = file.uri.replace(/[^/]+$/, `Receipt-${orderID}.pdf`);
      await FileSystem.moveAsync({ from: file.uri, to: newUri });
      await Sharing.shareAsync(newUri);
    } catch (err) {
      console.error('PDF generation error:', err);
      Alert.alert('Error', 'Could not generate receipt PDF.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <Text style={styles.title}>✅ Order Created!</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you booked</Text>

          <ScrollView>
            {itemArr.map((it, idx) => (
              <View key={idx.toString()} style={styles.row}>
                <Text style={styles.rowLabel}>
                  {it.day} • {it.meal.charAt(0).toUpperCase() + it.meal.slice(1)}
                </Text>
                <Text style={styles.rowQty}>{it.qty}×</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total to Pay at Counter</Text>
            <Text style={styles.totalValue}>₹{Number(total).toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.subLabel}>Order ID</Text>
            <Text style={styles.idText}>{orderID}</Text>
          </View>
        </View>

        <Text style={styles.noteText}>
          * Booking receipt can be downloaded from here.
        </Text>

        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={generatePDFReceipt}
        >
          <Text style={styles.backBtnText}>Download Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backBtn, { marginTop: 14 }]}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.backBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

/* ── dynamic styles ───────────────────────────────────── */
function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 20,
    },
    card: {
      width: '100%',
      maxHeight: '60%',
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      padding: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    rowLabel: {
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    rowQty: {
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    divider: {
      height: 1,
      backgroundColor: '#e1e1e1',
      marginVertical: 12,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    totalValue: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    subLabel: {
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginTop: 4,
    },
    idText: {
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    noteText: {
      color: '#d32f2f',
      fontSize: 12,
      marginTop: 18,
      marginBottom: 2,
      textAlign: 'center',
    },
    backBtn: {
      marginTop: 18,
      backgroundColor: '#3399cc',
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 10,
    },
    backBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
