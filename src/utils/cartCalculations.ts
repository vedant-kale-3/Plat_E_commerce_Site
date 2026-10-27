export const FREE_SHIPPING_THRESHOLD = 60;
export const STANDARD_SHIPPING_FEE = 8.95;
export const TAX_RATE = 0.08;

export const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  remainingForFreeShipping: number;
}

export const calculateCartTotals = (
  items: Array<{ price: number; quantity: number }>
): CartTotals => {
  const rawSubtotal = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
    const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
    return sum + price * quantity;
  }, 0);

  const subtotal = roundToTwoDecimals(rawSubtotal);
  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const tax = roundToTwoDecimals(subtotal * TAX_RATE);
  const total = roundToTwoDecimals(subtotal + shipping + tax);
  const remainingForFreeShipping = roundToTwoDecimals(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal));

  return {
    subtotal,
    shipping,
    tax,
    total,
    remainingForFreeShipping,
  };
};
