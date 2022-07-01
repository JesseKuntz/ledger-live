import type { BigNumber } from "bignumber.js";
import {
  Account,
  AccountRaw,
  TransactionCommon,
  TransactionCommonRaw,
} from "@ledgerhq/types-live";
import type { NearStakingPosition } from "./api/sdk.types";

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
  stakingPositions: NearStakingPosition[];
};

export type NearResourcesRaw = {
  stakedBalance: string;
  storageUsageBalance: string;
  stakingPositions: {
    staked: string;
    available: string;
    pending: string;
    validatorId: string;
  }[];
};

export type NearAccount = Account & { nearResources: NearResources };

export type NearAccountRaw = AccountRaw & {
  nearResources: NearResourcesRaw;
};
