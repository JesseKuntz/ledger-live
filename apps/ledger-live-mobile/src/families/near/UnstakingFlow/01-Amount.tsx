import invariant from "invariant";
import React from "react";
import { useSelector } from "react-redux";
import { BigNumber } from "bignumber.js";
import type { NearMappedStakingPosition } from "@ledgerhq/live-common/families/near/types";
import { getAccountBridge } from "@ledgerhq/live-common/bridge/index";
import { getMainAccount } from "@ledgerhq/live-common/account/index";
import useBridgeTransaction from "@ledgerhq/live-common/bridge/useBridgeTransaction";
import { accountScreenSelector } from "../../../reducers/accounts";
import SelectAmount from "../shared/02-SelectAmount";
import { ScreenName } from "../../../const";

type RouteParams = {
  accountId: string;
  stakingPosition: NearMappedStakingPosition;
};
type Props = {
  navigation: any;
  route: {
    params: RouteParams;
  };
};

function UnstakingAmount({ navigation, route }: Props) {
  const { account } = useSelector(accountScreenSelector(route));
  invariant(account, "account required");
  const bridge = getAccountBridge(account, undefined);
  const mainAccount = getMainAccount(account, undefined);
  const { validator, staked } = route.params.stakingPosition;
  const { transaction } = useBridgeTransaction(() => {
    const t = bridge.createTransaction(mainAccount);
    return {
      account,
      transaction: bridge.updateTransaction(t, {
        mode: "unstake",
        recipient: validator ? validator.validatorAddress : "",
      }),
    };
  });
  const newRoute = {
    ...route,
    params: {
      ...route.params,
      transaction,
      validator,
      max: staked,
      value: transaction ? transaction.amount : new BigNumber(0),
      nextScreen: ScreenName.NearUnstakingSelectDevice,
    },
  };
  return <SelectAmount navigation={navigation} route={newRoute} />;
}

export default UnstakingAmount;
