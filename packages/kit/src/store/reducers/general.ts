import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type GeneralInitialState = {
  activeAccountId: string | null;
  activeWalletId: string | null;
  activeNetworkId: string | null;
  displayNetworkId?: string | null | 'allevm' | 'all';
};

const initialState: GeneralInitialState = {
  activeAccountId: null,
  activeNetworkId: null,
  activeWalletId: null,
  displayNetworkId: null,
} as const;

export const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setActiveIds(
      state,
      action: PayloadAction<
        Pick<
          GeneralInitialState,
          'activeAccountId' | 'activeNetworkId' | 'activeWalletId'
        >
      >,
    ) {
      const { activeAccountId, activeNetworkId, activeWalletId } =
        action.payload;
      state.activeAccountId = activeAccountId;
      state.activeWalletId = activeWalletId;
      state.activeNetworkId = activeNetworkId;
    },
    changeActiveAccount(
      state,
      action: PayloadAction<
        Pick<GeneralInitialState, 'activeAccountId' | 'activeWalletId'>
      >,
    ) {
      const { activeAccountId, activeWalletId } = action.payload;
      state.activeAccountId = activeAccountId;
      state.activeWalletId = activeWalletId;
    },
    changeActiveNetwork(
      state,
      action: PayloadAction<
        NonNullable<GeneralInitialState['activeNetworkId']>
      >,
    ) {
      state.activeNetworkId = action.payload;
    },
    changeDisplayNetwork(
      state,
      action: PayloadAction<
        NonNullable<GeneralInitialState['displayNetworkId']>
      >,
    ) {
      state.displayNetworkId = action.payload;
    },
  },
});

export const {
  changeActiveAccount,
  changeActiveNetwork,
  setActiveIds,
  changeDisplayNetwork,
} = generalSlice.actions;

export default generalSlice.reducer;
