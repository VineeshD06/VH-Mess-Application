// utils/initMenu.ts

export type MealKey = 'breakfast' | 'lunch' | 'dinner';

export interface DayMeal {
  description: string;
  price: number;
}

export const dummyMenu: Record<string, Record<MealKey, DayMeal>> = {
  Monday: {
    breakfast: {
      description: "Idli with coconut chutney and sambar.",
      price: 40,
    },
    lunch: {
      description: "Rice with rasam, curry, and curd.",
      price: 70,
    },
    dinner: {
      description: "Chapati with veg kurma.",
      price: 60,
    },
  },
  Tuesday: {
    breakfast: {
      description: "Poha with lemon and peanuts.",
      price: 35,
    },
    lunch: {
      description: "Rajma rice and salad.",
      price: 75,
    },
    dinner: {
      description: "Paratha with curd and pickle.",
      price: 65,
    },
  },
  Wednesday: {
    breakfast: {
      description: "Aloo paratha with butter.",
      price: 45,
    },
    lunch: {
      description: "Paneer curry with naan.",
      price: 80,
    },
    dinner: {
      description: "Tomato rice with chips.",
      price: 60,
    },
  },
  Thursday: {
    breakfast: {
      description: "Uttapam with sambar and chutney.",
      price: 40,
    },
    lunch: {
      description: "Dal fry with jeera rice.",
      price: 70,
    },
    dinner: {
      description: "Veg biryani with raita.",
      price: 75,
    },
  },
  Friday: {
    breakfast: {
      description: "Bread butter and boiled egg.",
      price: 35,
    },
    lunch: {
      description: "Chole bhature and salad.",
      price: 80,
    },
    dinner: {
      description: "Dosa with potato masala.",
      price: 60,
    },
  },
  Saturday: {
    breakfast: {
      description: "Cornflakes with milk.",
      price: 30,
    },
    lunch: {
      description: "Mixed veg with rice and papad.",
      price: 70,
    },
    dinner: {
      description: "Pulao with veg curry.",
      price: 65,
    },
  },
  Sunday: {
    breakfast: {
      description: "Pancakes with honey and banana.",
      price: 50,
    },
    lunch: {
      description: "Special thali with curries, rice, dessert.",
      price: 90,
    },
    dinner: {
      description: "Chinese noodles and spring roll.",
      price: 85,
    },
  },
};
