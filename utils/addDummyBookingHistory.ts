import AsyncStorage from '@react-native-async-storage/async-storage';

const dummyBookingHistory = [
  {
    id: "M001",
    date: "2025-06-16",
    meal: "Breakfast",
    cost: 45,
    receiptUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: "M002",
    date: "2025-06-16",
    meal: "Dinner",
    cost: 80,
    receiptUrl: "https://www.africau.edu/images/default/sample.pdf"
  },
  {
    id: "M003",
    date: "2025-06-15",
    meal: "Lunch",
    cost: 65,
    receiptUrl: "https://file-examples.com/storage/fe0f9e1a8d8d6d6b7a6b2e1/2017/10/file-sample_150kB.pdf"
  },
  {
    id: "M004",
    date: "2025-06-14",
    meal: "Snack",
    cost: 30
  }
];

export const addDummyBookingHistory = async () => {
  try {
    await AsyncStorage.setItem('bookingHistory', JSON.stringify(dummyBookingHistory));
    console.log('Dummy booking history added.');
  } catch (error) {
    console.error('Failed to add dummy booking history:', error);
  }
};
