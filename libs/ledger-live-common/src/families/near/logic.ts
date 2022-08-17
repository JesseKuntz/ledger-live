import { BigNumber } from "bignumber.js";
import { utils } from "near-api-js";
import { formatCurrencyUnit } from "../../currencies";
import type { Account, Unit } from "../../types";
import {
  NearMappedStakingPosition,
  Transaction,
  NearStakingPosition,
  NearValidatorItem,
} from "./types";
import { createTransaction, updateTransaction } from "./js-transaction";
import { getCurrentNearPreloadData } from "./preload";

export const FALLBACK_STORAGE_AMOUNT_PER_BYTE = "10000000000000000000";
export const NEW_ACCOUNT_SIZE = 182;
export const MIN_ACCOUNT_BALANCE_BUFFER = "30000000000000000000000";
export const STAKING_GAS_BASE = "25000000000000";
export const FIGMENT_NEAR_VALIDATOR_ADDRESS = "figment.poolv1.near";
export const FRACTIONAL_DIGITS = 5;

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
    const formatConfig = {
      disableRounding: false,
      alwaysShowSign: false,
      showCode: true,
    };

    return {
      ...sp,
      formattedAmount: formatCurrencyUnit(unit, sp.staked, formatConfig),
      formattedRewards: formatCurrencyUnit(unit, sp.rewards, formatConfig),
      formattedPending: formatCurrencyUnit(unit, sp.pending, formatConfig),
      formattedAvailable: formatCurrencyUnit(unit, sp.available, formatConfig),
      rank,
      validator,
    };
  });
};

/*
 * Make sure that an account has enough funds to stake, unstake, AND withdraw before staking.
 */
export const canStake = (a: Account): boolean => {
  let transaction = createTransaction();
  transaction = updateTransaction(transaction, {
    mode: "stake",
  });

  const { gasPrice } = getCurrentNearPreloadData();

  const fees = getStakingFees(transaction, gasPrice).multipliedBy(3);

  return a.spendableBalance.minus(fees).gt(0);
};

export const canUnstake = (
  stakingPosition: NearMappedStakingPosition | NearStakingPosition
): boolean => {
  return stakingPosition.staked.gte(getYoctoThreshold());
};

export const canWithdraw = (
  stakingPosition: NearMappedStakingPosition | NearStakingPosition
): boolean => {
  return stakingPosition.available.gte(getYoctoThreshold());
};

export const getYoctoThreshold = (): BigNumber => {
  return new BigNumber(10).pow(
    new BigNumber(utils.format.NEAR_NOMINATION_EXP - FRACTIONAL_DIGITS)
  );
};

export const getStakingFees = (
  t: Transaction,
  gasPrice: BigNumber
): BigNumber => {
  const stakingGas = getStakingGas(t);

  // TODO: figure out why it needs to be divided by 10
  return stakingGas
    .plus(STAKING_GAS_BASE) // Buffer
    .multipliedBy(gasPrice)
    .dividedBy(10);
};
