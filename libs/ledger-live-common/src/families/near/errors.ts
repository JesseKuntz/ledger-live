import { createCustomErrorClass } from "@ledgerhq/errors";

/*
 * When the recipient is a new account.
 */
export const NearNewAccountWarning = createCustomErrorClass(
  "NearNewAccountWarning"
);

/*
 * When the recipient is a new named account, and needs to be created first.
 */
export const NearNewNamedAccountError = createCustomErrorClass(
  "NearNewNamedAccountError"
);

/*
 * When the recipient is a new account, and the amount doesn't cover the activation fee.
 */
export const NearActivationFeeNotCovered = createCustomErrorClass(
  "NearActivationFeeNotCovered"
);

/*
 * When the protocol config can not be loaded.
 */
export const NearProtocolConfigNotLoaded = createCustomErrorClass(
  "NearProtocolConfigNotLoaded"
);
