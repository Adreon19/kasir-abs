export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};
