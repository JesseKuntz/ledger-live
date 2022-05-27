import network from "../../../network";
import { getEnv } from "../../../env";
import { NearAccessKey, NearProtocolConfig } from "./sdk.types";

export const getProtocolConfig = async (): Promise<NearProtocolConfig> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "EXPERIMENTAL_protocol_config",
      params: {
        finality: "final",
      },
    },
  });

  return data.result;
};

export const getGasPrice = async (): Promise<string> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "gas_price",
      params: [null],
    },
  });

  return data?.result?.gas_price;
};

export const getAccessKey = async ({
  address,
  publicKey,
}: {
  address: string;
  publicKey: string;
}): Promise<NearAccessKey> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "query",
      params: {
        request_type: "view_access_key",
        finality: "final",
        account_id: address,
        public_key: publicKey,
      },
    },
  });

  return data.result || {};
};

export const broadcastTransaction = async (
  transaction: string
): Promise<string> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "broadcast_tx_async",
      params: [transaction],
    },
  });

  return data.result;
};
