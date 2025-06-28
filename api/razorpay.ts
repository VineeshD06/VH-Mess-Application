import Constants from 'expo-constants';

const BASE_URL = Constants?.manifest?.extra?.BASE_URL ??
                 process.env.BASE_URL;       // fallback for web/eas-build

export interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
}

export async function createOrder(amountPaise: number) {
  const res = await fetch(`${BASE_URL}/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountPaise }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Order API failed (${res.status}): ${text}`);
  }

  return (await res.json()) as OrderResponse;
}
