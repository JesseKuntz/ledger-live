import type { DeviceTransactionField } from "../../transaction";
import type { Transaction } from "./types";

function getDeviceTransactionConfig({
  transaction,
}: {
  transaction: Transaction;
}): Array<DeviceTransactionField> {
  const fields: Array<DeviceTransactionField> = [];

  if (transaction.mode === "send") {
    fields.push({
      type: "text",
      label: "Method",
      value: "Transfer",
    });
  }

  fields.push({
    type: "amount",
    label: "Amount",
  });

  return fields;
}

export default getDeviceTransactionConfig;
