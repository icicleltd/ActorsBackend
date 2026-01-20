export const isValidEnumValue = <T extends readonly string[]>(
  value: unknown,
  allowedValues: T,
): value is T[number] => {
  return typeof value === "string" && allowedValues.includes(value);
};
