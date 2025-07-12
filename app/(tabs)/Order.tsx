import { Colors } from '@/constants/Colors';
import { BASE_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type BookingEntry = { day: string; meal: string; qty: number; price: number };


export default function Payment() {
  const isDark = useTheme().dark;
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const router = useRouter();
  const params = useLocalSearchParams<{total: string, bookings: string, items?: string; }>();

  const toPay= Number(params.total) * 100;
  const bookings   = JSON.parse(params.bookings ?? '[]');

  const items: BookingEntry[] = useMemo(() => {
    if (params.items) {
      try {
        return JSON.parse(params.items);
      } catch {
        console.warn('items JSON malformed');
      }
    }
  const arr: BookingEntry[] = [];
  const bookingsObj = JSON.parse(params.bookings ?? '{}');

  Object.entries(bookingsObj).forEach(([day, meals]) => {
    Object.entries(meals as any).forEach(([mealKey, val]) => {
      if (!val) return;

      if (typeof val === 'object') {
        const { qty, price } = val as { qty: number; price: number };
        if (qty > 0) arr.push({ day, meal: mealKey, qty, price });
      }

      if (typeof val === 'number' && val > 0) {
        arr.push({ day, meal: mealKey, qty: val, price: 0 });
      }
    });
  });

  return arr;
}, [params.items, params.bookings]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');


  useEffect(() => {
    const loadFormData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('user_form_data');
        if (storedData) {
          const { name, email, contact } = JSON.parse(storedData);
          setName(name);
          setEmail(email);
          setContact(contact);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };

    loadFormData();
  }, []);

  const saveUserData = async (email:string, name:string, contact:string) => {
    try {
       const formData = JSON.stringify({ email, name, contact });
       await AsyncStorage.setItem('user_form_data', formData);
    } catch (err) {
      console.log('Error saving data', err);
    }
  };


  const [busy, setBusy] = useState(false);


  function getDateFromWeekday(weekday: string, referenceDate = new Date()): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = dayNames.indexOf(weekday);
  const today = referenceDate.getDay();

  const daysUntilTarget = (targetDay - today + 7) % 7;
  const resultDate = new Date(referenceDate);
  resultDate.setDate(referenceDate.getDate() + daysUntilTarget);

  return resultDate.toISOString().split('T')[0];
}
  let orderIdFromServer = '';



  const pay=async ()=>{

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedContact = contact.trim();

  if (!trimmedName || !trimmedEmail || !trimmedContact) {
    Alert.alert('Missing Details', 'Please fill in all the fields.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    Alert.alert('Invalid Email', 'Please enter a valid email address.');
    return;
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(trimmedContact)) {
    Alert.alert('Invalid Contact', 'Please enter a valid 10-digit contact number.');
    return;
  }
  saveUserData(email, name, contact);

  

    try {
      setBusy(true);
      let order;
      try {
        
        const selections = items.flatMap(it =>
          Array(it.qty).fill({
            meal_date: getDateFromWeekday(it.day),
            meal_type: it.meal
          })
        );

        const initres = await fetch(`${BASE_URL}/api/coupons/initiate-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: name,
            customerEmail: email,
            customerPhone: contact,
            selections,
          }),
        });

        const initdata = await initres.json();
        if (!initres.ok) throw new Error(initdata.message || 'Failed to initiate order.');
        orderIdFromServer = initdata.order_id;

        const stored = await AsyncStorage.getItem('transactions');
        const prev: BookingEntry[] = stored ? JSON.parse(stored) : [];

        const coupons = items.map(it => ({
          orderid: orderIdFromServer,               // order id 
          booked:new Date().toDateString(),        //booking date(on which the coupon was purchased)
          day: it.day,                             // booked for day (e.g. 'Monday')
          date:getDateFromWeekday(it.day),         // booked for date (ddmmyyyy)
          meal: it.meal,                            // 'breakfast' | 'lunch' | 'dinner'
          qty: it.qty,                              //quantity purchased
          cost: it.price,                           // ₹ for that meal
          userName: name,                           // entered in form
        }));

        await AsyncStorage.setItem(
          'transactions',
          JSON.stringify([...coupons, ...prev])     // prepend newest on top
        );
      } catch (err) {
        console.warn('Failed to save transactions:', err);
      }

      router.replace({
        pathname:'/success/[orderID]',
        params: {
          orderID: orderIdFromServer,
          items: JSON.stringify(items),   
          total: (toPay/100).toString(),
        },
      });
       

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
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter Your Name'
          placeholderTextColor={isDark ? '#aaa' : '#555'}
          value={name}
          onChangeText={text => setName(text)}
        />
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Email"
          placeholderTextColor={isDark ? '#ccc' : '#555'}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={text => setEmail(text.toLowerCase())}
        />
        <Text style={styles.label}>Contact:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Contact"
          placeholderTextColor={isDark ? '#aaa' : '#555'}
          value={contact}
          keyboardType="phone-pad"
          onChangeText={text => setContact(text)}
        />

            <View style={styles.divider} />

        <Text style={styles.cardTitle}>Order Summary</Text>

        <ScrollView>
          
          {items.length === 0 ? (
            <Text style={styles.rowLabel}>No meals selected.</Text>
          ) : (
            items.map((item, idx) => (
              <View key={idx.toString()} style={styles.row}>
                <Text style={styles.rowLabel}>{`${item.day} • ${item.meal}`}</Text>
                <Text style={styles.rowQty}>x{item.qty} =  ₹{item.price}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{(Number(Number(toPay).toFixed(2)) / 100)}</Text>
        </View>
      </View>

      {busy ? (
        <ActivityIndicator size="large" color="#3399cc" style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.payBtn} activeOpacity={0.7} onPress={pay}>
          <Text style={styles.payText}>Confirm Order</Text>
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
      fontSize: 21,
      fontWeight: '700',
      marginBottom: 12,
      marginTop:12,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    rowLabel: {
      fontWeight:500,
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
      backgroundColor: isDark ? Colors.dark.gray333 : Colors.light.grayeee,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    payText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
  label: {
    padding:3,
    fontWeight:500,
    fontSize: 14,
    color: isDark ? Colors.dark.text : '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: isDark ? Colors.dark.text : Colors.light.text,
  },
  form: {
    padding: 2,
    marginTop: 50,
    color: isDark ? Colors.dark.text : Colors.light.text,
  },
  });
}