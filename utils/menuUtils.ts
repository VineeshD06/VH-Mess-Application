import { BASE_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeeklyMenu, MealKey } from './initMenu';



const MENU_KEY = 'weeklyMenu';
const EXPIRY_KEY = 'weeklyMenuExpiry';
const EXPIRY_DAYS = 3;

export const getWeeklyMenu = async (): Promise<WeeklyMenu | null> => {
  try {
    const [storedMenu, storedExpiry] = await AsyncStorage.multiGet([
      MENU_KEY,
      EXPIRY_KEY,
    ]);

    const now = Date.now();
    const expiryTime = storedExpiry[1] ? parseInt(storedExpiry[1], 10) : 0;

    if (storedMenu[1] && now < expiryTime) {
      try {
        return JSON.parse(storedMenu[1]);
      } catch (parseErr) {
        console.warn('Stored menu is corrupted. Refetching fresh menu...');
      }
    }

    const freshMenu = await fetchWeeklyMenuFromServer();

    await AsyncStorage.multiSet([
      [MENU_KEY, JSON.stringify(freshMenu)],
      [EXPIRY_KEY, (now + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toString()],
    ]);
    return freshMenu;
  } catch (err) {
    console.error('Failed to load weekly menu:', err);
    return null;
  }
};

const fetchWeeklyMenuFromServer = async (): Promise<WeeklyMenu | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/menu/current`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.menu)) {
      throw new Error('Invalid API response structure');
    }
    const transformedMenu: WeeklyMenu = {};
    data.menu.forEach((item: any) => {
      const {
        day_of_week,
        meal_type,
        description,
        price
      }: {
        day_of_week: string;
        meal_type: MealKey;
        description: string;
        price: string;
      } = item;
      // To ensure the key exists 
      transformedMenu[day_of_week] = transformedMenu[day_of_week] || {}; 
      transformedMenu[day_of_week][meal_type] = { description, price: parseFloat(price) };
    });
    return transformedMenu;
  } catch (error) {
    console.error('Failed to fetch menu from server:', error);
    return null;
  }
};
