import { BigNumber } from "bignumber.js";
import { formatCurrencyUnit } from "../../currencies";
import type { Account, Unit } from "../../types";
import {
  NearMappedStakingPosition,
  Transaction,
  NearStakingPosition,
  NearValidatorItem,
} from "./types";

export const FALLBACK_STORAGE_AMOUNT_PER_BYTE = "10000000000000000000";
export const NEW_ACCOUNT_SIZE = 182;
export const MIN_ACCOUNT_BALANCE_BUFFER = "1000000000000000000";
export const STAKING_GAS_BASE = "25000000000000";
export const FIGMENT_NEAR_VALIDATOR_ADDRESS = "figment.poolv1.near";

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

export const getStakingGas = (t?: Transaction, multiplier = 5): BigNumber => {
  const stakingGasBase = new BigNumber(STAKING_GAS_BASE);

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
  const selectedValidator = a.nearResources?.stakingPositions.find(
    ({ validatorId }) => validatorId === t.recipient
  );

  switch (t.mode) {
    case "unstake":
      maxAmount = selectedValidator?.staked;
      break;
    case "withdraw":
      maxAmount = selectedValidator?.available;
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
  if (["unstake", "withdraw"].includes(t.mode)) {
    return fees;
  }

  if (t.useAllAmount) {
    return a.spendableBalance;
  }

  return new BigNumber(t.amount).plus(fees);
};

export const mapStakingPositions = (
  stakingPositions: NearStakingPosition[],
  validators: NearValidatorItem[],
  unit: Unit
): NearMappedStakingPosition[] => {
  return stakingPositions.map((sp) => {
    const rank = validators.findIndex(
      (v) => v.validatorAddress === sp.validatorId
    );
    const validator = validators[rank] ?? sp;
    return {
      ...sp,
      formattedAmount: formatCurrencyUnit(unit, sp.staked, {
        disableRounding: false,
        alwaysShowSign: false,
        showCode: true,
      }),
      rank,
      validator,
    };
  });
};
