import { useMemo } from "react";
import { BigNumber } from "bignumber.js";
import { FIGMENT_NEAR_VALIDATOR_ADDRESS } from "./logic";
import { NearValidatorItem } from "./types";
import { getCurrentNearPreloadData } from "./preload";

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
