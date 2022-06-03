import type { BigNumber } from "bignumber.js";
import type {
  TransactionCommon,
  TransactionCommonRaw,
} from "../../types/transaction";
import { Account, AccountRaw } from "@ledgerhq/types-live";

export type Transaction = TransactionCommon & {
  family: "near";
  mode: string;
  fees?: BigNumber;
};

export type TransactionRaw = TransactionCommonRaw & {
  family: "near";
  mode: string;
  fees?: string;
};

export type NearPreloadedData = {
  storageCost: BigNumber;
  createAccountCostSend: BigNumber;
  createAccountCostExecution: BigNumber;
  transferCostSend: BigNumber;
  transferCostExecution: BigNumber;
  addKeyCostSend: BigNumber;
  addKeyCostExecution: BigNumber;
  receiptCreationSend: BigNumber;
  receiptCreationExecution: BigNumber;
};

export type NearResources = {
  stakedBalance: BigNumber;
  storageUsageBalance: BigNumber;
};

export type NearResourcesRaw = {
  stakedBalance: string;
  storageUsageBalance: string;
};

export type NearAccount = Account & { nearResources: NearResources };

export type NearAccountRaw = AccountRaw & {
  nearResources: NearResourcesRaw;
};
