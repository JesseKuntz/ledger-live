import { BigNumber } from "bignumber.js";
import type { NearResources, NearResourcesRaw } from "./types";

export function toNearResourcesRaw(r: NearResources): NearResourcesRaw {
  const { stakedBalance, storageUsageBalance, stakingPositions } = r;
  return {
    stakedBalance: stakedBalance.toString(),
    storageUsageBalance: storageUsageBalance.toString(),
    stakingPositions: stakingPositions.map(({ amount, validatorId }) => ({
      amount: amount.toString(),
      validatorId,
    })),
  };
}

export function fromNearResourcesRaw(r: NearResourcesRaw): NearResources {
  const { stakedBalance, storageUsageBalance, stakingPositions } = r;
  return {
    stakedBalance: new BigNumber(stakedBalance),
    storageUsageBalance: new BigNumber(storageUsageBalance),
    stakingPositions: stakingPositions.map(({ amount, validatorId }) => ({
      amount: new BigNumber(amount),
      validatorId,
    })),
  };
}
