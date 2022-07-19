// @flow
import { getMainAccount } from "@ledgerhq/live-common/lib/account";
import type { Account, AccountLike } from "@ledgerhq/live-common/lib/types";
import invariant from "invariant";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { openModal } from "~/renderer/actions/modals";
import IconCoins from "~/renderer/icons/Coins";

type Props = {
  account: AccountLike,
  parentAccount: ?Account,
};

const AccountHeaderActions = ({ account, parentAccount }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const mainAccount = getMainAccount(account, parentAccount);

  const { nearResources } = mainAccount;
  invariant(nearResources, "near account expected");

  const onClick = useCallback(() => {
    dispatch(
      openModal("MODAL_NEAR_STAKE", {
        account,
      }),
    );
  }, [dispatch, account]);

  if (parentAccount) return null;

  // TODO: add a validation for the account balance + disable stake button if balance is too low
  return [
    {
      key: "stake",
      onClick: onClick,
      icon: IconCoins,
      label: t("account.stake"),
    },
    // TODO: move to the staking info dashboard when ready
    {
      key: "unstake",
      onClick: () => {
        dispatch(
          openModal("MODAL_NEAR_UNSTAKE", {
            account,
            validatorAddress: "figment.poolv1.near",
          }),
        );
      },
      icon: IconCoins,
      label: t("near.unstake.flow.title"),
    },
  ];
};

export default AccountHeaderActions;
