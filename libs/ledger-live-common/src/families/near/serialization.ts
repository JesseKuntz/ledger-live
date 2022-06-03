import { BigNumber } from "bignumber.js";
import type { NearResources, NearResourcesRaw } from "./types";

export function toNearResourcesRaw(r: NearResources): NearResourcesRaw {
  const { stakedBalance, storageUsageBalance } = r;
  return {
    stakedBalance: stakedBalance.toString(),
    storageUsageBalance: storageUsageBalance.toString(),
  };
}

export function fromNearResourcesRaw(r: NearResourcesRaw): NearResources {
  const { stakedBalance, storageUsageBalance } = r;
  return {
    stakedBalance: new BigNumber(stakedBalance),
    storageUsageBalance: new BigNumber(storageUsageBalance),
  };
}
