export type SugarLevel = 0 | 30 | 50 | 70 | 100;
export type IceLevel = 0 | 30 | 50 | 70 | 100;
export type SizeCode = "S" | "M" | "L";

export type Size = {
  code: SizeCode;
  label: string;
  bonusPrice: number;
};

export type SugarOption = {
  label: string;
  value: SugarLevel;
};

export type IceOption = {
  label: string;
  value: IceLevel;
};

export type Topping = {
  code: string;
  name: string;
  price: number;
};

export type ItemOptions = {
  size?: Size;
  sugar: SugarOption;
  ice: IceOption;
  toppings: Topping[];
  note?: string;
};

export const SIZE_OPTIONS: Size[] = [
    { code: "S", label: "Size S", bonusPrice: 0 },
    { code: "M", label: "Size M", bonusPrice: 5000 },
    { code: "L", label: "Size L", bonusPrice: 10000 },
];

export const TOPPINGS: Topping[] = [
    { code: "PEARL", name: "Trân châu", price: 5000 },
    { code: "PUDDING", name: "Pudding", price: 7000 },
    { code: "JELLY", name: "Thạch", price: 4000 },
];

export const SUGAR_LEVELS: SugarOption[] = [
    { label: "0%", value: 0 },
    { label: "30%", value: 30 },
    { label: "50%", value: 50 },
    { label: "70%", value: 70 },
    { label: "100%", value: 100 },
];

export const ICE_LEVELS: IceOption[] = [
    { label: "0%", value: 0 },
    { label: "30%", value: 30 },
    { label: "50%", value: 50 },
    { label: "70%", value: 70 },
    { label: "100%", value: 100 },
];
