import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveTransactionToLocalStorage(newEntries: any[]) {
  const existing = JSON.parse(await AsyncStorage.getItem('bookingHistory') || '[]');
  const updated  = [...existing, ...newEntries];
  await AsyncStorage.setItem('bookingHistory', JSON.stringify(updated));
}