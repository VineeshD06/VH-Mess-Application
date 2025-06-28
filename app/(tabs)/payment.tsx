import { Colors } from '@/constants/Colors';
import { BASE_URL, RAZORPAY_KEY_ID } from '@/constants/config';
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

type BookingEntry = { day: string; meal: string; qty: number; price: number };

export default function Payment() {
  const isDark = useTheme().dark;
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const router = useRouter();
  const params = useLocalSearchParams<{total: string, bookings: string}>();

  const toPay= Number(params.total) * 100;
  const bookings   = JSON.parse(params.bookings ?? '[]');

  const items: BookingEntry[] = useMemo(() => {
    const arr: BookingEntry[] = [];
    Object.entries(bookings).forEach(([day, meals]) => {
      Object.entries(meals as Record<string, number>).forEach(([mealKey, qty]: any) => {
        if (qty > 0) {
          arr.push({
            day,
            meal: mealKey,
            qty,
            price: qty * 0,
          });
        }
      });
    });
    return arr;
  }, [bookings]);

  const [busy, setBusy] = useState(false);
  const pay=async ()=>{
    try {
      setBusy(true);
      const res = await fetch(`${BASE_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: toPay })
      });
      const order= await res.json();

      const options = {
        description: 'Test Payment',
        image: 'https://i.imgur.com/3g7nmJC.jpg',
        currency: order.currency,
        key: RAZORPAY_KEY_ID, // Replace with your Test Key ID
        amount: order.amount, 
        name: 'Your App Name',
        order_id: order.id, // From backend via Razorpay Orders API
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'John Doe'
        },
        theme: { color: '#3399cc' }
      };
      const data = await RazorpayCheckout.open(options);
      const check = await fetch(`${BASE_URL}/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({
            bookings, total: Number(params.total),
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id:   data.razorpay_order_id,
            razorpay_signature:  data.razorpay_signature
          })
        });
        const verified = await check.json();
        if(verified.valid==true){
        router.replace({
          pathname:'/success/[paymentId]',
          params: {
            paymentId: data.razorpay_payment_id,
            items: JSON.stringify(items),   
            total: (toPay/100).toString(),
          },
        });
        }
        else{
          Alert.alert('Payment failed');
        }

    } catch (error: any) {
      Alert.alert('Payment failed', error?.message ?? 'Retry');   
    } finally {
        setBusy(false);
      }

  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Summary</Text>

        <ScrollView>
          {items.length === 0 ? (
            <Text style={styles.rowLabel}>No meals selected.</Text>
          ) : (
            items.map((item, idx) => (
              <View key={idx.toString()} style={styles.row}>
                <Text style={styles.rowLabel}>{`${item.day} • ${item.meal}`}</Text>
                <Text style={styles.rowQty}>x{item.qty}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total to pay</Text>
          <Text style={styles.totalValue}>₹{(Number(Number(toPay).toFixed(2)) / 100)}</Text>
        </View>
      </View>

      {busy ? (
        <ActivityIndicator size="large" color="#3399cc" style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.payBtn} activeOpacity={0.7} onPress={pay}>
          <Text style={styles.payText}>Pay ₹{Number(toPay)/100}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    card: {
      width: '100%',
      backgroundColor: isDark ? Colors.dark.card : '#fff',
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
      color: isDark ? Colors.dark.text : '#333',
    },
    rowQty: {
      fontSize: 14,
      color: isDark ? Colors.dark.text : '#333',
    },
    divider: {
      height: 1,
      backgroundColor: '#e1e1e1',
      marginVertical: 12,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
    payBtn: {
      width: '100%',
      marginTop: 24,
      backgroundColor: '#3399cc',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    payText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}