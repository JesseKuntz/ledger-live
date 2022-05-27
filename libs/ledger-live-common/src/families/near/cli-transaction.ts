import invariant from "invariant";
import flatMap from "lodash/flatMap";

import type { Transaction, AccountLike } from "../../types";

const options = [
  {
    name: "mode",
    type: String,
    desc: "mode of transaction: send",
  },
];

function inferTransactions(
  transactions: Array<{
    account: AccountLike;
    transaction: Transaction;
  }>,
  opts: Record<string, string>
): Transaction[] {
  return flatMap(transactions, ({ transaction }) => {
    invariant(transaction.family === "near", "near family");

    return {
      ...transaction,
      family: "near",
      mode: opts.mode || "send",
    } as Transaction;
  });
}

export default {
  options,
  inferTransactions,
};
