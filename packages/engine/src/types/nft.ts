import { OnekeyNetwork } from '../presets/networkIds';

export const NFTChainMap: Record<string, string> = {
  [OnekeyNetwork.eth]: 'eth',
  [OnekeyNetwork.optimism]: 'optimism',
  [OnekeyNetwork.bsc]: 'bsc',
  [OnekeyNetwork.polygon]: 'polygon',
  [OnekeyNetwork.arbitrum]: 'arbitrum',
  [OnekeyNetwork.sol]: 'sol',
  [OnekeyNetwork.jfin]: 'jfin',
  [OnekeyNetwork.bitkub]: 'bitkub',
};

export const NFTSymbolMap: Record<string, string> = {
  [OnekeyNetwork.eth]: 'main',
  [OnekeyNetwork.optimism]: 'main',
  [OnekeyNetwork.bsc]: 'main',
  [OnekeyNetwork.polygon]: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // weth
  [OnekeyNetwork.arbitrum]: 'main',
  [OnekeyNetwork.sol]: 'main',
  [OnekeyNetwork.jfin]: 'main',
  [OnekeyNetwork.bitkub]: 'main',
};

export type ERCType = 'erc721' | 'erc1155';
export type Traits = {
  traitType: string;
  value: string;
};

export type Collection = {
  contractAddress?: string;
  contractName?: string;
  description?: string;
  logoUrl?: string;
  ownsTotal?: string;
  floorPrice?: number;
  priceSymbol?: string;
  assets: NFTAsset[];
  totalPrice: number;
  collectionId?: string;
};

export type NFTAsset = {
  tokenAddress?: string; // sol
  contractAddress?: string; // evm
  contractTokenId?: string;
  tokenId?: string; // evm
  contractName?: string;
  ercType?: string;
  amount?: string;
  owner: string;
  tokenUri: string | null;
  contentType: string | null;
  contentUri: string | null;
  imageUri: string | null;
  nftscanUri: string | null;
  name?: string;
  description?: string;
  attributes?: Traits[];
  mintPrice?: number;
  latestTradePrice?: number;
  latestTradeSymbol?: string;
  collection: {
    contractName?: string;
    logoUrl?: string;
    floorPrice?: number;
  };
  image: {
    source: string;
    thumbnail: string;
  };
};

export type NFTScanNFTsResp = {
  success?: boolean;
  data: Collection[];
};

export type NFTGetAssetResp = {
  success?: boolean;
  data?: NFTAsset;
};

export type NFTTransaction = {
  hash: string;
  from: string;
  to: string;
  blockNumber?: string;
  blockHash?: string;
  gasPrice?: string;
  timestamp?: string;
  contractAddress?: string;
  contractName?: string;
  tokenId?: string;
  ercType?: string;
  send: string;
  receive: string;
  amount?: string;
  tradeValue?: string;
  tradePrice?: string;
  tradeSymbol?: string;
  eventType?: string;
  exchangeName?: string;
  asset?: NFTAsset;
  collectionId?: string;
  // sol
  tokenAddress?: string;
};

export type TransactionsResp = {
  success?: boolean;
  data: NFTTransaction[];
};
