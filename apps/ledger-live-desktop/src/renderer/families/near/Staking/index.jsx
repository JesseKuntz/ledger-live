// @flow
import React, { useCallback } from "react";
import invariant from "invariant";
import { useDispatch } from "react-redux";
import { Trans } from "react-i18next";
import styled from "styled-components";
import type { Account } from "@ledgerhq/live-common/types/index";
import { useNearMappedStakingPositions } from "@ledgerhq/live-common/families/near/react";
import { getDefaultExplorerView, getAddressExplorer } from "@ledgerhq/live-common/explorers";

import { urls } from "~/config/urls";
import { openURL } from "~/renderer/linking";
import { openModal } from "~/renderer/actions/modals";
import Text from "~/renderer/components/Text";
import Button from "~/renderer/components/Button";
import Box from "~/renderer/components/Box";
import LinkWithExternalIcon from "~/renderer/components/LinkWithExternalIcon";
import IconChartLine from "~/renderer/icons/ChartLine";
import { Header } from "./Header";
import { Row } from "./Row";

import { FIGMENT_NEAR_VALIDATOR_ADDRESS } from "@ledgerhq/live-common/families/near/logic";
import DelegateIcon from "~/renderer/icons/Delegate";
import TableContainer, { TableHeader } from "~/renderer/components/TableContainer";

type Props = {
  account: Account,
};

const Wrapper = styled(Box).attrs(() => ({
  p: 3,
}))`
  border-radius: 4px;
  justify-content: space-between;
  align-items: center;
`;

const Staking = ({ account }: Props) => {
  const dispatch = useDispatch();

  const { nearResources } = account;
  invariant(nearResources, "near account expected");
  const { stakingPositions } = nearResources;

  const mappedStakingPositions = useNearMappedStakingPositions(account);

  const onStake = useCallback(() => {
    dispatch(
      openModal("MODAL_NEAR_STAKE", {
        account,
      }),
    );
  }, [account, dispatch]);

  const onRedirect = useCallback(
    (validatorAddress: string, modalName: string) => {
      dispatch(
        openModal(modalName, {
          account,
          validatorAddress,
        }),
      );
    },
    [account, dispatch],
  );

  const explorerView = getDefaultExplorerView(account.currency);

  const onExternalLink = useCallback(
    (address: string) => {
      if (address === FIGMENT_NEAR_VALIDATOR_ADDRESS) {
        openURL(urls.ledgerValidator);
      } else {
        const srURL = explorerView && getAddressExplorer(explorerView, address);

        if (srURL) openURL(srURL);
      }
    },
    [explorerView],
  );

  const hasStakingPositions = stakingPositions.length > 0;

  return (
    <>
      <TableContainer mb={6}>
        <TableHeader
          title={<Trans i18nKey="near.stake.table.header" />}
          titleProps={{ "data-e2e": "title_Staking" }}
        >
          {hasStakingPositions ? (
            <Button
              id={"account-stake-button"}
              mr={2}
              color="palette.primary.main"
              small
              onClick={onStake}
            >
              <Box horizontal flow={1} alignItems="center">
                <DelegateIcon size={12} />
                <Box>
                  <Trans i18nKey="near.stake.table.stake" />
                </Box>
              </Box>
            </Button>
          ) : null}
        </TableHeader>
        {hasStakingPositions ? (
          <>
            <Header />
            {mappedStakingPositions.map((delegation, index) => (
              <Row
                key={index}
                account={account}
                delegation={delegation}
                onManageAction={onRedirect}
                onExternalLink={onExternalLink}
              />
            ))}
          </>
        ) : (
          <Wrapper horizontal>
            <Box style={{ maxWidth: "65%" }}>
              <Text ff="Inter|Medium|SemiBold" color="palette.text.shade60" fontSize={4}>
                <Trans
                  i18nKey="near.stake.emptyState.description"
                  values={{ name: account.currency.name }}
                />
              </Text>
              <Box mt={2}>
                <LinkWithExternalIcon
                  label={<Trans i18nKey="near.stake.emptyState.info" />}
                  onClick={() => openURL(urls.ledgerValidator)}
                />
              </Box>
            </Box>
            <Box>
              <Button primary small onClick={onStake}>
                <Box horizontal flow={1} alignItems="center">
                  <IconChartLine size={12} />
                  <Box>
                    <Trans i18nKey="near.stake.emptyState.earnRewards" />
                  </Box>
                </Box>
              </Button>
            </Box>
          </Wrapper>
        )}
      </TableContainer>
    </>
  );
};

const StakingPositions = ({ account }: Props) => {
  if (!account.nearResources) return null;

  return <Staking account={account} />;
};

export default StakingPositions;
