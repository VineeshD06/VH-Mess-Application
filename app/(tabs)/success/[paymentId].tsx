// app/success/[paymentId].tsx
import { Colors } from '@/constants/Colors';
import { saveTransactionToLocalStorage } from '@/utils/saveTransaction';
import { useTheme } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Transaction = {
  id: string;
  date: string;
  meal: string;
  cost: number;
  receiptUrl: string;
};

type Item = { day: string; meal: string; qty: number };

export default function Success() {
  /* ── params ─────────────────────────────────────────── */
  const { paymentId, items = '[]', total = '0' } =
    useLocalSearchParams<{ paymentId: string; items: string; total: string }>();

  const itemArr: Item[] = JSON.parse(items);

  /* ── hooks & theme ──────────────────────────────────── */
  const isDark  = useTheme().dark;
  const styles  = useMemo(() => createStyles(isDark), [isDark]);
  const router  = useRouter();

  /* ── save each item as a transaction coupon ─────────── */
  useEffect(() => {
    (async () => {
      const transactions: Transaction[] = itemArr.map((it) => ({
        id: paymentId,
        date: new Date().toISOString().slice(0, 10),
        meal: it.meal,
        cost: 45,
        receiptUrl:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      }));
      await saveTransactionToLocalStorage(transactions);
    })();
  }, [itemArr, paymentId]);

  /* ── UI ─────────────────────────────────────────────── */
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <Text style={styles.title}>✅ Payment Successful!</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you bought</Text>

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
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{Number(total).toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.subLabel}>Transaction ID</Text>
            <Text style={styles.idText}>{paymentId}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
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
    backBtn: {
      marginTop: 28,
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
