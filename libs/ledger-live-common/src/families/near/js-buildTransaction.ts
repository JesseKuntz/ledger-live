import * as nearAPI from "near-api-js";
import { Transaction as NearApiTransaction } from "near-api-js/lib/transaction";
import type { Account } from "../../types";
import { formatCurrencyUnit, getCryptoCurrencyById } from "../../currencies";
import type { Transaction } from "./types";
import { getAccessKey } from "./api";

export const buildTransaction = async (
  a: Account,
  t: Transaction,
  publicKey: string
): Promise<NearApiTransaction> => {
  const { nonce, block_hash } = await getAccessKey({
    address: a.freshAddress,
    publicKey,
  });

  const currency = getCryptoCurrencyById("near");
  const formattedAmount = formatCurrencyUnit(currency.units[0], t.amount, {
    disableRounding: true,
  });
  const parsedNearAmount =
    nearAPI.utils.format.parseNearAmount(formattedAmount);

  const transaction = nearAPI.transactions.createTransaction(
    a.freshAddress,
    nearAPI.utils.PublicKey.fromString(publicKey),
    t.recipient,
    nonce + 1,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [nearAPI.transactions.transfer(parsedNearAmount)],
    nearAPI.utils.serialize.base_decode(block_hash)
  );

  return transaction;
};
