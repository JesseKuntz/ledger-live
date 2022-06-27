import { BigNumber } from "bignumber.js";
import { getCurrentNearPreloadData } from "./preload";
import { getGasPrice } from "./api";
import { isImplicitAccount, getStakingGas } from "./logic";
import { Transaction } from "./types";

const getEstimatedFees = async (
  transaction: Transaction
): Promise<BigNumber> => {
  const rawGasPrice = await getGasPrice();
  const gasPrice = new BigNumber(rawGasPrice);

  if (transaction.mode === "stake") {
    // TODO: figure out why it needs to be divided by 10
    return getStakingGas().multipliedBy(gasPrice).dividedBy(10);
  }

  const {
    createAccountCostSend,
    createAccountCostExecution,
    transferCostSend,
    transferCostExecution,
    addKeyCostSend,
    addKeyCostExecution,
    receiptCreationSend,
    receiptCreationExecution,
  } = getCurrentNearPreloadData();

  let sendFee = transferCostSend.plus(receiptCreationSend);
  let executionFee = transferCostExecution.plus(receiptCreationExecution);

  if (isImplicitAccount(transaction.recipient)) {
    sendFee = sendFee.plus(createAccountCostSend).plus(addKeyCostSend);
    executionFee = executionFee
      .plus(createAccountCostExecution)
      .plus(addKeyCostExecution);
  }

  const fees = sendFee
    .multipliedBy(gasPrice)
    .plus(executionFee.multipliedBy(gasPrice));

  return fees;
};

export default getEstimatedFees;
