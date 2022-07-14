import { BigNumber } from "bignumber.js";
import type { NearResources, NearResourcesRaw } from "./types";

export function toNearResourcesRaw(r: NearResources): NearResourcesRaw {
  const { stakedBalance, storageUsageBalance, stakingPositions } = r;
  return {
    stakedBalance: stakedBalance.toString(),
    storageUsageBalance: storageUsageBalance.toString(),
    stakingPositions: stakingPositions.map(
      ({ staked, validatorId, available, pending }) => ({
        staked: staked.toString(),
        available: available.toString(),
        pending: pending.toString(),
        validatorId,
      })
    ),
  };
}

export function fromNearResourcesRaw(r: NearResourcesRaw): NearResources {
  const { stakedBalance, storageUsageBalance, stakingPositions = [] } = r;
  return {
    stakedBalance: new BigNumber(stakedBalance),
    storageUsageBalance: new BigNumber(storageUsageBalance),
    stakingPositions: stakingPositions.map(
      ({ staked, validatorId, available, pending }) => ({
        staked: new BigNumber(staked),
        available: new BigNumber(available),
        pending: new BigNumber(pending),
        validatorId,
      })
    ),
  };
}
