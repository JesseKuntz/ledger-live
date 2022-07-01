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
    ? `\n    Storage Usage Balance: ${nearResources.storageUsageBalance}`
    : "";

  if (nearResources.stakingPositions.length) {
    str += `\n    Staking Positions:\n`;
    str += nearResources.stakingPositions
      .map(
        ({ validatorId, staked, pending, available }) =>
          `        Validator ID: ${validatorId} | Staked: ${staked} | Pending Release: ${pending} | Available: ${available}`
      )
      .join("\n");
  }

  return str;
}

export default {
  formatAccountSpecifics,
};
