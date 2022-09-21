/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
import { web3Errors } from '@onekeyfe/cross-inpage-provider-errors';
import {
  IInjectedProviderNames,
  IJsBridgeMessagePayload,
} from '@onekeyfe/cross-inpage-provider-types';
import { BCS, TxnBuilderTypes, bytesToHex, hexToBytes } from 'aptos';

import { IMPL_APTOS } from '@onekeyhq/engine/src/constants';
import { IEncodedTxAptos } from '@onekeyhq/engine/src/vaults/impl/apt/types';
import { transactionPayloadToTxPayload } from '@onekeyhq/engine/src/vaults/impl/apt/utils';
import VaultAptos from '@onekeyhq/engine/src/vaults/impl/apt/Vault';

import { getActiveWalletAccount } from '../../hooks/redux';
import {
  backgroundClass,
  permissionRequired,
  providerApiMethod,
} from '../decorators';

import ProviderApiBase, {
  IProviderBaseBackgroundNotifyInfo,
} from './ProviderApiBase';

@backgroundClass()
class ProviderApiAptos extends ProviderApiBase {
  public providerName = IInjectedProviderNames.aptos;

  public notifyDappAccountsChanged(info: IProviderBaseBackgroundNotifyInfo) {
    const data = async ({ origin }: { origin: string }) => {
      const params = await this.account();
      const result = {
        method: 'wallet_events_accountsChanged',
        params,
      };
      return result;
    };
    info.send(data);
  }

  public notifyDappChainChanged(info: IProviderBaseBackgroundNotifyInfo) {
    const data = async () => {
      const params = await this.network();
      const result = {
        // TODO do not emit events to EVM Dapps, injected provider check scope
        method: 'wallet_events_chainChanged',
        params,
      };
      return result;
    };
    info.send(data);
  }

  public rpcCall() {
    throw web3Errors.rpc.methodNotSupported();
  }

  @providerApiMethod()
  public async getRpcUrl() {
    const { networkId } = getActiveWalletAccount();
    const network = await this.backgroundApi.engine.getNetwork(networkId);
    return network.rpcURL;
  }

  @providerApiMethod()
  public async connect(request: IJsBridgeMessagePayload) {
    const account = await this.account();
    if (!account) return null;
    return this.backgroundApi.serviceDapp
      .openConnectionModal(request)
      .then(() => account);
  }

  @providerApiMethod()
  public async account(): Promise<
    | {
        publicKey: string;
        address: string;
      }
    | undefined
  > {
    const { networkId, networkImpl, accountId } = getActiveWalletAccount();
    if (networkImpl !== IMPL_APTOS) {
      return undefined;
    }
    const vault = (await this.backgroundApi.engine.getVault({
      networkId,
      accountId,
    })) as VaultAptos;
    const address = await vault.getAccountAddress();
    const publicKey = await vault._getPublicKey();
    return Promise.resolve({ publicKey, address });
  }

  @providerApiMethod()
  public async network(): Promise<string> {
    const { networkId } = getActiveWalletAccount();
    const network = await this.backgroundApi.engine.getNetwork(networkId);

    return Promise.resolve(network.isTestnet ? 'Testnet' : 'Mainnet');
  }

  @permissionRequired()
  @providerApiMethod()
  public async signAndSubmitTransaction(
    request: IJsBridgeMessagePayload,
    params: IEncodedTxAptos,
  ): Promise<string> {
    const { networkId, accountId } = getActiveWalletAccount();
    const vault = (await this.backgroundApi.engine.getVault({
      networkId,
      accountId,
    })) as VaultAptos;

    const encodeTx = params;

    const result = (await this.backgroundApi.serviceDapp.openSignAndSendModal(
      request,
      { encodedTx: encodeTx },
    )) as string;

    const tx = vault.getTransactionByHash(result);

    return Promise.resolve(JSON.stringify(tx));
  }

  @permissionRequired()
  @providerApiMethod()
  public async martianSignAndSubmitTransaction(
    request: IJsBridgeMessagePayload,
    params: Uint8Array,
  ): Promise<string> {
    const { networkId, accountId } = getActiveWalletAccount();
    const vault = (await this.backgroundApi.engine.getVault({
      networkId,
      accountId,
    })) as VaultAptos;

    const bcsTxn = new Uint8Array(Object.values(params));
    const hexBcsTxn = bytesToHex(bcsTxn);

    const deserializer = new BCS.Deserializer(bcsTxn);
    const rawTxn = TxnBuilderTypes.RawTransaction.deserialize(deserializer);

    const payload = await transactionPayloadToTxPayload(
      await vault.getClient(),
      // @ts-expect-error
      rawTxn.payload.value,
    );

    const encodeTx = {
      sender: rawTxn?.sender,
      sequence_number: rawTxn?.sequence_number,
      max_gas_amount: rawTxn?.max_gas_amount,
      gas_unit_price: rawTxn?.gas_unit_price,
      expiration_timestamp_secs: rawTxn?.expiration_timestamp_secs,
      chain_id: rawTxn?.chain_id,

      bscTxn: hexBcsTxn,

      ...payload,
      // todo: codes
    };

    const result = (await this.backgroundApi.serviceDapp.openSignAndSendModal(
      request,
      { encodedTx: encodeTx },
    )) as string;

    const tx = vault.getTransactionByHash(result);

    return Promise.resolve(JSON.stringify(tx));
  }

  @permissionRequired()
  @providerApiMethod()
  public martianSignTransaction() {
    throw web3Errors.rpc.methodNotFound();
  }

  @permissionRequired()
  @providerApiMethod()
  public signTransaction() {
    throw web3Errors.rpc.methodNotFound();
  }

  @permissionRequired()
  @providerApiMethod()
  public signMessage() {
    throw web3Errors.rpc.methodNotFound();
  }
}

export default ProviderApiAptos;
