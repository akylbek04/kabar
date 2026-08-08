import { isAxiosError } from "axios";

export const getErrorMessage = (
  err: unknown,
  fallback: string
): string => {
  if (isAxiosError(err)) {
    return (err.response?.data as { message?: string })?.message || fallback;
  }
  return fallback;
};
