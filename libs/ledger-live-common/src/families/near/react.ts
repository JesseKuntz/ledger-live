import invariant from "invariant";
import { useMemo } from "react";
import { BigNumber } from "bignumber.js";
import { FIGMENT_NEAR_VALIDATOR_ADDRESS, mapStakingPositions } from "./logic";
import {
  NearValidatorItem,
  Transaction,
  NearMappedStakingPosition,
} from "./types";
import { getCurrentNearPreloadData } from "./preload";
import type { Account } from "../../types";
import { getAccountUnit } from "../../account";

function useNearMappedStakingPositions(
  account: Account
): NearMappedStakingPosition[] {
  const { validators } = getCurrentNearPreloadData();
  const stakingPositions = account.nearResources?.stakingPositions;

  invariant(stakingPositions, "near: stakingPositions is required");

  const unit = getAccountUnit(account);

  return useMemo(() => {
    const mappedStakingPositions = mapStakingPositions(
      stakingPositions || [],
      validators,
      unit
    );
    return mappedStakingPositions;
  }, [stakingPositions, validators, unit]);
}

export function useNearStakingPositionsQuerySelector(
  account: Account,
  transaction: Transaction
): {
  options: NearMappedStakingPosition[];
  value: NearMappedStakingPosition | undefined;
} {
  const stakingPositions = useNearMappedStakingPositions(account);
  const options = useMemo<NearMappedStakingPosition[]>(
    () => stakingPositions.filter((sp) => sp.staked.gt(0)),
    [stakingPositions]
  );

  const selectedValidatorAddress = transaction.recipient;

  const value = useMemo(
    () =>
      stakingPositions.find(
        ({ validatorId }) => validatorId === selectedValidatorAddress
      ),
    [stakingPositions, selectedValidatorAddress]
  );

  return {
    options,
    value,
  };
}

export function useLedgerFirstShuffledValidatorsNear() {
  const { validators } = getCurrentNearPreloadData();

  return useMemo(() => {
    return reorderValidators(validators);
  }, [validators]);
}

function reorderValidators(
  validators: NearValidatorItem[]
): NearValidatorItem[] {
  const sortedValidators = validators.sort((a, b) =>
    new BigNumber(b.tokens).minus(new BigNumber(a.tokens)).toNumber()
  );

  // move Ledger validator to the first position
  const ledgerValidator = sortedValidators.find(
    (v) => v.validatorAddress === FIGMENT_NEAR_VALIDATOR_ADDRESS
  );

  if (ledgerValidator) {
    const sortedValidatorsLedgerFirst = sortedValidators.filter(
      (v) => v.validatorAddress !== FIGMENT_NEAR_VALIDATOR_ADDRESS
    );
    sortedValidatorsLedgerFirst.unshift(ledgerValidator);

    return sortedValidatorsLedgerFirst;
  }

  return sortedValidators;
}
