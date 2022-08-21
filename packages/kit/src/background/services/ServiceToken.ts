import { Token } from '@onekeyhq/engine/src/types/token';
import {
  AppEventBusNames,
  appEventBus,
} from '@onekeyhq/shared/src/eventBus/appEventBus';

import {
  addAccountTokens,
  setAccountTokens,
  setAccountTokensBalances,
  setCharts,
  setPrices,
  setTokens,
} from '../../store/reducers/tokens';
import { backgroundClass, backgroundMethod } from '../decorators';

import ServiceBase, { IServiceBaseProps } from './ServiceBase';

@backgroundClass()
export default class ServiceToken extends ServiceBase {
  constructor(props: IServiceBaseProps) {
    super(props);
    appEventBus.on(
      AppEventBusNames.NetworkChanged,
      this.refreshTokenBalance.bind(this),
    );
  }

  refreshTokenBalance() {
    const { appSelector } = this.backgroundApi;
    const { activeAccountId, activeNetworkId } = appSelector((s) => s.general);
    if (activeAccountId && activeNetworkId) {
      this.fetchTokenBalance({
        accountId: activeAccountId,
        networkId: activeNetworkId,
      });
    }
  }

  @backgroundMethod()
  async fetchTokens({
    accountId,
    networkId,
    withBalance,
    withPrice,
  }: {
    accountId: string;
    networkId: string;
    withBalance?: boolean;
    withPrice?: boolean;
  }) {
    const { engine, dispatch } = this.backgroundApi;
    const networkTokens = await engine.getTopTokensOnNetwork(accountId, 50);
    dispatch(setTokens({ networkId, tokens: networkTokens }));
    const tokenIds = networkTokens.map((token) => token.tokenIdOnNetwork);
    if (withBalance) {
      this.fetchTokenBalance({
        accountId,
        networkId,
        tokenIds,
      });
    }
    if (withPrice) {
      this.fetchPrices({
        networkId,
        accountId,
        tokenIds,
      });
    }
    return networkTokens;
  }

  @backgroundMethod()
  async fetchAccountTokens({
    accountId,
    networkId,
    withBalance,
    withPrice,
    wait,
  }: {
    accountId: string;
    networkId: string;
    withBalance?: boolean;
    withPrice?: boolean;
    wait?: boolean;
  }) {
    const { engine, dispatch } = this.backgroundApi;
    const tokens = await engine.getTokens(networkId, accountId);
    dispatch(setAccountTokens({ accountId, networkId, tokens }));
    const waitPromises: Promise<any>[] = [];
    if (withBalance) {
      waitPromises.push(
        this.fetchTokenBalance({
          accountId,
          networkId,
          tokenIds: tokens.map((token) => token.tokenIdOnNetwork),
        }),
      );
    }
    if (withPrice) {
      waitPromises.push(
        this.fetchPrices({
          networkId,
          accountId,
          tokenIds: tokens.map((token) => token.tokenIdOnNetwork),
        }),
      );
    }
    if (wait) {
      await Promise.all(waitPromises);
    }
    return tokens;
  }

  @backgroundMethod()
  async clearActiveAccountTokenBalance() {
    const { accountId, networkId } = await this.getActiveWalletAccount();
    this.backgroundApi.dispatch(
      setAccountTokensBalances({
        accountId,
        networkId,
        tokensBalance: {},
      }),
    );
  }

  @backgroundMethod()
  async fetchTokenBalance({
    networkId,
    accountId,
    tokenIds,
  }: {
    networkId: string;
    accountId: string;
    tokenIds?: string[];
  }) {
    const { engine, appSelector, dispatch } = this.backgroundApi;
    const { tokens, accountTokens } = appSelector((s) => s.tokens);
    let tokenIdsOnNetwork: string[] = [];
    if (tokenIds) {
      tokenIdsOnNetwork = tokenIds;
    } else {
      const ids1 = tokens[networkId] || [];
      const ids2 = accountTokens[networkId]?.[accountId] || [];
      tokenIdsOnNetwork = ids1.concat(ids2).map((i) => i.tokenIdOnNetwork);
    }
    const [tokensBalance, newTokens] = await engine.getAccountBalance(
      accountId,
      networkId,
      Array.from(new Set(tokenIdsOnNetwork)),
      true,
    );
    if (newTokens?.length) {
      dispatch(
        addAccountTokens({
          accountId,
          networkId,
          tokens: newTokens,
        }),
      );
    }
    dispatch(
      setAccountTokensBalances({
        accountId,
        networkId,
        tokensBalance,
      }),
    );
    return tokensBalance;
  }

  @backgroundMethod()
  async fetchPrices({
    networkId,
    accountId,
    tokenIds,
  }: {
    networkId: string;
    accountId: string;
    tokenIds?: string[];
  }) {
    const { engine, appSelector, dispatch } = this.backgroundApi;
    const { tokens, accountTokens } = appSelector((s) => s.tokens);
    let tokenIdsOnNetwork: string[] = [];
    if (tokenIds) {
      tokenIdsOnNetwork = tokenIds;
    } else {
      const ids1 = tokens[networkId] || [];
      const ids2 = accountTokens[networkId]?.[accountId] || [];
      tokenIdsOnNetwork = ids1.concat(ids2).map((i) => i.tokenIdOnNetwork);
      tokenIdsOnNetwork = Array.from(new Set(tokenIdsOnNetwork));
    }
    const [prices, charts] = await engine.getPricesAndCharts(
      networkId,
      tokenIdsOnNetwork,
    );
    const fullPrices: Record<string, string | null> = {
      main: prices.main?.toFixed(),
    };
    tokenIdsOnNetwork.forEach((id) => {
      if (prices[id] === undefined) {
        // loading finished but no price for this token
        fullPrices[id] = null;
      } else {
        fullPrices[id] = prices[id].toFixed();
      }
    });

    dispatch(
      setPrices({
        networkId,
        prices: fullPrices,
      }),
    );
    dispatch(setCharts({ networkId, charts }));
    return fullPrices;
  }

  @backgroundMethod()
  async addAccountToken(
    networkId: string,
    accountId: string,
    address: string,
    logoURI?: string,
  ): Promise<Token | undefined> {
    const { engine, appSelector } = this.backgroundApi;
    if (!address) {
      return;
    }
    const accountTokens = appSelector((s) => s.tokens.accountTokens);
    const tokens = accountTokens[networkId]?.[accountId] ?? ([] as Token[]);
    const isExists = tokens.filter(
      (item) => item.tokenIdOnNetwork === address,
    )[0];
    if (isExists) {
      return;
    }
    const result = await engine.quickAddToken(
      accountId,
      networkId,
      address,
      logoURI,
    );
    await this.fetchAccountTokens({
      accountId,
      networkId,
    });
    return result;
  }
}
