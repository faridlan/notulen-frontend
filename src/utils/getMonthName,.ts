export default function getMonthName(month: number) {
  return new Date(2000, month - 1).toLocaleString("en-US", {
    month: "long",
  });
}
