import { BigNumber } from "bignumber.js";
import network from "../../../network";
import { getEnv } from "../../../env";
import { encodeOperationId } from "../../../operation";
import { Account, Operation, OperationType } from "../../../types";
import { NearTransaction, NearAccount } from "./sdk.types";
import { getCurrentNearPreloadData } from "../preload";
import { MIN_ACCOUNT_BALANCE_BUFFER } from "../logic";

const DEFAULT_TRANSACTIONS_LIMIT = 100;
const getIndexerUrl = (route: string): string =>
  `${getEnv("API_NEAR_INDEXER")}${route || ""}`;

export const fetchAccountDetails = async (
  address: string
): Promise<NearAccount> => {
  const { data } = await network({
    method: "GET",
    url: getIndexerUrl(`/accounts/${address}`),
  });

  return data;
};

const fetchTransactions = async (
  address: string,
  limit: number = DEFAULT_TRANSACTIONS_LIMIT
): Promise<NearTransaction[]> => {
  const route = `/transactions?limit=${limit}&account=${address}`;

  const { data } = await network({
    method: "GET",
    url: getIndexerUrl(route),
  });

  return data?.records || [];
};

export const getAccount = async (
  address: string
): Promise<Partial<Account>> => {
  let accountDetails;

  try {
    accountDetails = await fetchAccountDetails(address);
  } catch (e: any) {
    if (e.status === 404) {
      accountDetails = {
        amount: "0",
        block_height: 0,
        storage_usage: 0,
      };
    } else {
      throw e;
    }
  }

  const { storageCost } = getCurrentNearPreloadData();

  const balance = new BigNumber(accountDetails.amount);
  const storageUsage = storageCost.multipliedBy(accountDetails.storage_usage);
  const minBalanceBuffer = new BigNumber(MIN_ACCOUNT_BALANCE_BUFFER);

  let spendableBalance = balance.minus(storageUsage).minus(minBalanceBuffer);

  if (spendableBalance.lt(0)) {
    spendableBalance = new BigNumber(0);
  }

  return {
    blockHeight: accountDetails.block_height,
    balance,
    spendableBalance,
  };
};

function isSender(transaction: NearTransaction, address: string): boolean {
  return transaction.sender === address;
}

function getOperationType(
  transaction: NearTransaction,
  address: string
): OperationType {
  return isSender(transaction, address) ? "OUT" : "IN";
}

function getOperationValue(
  transaction: NearTransaction,
  address: string
): BigNumber {
  const amount = transaction.actions[0].data.deposit || 0;

  return isSender(transaction, address)
    ? new BigNumber(amount).plus(transaction.fee)
    : new BigNumber(amount);
}

function transactionToOperation(
  accountId: string,
  address: string,
  transaction: NearTransaction
): Operation {
  const type = getOperationType(transaction, address);

  return {
    id: encodeOperationId(accountId, transaction.hash, type),
    accountId,
    fee: new BigNumber(transaction.fee || 0),
    value: getOperationValue(transaction, address),
    type,
    hash: transaction.hash,
    blockHash: transaction.block_hash,
    blockHeight: transaction.height,
    date: new Date(transaction.time),
    extra: {},
    senders: transaction.sender ? [transaction.sender] : [],
    recipients: transaction.receiver ? [transaction.receiver] : [],
    hasFailed: !transaction.success,
  };
}

export const getOperations = async (
  accountId: string,
  address: string
): Promise<Operation[]> => {
  const rawTransactions = await fetchTransactions(address);

  return rawTransactions.map((transaction) =>
    transactionToOperation(accountId, address, transaction)
  );
};
