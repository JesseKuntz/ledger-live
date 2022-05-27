import { BigNumber } from "bignumber.js";
import { getCurrentNearPreloadData } from "./preload";
import { getGasPrice } from "./api";
import { isImplicitAccount } from "./logic";

const getEstimatedFees = async (address: string): Promise<BigNumber> => {
  const rawGasPrice = await getGasPrice();
  const gasPrice = new BigNumber(rawGasPrice);

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

  if (isImplicitAccount(address)) {
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
