/* eslint-disable no-restricted-syntax */
import { useCallback, useEffect, useMemo } from 'react';

import { useIsFocused } from '@react-navigation/native';
import { merge } from 'lodash';

import { Token } from '@onekeyhq/engine/src/types/token';

import backgroundApiProxy from '../background/instance/backgroundApiProxy';
import { appSelector } from '../store';
import {
  AccountTokensBalance,
  NetworkCharts,
  NetworkId,
  NetworkTokensBalance,
  TokenId,
  TokenPrices,
} from '../store/reducers/tokens';

import { useActiveWalletAccount } from './redux';
import { useNativeToken } from './useTokens';

// type AccountTokens =
//   | Record<NetworkId, Record<AccountId, Token[]>>
//   | Record<NetworkId, Token[]>
//   | Token[]
//   | undefined;

function isAccountTokensLoading(
  accountTokens: Record<NetworkId, Record<TokenId, Token[]>>,
) {
  // eslint-disable-next-line guard-for-in
  for (const nId in accountTokens) {
    const networkTokens = accountTokens[nId];
    if (networkTokens !== undefined) {
      for (const tId in networkTokens) {
        if (networkTokens?.[tId]?.length) {
          return false;
        }
      }
    }
  }
  return true;
}

export const useManageTokens = ({
  pollingInterval = 0,
  fetchTokensOnMount = false,
}: {
  pollingInterval?: number;
  fetchTokensOnMount?: boolean;
} = {}) => {
  const isFocused = useIsFocused();
  const {
    accountId,
    networkId,
    displayNetworkId = networkId,
  } = useActiveWalletAccount();

  const tokensInfo = appSelector((s) => s.tokens);

  const nativeToken = useNativeToken(networkId, accountId);
  const { accountTokensMap, loading, balances, prices, charts } =
    useMemo(() => {
      let loading = true;
      let accountTokens: Token[] = [];
      let balances: AccountTokensBalance = {};
      let prices: TokenPrices = {};
      let charts: NetworkCharts = {};
      if (displayNetworkId === 'all') {
        // TODO
        // accountTokens = tokensInfo.accountTokens;
        // balances = tokensInfo.accountTokensBalance;
        // prices = tokensInfo.tokensPrice;
        // charts = tokensInfo.charts;
        // loading = isAccountTokensLoading(tokensInfo.accountTokens);
      } else if (displayNetworkId === 'allevm') {
        const evmIds = appSelector((s) => s.runtime.networks)
          .filter((n) => n.impl === 'evm')
          .map((n) => n.id);
        accountTokens = [];
        balances = {};
        prices = {};
        charts = {};
        for (const nId of evmIds) {
          const networkTokens = tokensInfo.accountTokens[nId];
          if (networkTokens) {
            for (const aId in networkTokens) {
              if (networkTokens?.[aId]?.length) {
                loading = false;
                accountTokens.push(...networkTokens[aId]);
                balances = {
                  ...balances,
                  ...tokensInfo.accountTokensBalance[nId]?.[aId],
                };
                prices = {
                  ...prices,
                  ...tokensInfo.tokensPrice[nId],
                };
                charts = {
                  ...charts,
                  ...tokensInfo.charts[nId],
                };
              }
            }
          }
        }
      } else {
        accountTokens = tokensInfo.accountTokens[networkId]?.[accountId];
        balances = tokensInfo.accountTokensBalance[networkId]?.[accountId];
        prices = tokensInfo.tokensPrice[networkId];
        charts = tokensInfo.charts[networkId];
        loading = accountTokens === undefined;
      }

      const accountTokensMap = new Map<string, Token>();
      accountTokens.forEach((token) => {
        if (token.tokenIdOnNetwork) {
          accountTokensMap.set(token.tokenIdOnNetwork, token);
        }
      });
      return { accountTokensMap, loading, balances, prices, charts };
    }, [tokensInfo, networkId, accountId, displayNetworkId]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (pollingInterval && isFocused && accountId && networkId) {
      // TODO may cause circular refresh in UI
      backgroundApiProxy.serviceToken.fetchAccountTokens({
        accountId,
        networkId: displayNetworkId,
        withBalance: true,
        withPrice: true,
      });
      timer = setInterval(() => {
        backgroundApiProxy.serviceToken.fetchAccountTokens({
          accountId,
          networkId: displayNetworkId,
          withBalance: true,
          withPrice: true,
        });
      }, pollingInterval);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isFocused, pollingInterval, accountId, networkId, displayNetworkId]);

  useEffect(() => {
    if (fetchTokensOnMount && accountId && networkId) {
      // TODO may cause circular refresh in UI
      backgroundApiProxy.serviceToken.fetchAccountTokens({
        accountId,
        networkId,
        withBalance: true,
        withPrice: true,
      });
    }
    // eslint-disable-next-line
  }, []);

  const getTokenBalance = useCallback(
    (
      options: {
        token?: Token | null;
        defaultValue?: string;
        tokenIdOnNetwork?: string;
      } = {},
    ): string => {
      const { token, defaultValue, tokenIdOnNetwork } = merge(
        {
          token: null,
          defaultValue: '',
          tokenIdOnNetwork: '',
        },
        options ?? {},
      );
      const tokenInfo = token as Token | null;
      const key = tokenIdOnNetwork || tokenInfo?.tokenIdOnNetwork || 'main';
      const balance = balances?.[key] ?? defaultValue;
      return balance;
    },
    [balances],
  );

  const getTokenPrice = useCallback(
    (options: {
      token?: Token | null;
      defaultValue?: string;
      tokenIdOnNetwork?: string;
    }) => {
      const { token, defaultValue, tokenIdOnNetwork } = merge(
        {
          token: null,
          defaultValue: '',
          tokenIdOnNetwork: '',
        },
        options ?? {},
      );
      const tokenInfo = token as Token | null;
      const key = tokenIdOnNetwork || tokenInfo?.tokenIdOnNetwork || 'main';
      const priceValue = prices?.[key] ?? defaultValue;
      return priceValue;
    },
    [prices],
  );

  return {
    loading,
    nativeToken,
    accountTokens,
    accountTokensMap,
    prices,
    balances,
    charts,
    getTokenBalance,
    getTokenPrice,
  };
};
