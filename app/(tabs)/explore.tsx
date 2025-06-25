
//Backend return should match this 
// need to replce fake api
// {
//   "Monday": {
//     "breakfast": {
//       "description": "Idli + chutney",
//       "price": 40,
//       "coupons": 2
//     },
//     ...
//   },
//   ...
// }


//for verification add this dummy data in local storage 
//'weeklyMenu'
// {
//   "Monday": {
//     "breakfast": {
//       "description": "Idli with coconut chutney and hot sambar.",
//       "price": 40,
//       "coupons": 1
//     },
//     "lunch": {
//       "description": "Rice with rasam, curry, and curd.",
//       "price": 70,
//       "coupons": 2
//     },
//     "dinner": {
//       "description": "Chapati with veg kurma.",
//       "price": 60,
//       "coupons": 1
//     }
//   },
//   "Tuesday": {
//     "breakfast": {
//       "description": "Poha with lemon and peanuts.",
//       "price": 35,
//       "coupons": 0
//     },
//     "lunch": {
//       "description": "Rajma rice and salad.",
//       "price": 75,
//       "coupons": 1
//     },
//     "dinner": {
//       "description": "Paratha with curd and pickle.",
//       "price": 65,
//       "coupons": 2
//     }
//   },
//   "Wednesday": {
//     "breakfast": {
//       "description": "Aloo paratha with butter.",
//       "price": 45,
//       "coupons": 1
//     },
//     "lunch": {
//       "description": "Paneer curry with naan.",
//       "price": 80,
//       "coupons": 2
//     },
//     "dinner": {
//       "description": "Tomato rice with chips.",
//       "price": 60,
//       "coupons": 0
//     }
//   },
//   "Thursday": {
//     "breakfast": {
//       "description": "Uttapam with sambar and chutney.",
//       "price": 40,
//       "coupons": 1
//     },
//     "lunch": {
//       "description": "Dal fry with jeera rice.",
//       "price": 70,
//       "coupons": 1
//     },
//     "dinner": {
//       "description": "Veg biryani with raita.",
//       "price": 75,
//       "coupons": 2
//     }
//   },
//   "Friday": {
//     "breakfast": {
//       "description": "Bread butter and boiled egg.",
//       "price": 35,
//       "coupons": 0
//     },
//     "lunch": {
//       "description": "Chole bhature and salad.",
//       "price": 80,
//       "coupons": 2
//     },
//     "dinner": {
//       "description": "Dosa with potato masala.",
//       "price": 60,
//       "coupons": 1
//     }
//   },
//   "Saturday": {
//     "breakfast": {
//       "description": "Cornflakes with milk.",
//       "price": 30,
//       "coupons": 0
//     },
//     "lunch": {
//       "description": "Mixed veg with rice and papad.",
//       "price": 70,
//       "coupons": 1
//     },
//     "dinner": {
//       "description": "Pulao with veg curry.",
//       "price": 65,
//       "coupons": 1
//     }
//   },
//   "Sunday": {
//     "breakfast": {
//       "description": "Pancakes with honey and banana.",
//       "price": 50,
//       "coupons": 1
//     },
//     "lunch": {
//       "description": "Special thali with 3 curries, rice, and dessert.",
//       "price": 90,
//       "coupons": 2
//     },
//     "dinner": {
//       "description": "Chinese noodles and spring roll.",
//       "price": 85,
//       "coupons": 2
//     }
//   }
// }





import { Colors } from '@/constants/Colors';
import { getWeeklyMenu, WeeklyMenu } from '@/utils/menuUtils';
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

type MealKey = 'breakfast' | 'lunch' | 'dinner';
// type MealDetails = { description: string; price: number; };
// type WeeklyMenu = Record<string, Record<MealKey, MealDetails>>;

export default function ExploreScreen() {

  const colorScheme = useTheme().dark;
  const mode = colorScheme ? 'dark' : 'light';
  const styles = useMemo(() => createStyles(mode), [mode]);
  const [menuData, setMenuData] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  
  const mealImages = {
  breakfast: require('../../assets/images/breakfast.jpg'),
  lunch: require('../../assets/images/lunch.jpg'),
  dinner: require('../../assets/images/dinner.jpg'),
  };

  
  useEffect(() => {
    loadMenu();
  }, []);
  const loadMenu = async () => {
    try {
      const menu = await getWeeklyMenu();
      setMenuData(menu);

    } catch (err) {
      console.error('Error loading menu in ExploreScreen:', err);
    } finally {
      setLoading(false);
    }
  };
  
 if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading menu...</Text>
      </View>
    );
  }

  if (!menuData || Object.keys(menuData).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>No menu found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Weekly Menu</Text>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(menuData).map(([day, meals]) => (
            <View key={day} style={styles.card}>
              <Text style={styles.day}>{day}</Text>

              {(['breakfast', 'lunch', 'dinner'] as MealKey[]).map(
                (mealKey, idx) => (
                  <React.Fragment key={mealKey}>
                    <View style={styles.row}>
                      <Image source={mealKey=='breakfast'? mealImages.breakfast: mealKey=='lunch' ? mealImages.lunch: mealImages.dinner}style={styles.image}>                      
                    </Image>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>
                          {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
                        </Text>
                        <Text style={styles.desc}>
                          {meals[mealKey].description}
                        </Text>
                      </View>

                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>
                          ₹{meals[mealKey].price}
                        </Text>
                      </View>
                    </View>
                    {idx < 2 && <View style={styles.divider} />}
                  </React.Fragment>
                ),
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
function createStyles(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    heading: {
      fontSize: 26,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 14,
      textAlign: 'center',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    card: {
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      borderRadius: 14,
      padding: 18,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    day: {
      fontSize: 22,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 10,
      color: isDark ? Colors.dark.heading : Colors.light.heading,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 6,
    },
    label: {
      fontFamily: 'Poppins_600SemiBold',
      fontSize: 16,
      marginBottom: 2,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    desc: {
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: isDark ? Colors.dark.mealDescription : Colors.light.mealDescription,
    },
    priceContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      minWidth: 80,
    },
    price: {
      fontSize: 16,
      fontFamily: 'OpenSans_400Regular',
      color: isDark ? Colors.dark.mealPrice : Colors.light.mealPrice,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? Colors.dark.divider : Colors.light.divider,
      marginVertical: 8,
    },
    image: {
      width: 45,
      height: 50,
      borderRadius: 10,
    },
  });
}
