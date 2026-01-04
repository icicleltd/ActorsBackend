export const sanitizePayload = <T extends Record<string, any>>(
  payload: T
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "")
    )
  ) as Partial<T>;
};

