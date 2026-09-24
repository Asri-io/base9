export const CURRENCY_SYMBOL = "₦";
export const CURRENCY_CODE = "NGN";

export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
