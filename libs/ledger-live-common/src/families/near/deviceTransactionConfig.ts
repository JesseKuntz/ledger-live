import type { DeviceTransactionField } from "../../transaction";

function getDeviceTransactionConfig(): Array<DeviceTransactionField> {
  const fields: Array<DeviceTransactionField> = [];

  fields.push({
    type: "text",
    label: "Method",
    value: "Transfer",
  });
  fields.push({
    type: "amount",
    label: "Amount",
  });

  return fields;
}

export default getDeviceTransactionConfig;
