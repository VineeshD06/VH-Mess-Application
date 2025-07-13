import { BASE_URL } from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeeklyMenu, MealKey } from "./initMenu";

const MENU_KEY = "weeklyMenu";
const LAST_UPDATED_KEY = "weeklyMenuLastUpdated";

export const getWeeklyMenu = async (): Promise<WeeklyMenu | null> => {
  try {
    const [storedMenu, storedLastUpdated] = await AsyncStorage.multiGet([
      MENU_KEY,
      LAST_UPDATED_KEY,
    ]);

    const serverTimeRes = await fetch(`${BASE_URL}/api/menu/last-updated`);
    const serverTimeJson = await serverTimeRes.json();
    const serverLastUpdated = serverTimeJson?.lastUpdated || "";

    if (storedMenu[1] && storedLastUpdated[1] === serverLastUpdated) {
      try {
        return JSON.parse(storedMenu[1]);
      } catch (parseErr) {
        console.warn("Stored menu is corrupted. Refetching fresh menu...");
      }
    }

    const { menu: freshMenu, lastUpdated } = await fetchWeeklyMenuFromServer();

    await AsyncStorage.multiSet([
      [MENU_KEY, JSON.stringify(freshMenu)],
      [LAST_UPDATED_KEY, lastUpdated],
    ]);

    return freshMenu;
  } catch (err) {
    console.error("Failed to load weekly menu:", err);
    return null;
  }
};

const fetchWeeklyMenuFromServer = async (): Promise<{
  menu: WeeklyMenu;
  lastUpdated: string;
}> => {
  try {
    const response = await fetch(`${BASE_URL}/api/menu/current`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    if (!data.success || !Array.isArray(data.menu))
      throw new Error("Invalid API response");

    const transformedMenu: WeeklyMenu = {};
    data.menu.forEach((item: any) => {
      const {
        day_of_week,
        meal_type,
        description,
        price,
        coupons = 0,
      }: {
        day_of_week: string;
        meal_type: MealKey;
        description: string;
        price: number;
        coupons?: number;
      } = item;
      transformedMenu[day_of_week] = transformedMenu[day_of_week] || {};
      if (typeof meal_type === "string") {
        transformedMenu[day_of_week][meal_type as MealKey] = {
          description,
          price,
          coupons,
        };
      }
    });

    return {
      menu: transformedMenu,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch menu from server:", error);
    return { menu: {}, lastUpdated: "" };
  }
};
