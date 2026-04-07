export type Currency = "ILS" | "USD" | "EUR" | "GBP";

export type SpendingPersona =
  | "comfort_spender"
  | "experience_seeker"
  | "steady_saver"
  | "spontaneous_spender";

export type User = {
  id: string;
  email: string;
  name: string | null;
  currency: Currency;
  persona: SpendingPersona | null;
  createdAt: Date;
};
