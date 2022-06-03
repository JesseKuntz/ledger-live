import type { Account } from "../../types";

function formatAccountSpecifics(account: Account): string {
  const { nearResources } = account;
  if (!nearResources) {
    throw new Error("near account expected");
  }

  let str = " ";

  str += nearResources.stakedBalance
    ? `\n    Staked Balance: ${nearResources.stakedBalance}`
    : "";
  str += nearResources.storageUsageBalance
    ? `\n    Staked Balance: ${nearResources.storageUsageBalance}`
    : "";

  return str;
}

export default {
  formatAccountSpecifics,
};
