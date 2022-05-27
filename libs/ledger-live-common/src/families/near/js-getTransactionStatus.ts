import { BigNumber } from "bignumber.js";
import {
  NotEnoughBalance,
  RecipientRequired,
  InvalidAddress,
  FeeNotLoaded,
  AmountRequired,
  InvalidAddressBecauseDestinationIsAlsoSource,
} from "@ledgerhq/errors";
import type { Account, TransactionStatus } from "../../types";
import { formatCurrencyUnit, getCryptoCurrencyById } from "../../currencies";
import type { Transaction } from "./types";
import { isValidAddress, NEW_ACCOUNT_SIZE, isImplicitAccount } from "./logic";
import { fetchAccountDetails } from "./api";
import { getCurrentNearPreloadData } from "./preload";
import {
  NearNewAccountWarning,
  NearActivationFeeNotCovered,
  NearNewNamedAccountError,
} from "./errors";

const getTransactionStatus = async (
  a: Account,
  t: Transaction
): Promise<TransactionStatus> => {
  const errors: {
    fees?: Error;
    amount?: Error;
    recipient?: Error;
  } = {};
  const warnings: {
    recipient?: Error;
  } = {};
  const useAllAmount = !!t.useAllAmount;

  const { storageCost } = getCurrentNearPreloadData();

  const newAccountStorageCost = storageCost.multipliedBy(NEW_ACCOUNT_SIZE);
  const currency = getCryptoCurrencyById("near");
  const formattedNewAccountStorageCost = formatCurrencyUnit(
    currency.units[0],
    newAccountStorageCost,
    {
      showCode: true,
    }
  );

  let recipientIsNewAccount;
  if (!t.recipient) {
    errors.recipient = new RecipientRequired();
  } else if (!isValidAddress(t.recipient)) {
    errors.recipient = new InvalidAddress();
  } else {
    try {
      await fetchAccountDetails(t.recipient);
    } catch (e: any) {
      if (e.status === 404) {
        recipientIsNewAccount = true;

        if (isImplicitAccount(t.recipient)) {
          warnings.recipient = new NearNewAccountWarning(
            `The recipient account is not created yet. The protocol requires a ${formattedNewAccountStorageCost} transfer to create it.`
          );
        } else {
          errors.recipient = new NearNewNamedAccountError(
            "The recipient account is not created yet. It needs to be created in the NEAR wallet."
          );
        }
      }
    }
  }

  if (a.freshAddress === t.recipient) {
    warnings.recipient = new InvalidAddressBecauseDestinationIsAlsoSource();
  }

  if (!t.fees) {
    errors.fees = new FeeNotLoaded();
  }

  const estimatedFees = t.fees || new BigNumber(0);

  const totalSpent = useAllAmount
    ? a.spendableBalance
    : new BigNumber(t.amount).plus(estimatedFees);

  const amount = useAllAmount
    ? a.spendableBalance.minus(estimatedFees)
    : new BigNumber(t.amount);

  if (
    totalSpent.gt(a.spendableBalance) ||
    a.spendableBalance.lt(estimatedFees)
  ) {
    errors.amount = new NotEnoughBalance();
  } else if (amount.lte(0) && !t.useAllAmount) {
    errors.amount = new AmountRequired();
  } else if (recipientIsNewAccount && amount.lt(newAccountStorageCost)) {
    errors.amount = new NearActivationFeeNotCovered(
      `This amount doesn't cover the ${formattedNewAccountStorageCost} storage cost.`
    );
  }

  return Promise.resolve({
    errors,
    warnings,
    estimatedFees,
    amount,
    totalSpent,
  });
};

export default getTransactionStatus;
