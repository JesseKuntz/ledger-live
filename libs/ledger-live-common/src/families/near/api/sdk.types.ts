export type NearAccount = {
  amount: string;
  storage_usage: number;
  block_height: number;
};

export type NearTransaction = {
  sender: string;
  receiver: string;
  hash: string;
  fee: string;
  success: boolean;
  height: number;
  block_hash: string;
  time: string;
  actions: [
    {
      data: {
        deposit: string;
      };
    }
  ];
};

export type NearProtocolConfig = {
  runtime_config: {
    storage_amount_per_byte: string;
    transaction_costs: {
      action_creation_config: {
        add_key_cost: {
          full_access_cost: {
            execution: number;
            send_not_sir: number;
          };
        };
        create_account_cost: {
          execution: number;
          send_not_sir: number;
        };
        transfer_cost: {
          execution: number;
          send_not_sir: number;
        };
      };
      action_receipt_creation_config: {
        execution: number;
        send_not_sir: number;
      };
    };
  };
};

export type NearAccessKey = {
  nonce: number;
  block_hash: string;
};
