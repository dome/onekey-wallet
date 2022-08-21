import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { merge } from 'lodash';

import type { Token } from '@onekeyhq/engine/src/types/token';

export type TokenBalanceValue = string | undefined;
export type TokenChartData = [number, number][];

export type PriceLoading = undefined;
export type NoPriceData = null;
export type TokenPrices = Record<TokenId, string | PriceLoading | NoPriceData>;
export type NetworkId = string;
export type AccountId = string;
export type TokenId = string;
export type AccountTokensBalance = Record<TokenId, TokenBalanceValue>;

export type NetworkTokensBalance = Record<AccountId, AccountTokensBalance>;
export type NetworkCharts = Record<TokenId, TokenChartData>;

export type TokenInitialState = {
  tokens: Record<NetworkId, Token[]>;
  tokensPrice: Record<NetworkId, TokenPrices>;
  charts: Record<NetworkId, NetworkCharts>;
  accountTokens: Record<NetworkId, Record<AccountId, Token[]>>;
  accountTokensBalance: Record<NetworkId, NetworkTokensBalance>;
};

const initialState: TokenInitialState = {
  tokens: {},
  tokensPrice: {},
  accountTokens: {},
  accountTokensBalance: {},
  charts: {},
} as const;

type TokenPayloadAction = {
  accountId?: string | null;
  networkId?: string | null;
  tokens: Token[];
};

type PricePayloadAction = {
  networkId?: string | null;
  prices: TokenPrices;
};

type ChartPayloadAction = {
  networkId?: string | null;
  charts: Record<string, TokenChartData>;
};

type TokenBalancePayloadAction = {
  accountId?: string | null;
  networkId?: string | null;
  tokensBalance: Record<string, string | undefined>;
};

export const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<TokenPayloadAction>) {
      const { networkId, tokens } = action.payload;
      if (!networkId) {
        return;
      }
      state.tokens[networkId] = tokens;
    },
    setCharts(state, action: PayloadAction<ChartPayloadAction>) {
      const { networkId, charts } = action.payload;
      if (!networkId) {
        return;
      }
      state.charts = state.charts || {};
      const oldCharts = state.charts[networkId] || {};
      state.charts[networkId] = { ...oldCharts, ...charts };
    },
    setPrices(state, action: PayloadAction<PricePayloadAction>) {
      const { networkId, prices } = action.payload;
      if (!networkId) {
        return;
      }
      const oldPrices = state.tokensPrice[networkId] || {};
      state.tokensPrice[networkId] = { ...oldPrices, ...prices };
    },
    setAccountTokens(state, action: PayloadAction<TokenPayloadAction>) {
      const { accountId, networkId, tokens } = action.payload;
      if (!accountId || !networkId) {
        return;
      }
      if (!state.accountTokens[networkId]) {
        state.accountTokens[networkId] = {};
      }
      state.accountTokens[networkId][accountId] = tokens;
    },
    addAccountTokens(state, action: PayloadAction<TokenPayloadAction>) {
      const { accountId, networkId, tokens } = action.payload;
      if (!accountId || !networkId) {
        return;
      }
      if (!state.accountTokens[networkId]) {
        state.accountTokens[networkId] = {};
      }
      const mergedTokens = tokens.concat(
        state.accountTokens[networkId][accountId] || [],
      );
      const tokenIds: string[] = [];
      const dedupedTokens = mergedTokens.filter((token) => {
        if (tokenIds.includes(token.tokenIdOnNetwork)) {
          return false;
        }
        tokenIds.push(token.tokenIdOnNetwork);
        return true;
      });
      state.accountTokens[networkId][accountId] = dedupedTokens;
    },
    setAccountTokensBalances(
      state,
      action: PayloadAction<TokenBalancePayloadAction>,
    ) {
      const { accountId, networkId, tokensBalance } = action.payload;
      if (!accountId || !networkId) {
        return;
      }
      if (!state.accountTokensBalance[networkId]) {
        state.accountTokensBalance[networkId] = {};
      }
      const oldTokensBalance =
        state.accountTokensBalance[networkId][accountId] || {};
      // native token balance defaults to 0
      oldTokensBalance.main = oldTokensBalance.main ?? '0';

      // use merge() to ignore undefined field updating in tokensBalance
      state.accountTokensBalance[networkId][accountId] = merge(
        {},
        oldTokensBalance,
        tokensBalance,
      );
    },
  },
});

export const {
  setTokens,
  setPrices,
  setCharts,
  setAccountTokens,
  setAccountTokensBalances,
  addAccountTokens,
} = tokensSlice.actions;
export default tokensSlice.reducer;
