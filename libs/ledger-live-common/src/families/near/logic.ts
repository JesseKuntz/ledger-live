import { BigNumber } from "bignumber.js";
import type { Account } from "../../types";
import { Transaction } from "./types";

export const FALLBACK_STORAGE_AMOUNT_PER_BYTE = "10000000000000000000";
export const NEW_ACCOUNT_SIZE = 182;
export const MIN_ACCOUNT_BALANCE_BUFFER = "1000000000000000000";
export const STAKING_GAS_BASE = "25000000000000";

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

export const getStakingGas = (t?: Transaction): BigNumber => {
  const stakingGasBase = new BigNumber(STAKING_GAS_BASE);
  let multiplier = 5;

  if (t?.mode === "withdraw" && t?.useAllAmount) {
    multiplier = 7;
  }

  return stakingGasBase.multipliedBy(multiplier);
};

export const getMaxAmount = (
  a: Account,
  t: Transaction,
  fees: BigNumber
): BigNumber => {
  let maxAmount;

  switch (t.mode) {
    case "unstake":
      maxAmount = a.nearResources?.stakingPositions.find(
        ({ validatorId }) => validatorId === t.recipient
      )?.amount;
      break;
    default:
      maxAmount = a.spendableBalance.minus(fees);
  }

  return maxAmount;
};

export const getTotalSpent = (
  a: Account,
  t: Transaction,
  fees: BigNumber
): BigNumber => {
  if (t.mode === "unstake") {
    return fees;
  }

  if (t.useAllAmount) {
    return a.spendableBalance;
  }

  return new BigNumber(t.amount).plus(fees);
};
