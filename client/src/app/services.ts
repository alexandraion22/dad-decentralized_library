import { MsgBroadcaster } from "@injectivelabs/wallet-core";
import { walletStrategy } from "./services/wallet";
import { NETWORK } from "./utils/constants";

export const msgBroadcastClient = new MsgBroadcaster({
  walletStrategy,
  network: NETWORK,
});
