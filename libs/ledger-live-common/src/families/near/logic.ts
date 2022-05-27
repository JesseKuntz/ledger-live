export const FALLBACK_STORAGE_AMOUNT_PER_BYTE = "10000000000000000000";
export const NEW_ACCOUNT_SIZE = 182;
export const MIN_ACCOUNT_BALANCE_BUFFER = "1000000000000000000";

/*
 * Validate a NEAR address.
 */
export const isValidAddress = (address: string): boolean => {
  const readableAddressRegex =
    /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
  const hexAddressRegex = /^[a-f0-9]{64}$/;

  if (isImplicitAccount(address)) {
    return hexAddressRegex.test(address);
  }

  return readableAddressRegex.test(address);
};

export const isImplicitAccount = (address: string): boolean => {
  return !address.includes(".");
};
