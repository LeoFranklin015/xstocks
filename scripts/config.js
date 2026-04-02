// Ethereum Sepolia network config and deployed contract addresses
export const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
export const CHAIN_ID = 11155111;
export const EXPLORER = "https://sepolia.etherscan.io";

// Deployed protocol contracts (real Pyth -- deployed 2026-04-02)
export const CONTRACTS = {
  pythAdapter: "0xE8Ff98C8A488cD61b203cF9f4B677C4B331C44E1",
  vault:       "0xa9cd11D375349f820d29eFC39C9DFeB6D1178862",
  exchange:    "0xE90c95bD55d54A57005cCd503aF5ADB6267F39c0",
  keeper:      "0xfc4F01dc870f3EaC95B9583Ae1255f7de62ad79e",
  usdc:        "0x38Aa3BDC4BDEa71C78518d8f651C107Cb0444Ddb",
};

// xStock tokens with their px/dx addresses and real Pyth feed IDs.
// SLV and TBLL are excluded from deployment (no live Pyth feeds).
// Prices are approximate market values at last market close (expo -2 notation).
export const TOKENS = {
  AAPLx: {
    xStock: "0xbE102BB350f600f2AA3f131a9FF9F80CaC5c8947",
    px:     "0x6775b4b106c05A0b96AEc0c8387C31F608Cdaba4",
    dx:     "0xCa51fC331797954283e4353141C6fad0e5839220",
    feedId: "0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
    price:  25551, // ~$255.51
  },
  NVDAx: {
    xStock: "0xC1455128Ffb20c9d8A7A95eD73bcC10BFAdb4a7c",
    px:     "0x9476b1e00b92008D9c49f9D27306c0f5bb440791",
    dx:     "0x34add2BD348A76bFEDAeDb088232CE21436D7E9E",
    feedId: "0xb1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593",
    price:  17574, // ~$175.74
  },
  TSLAx: {
    xStock: "0xDB2D0c5403D761a9aa37Ae7c0fa7F7F63f398e14",
    px:     "0x6caee253a2de08b19C0A7a43Ecb7E60a6a792574",
    dx:     "0x44938207C51866E669FAa09599bc2552Be5c9024",
    feedId: "0x16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1",
    price:  38124, // ~$381.24
  },
  SPYx: {
    xStock: "0x89E679ED73b6e8793EF960412343b08F93aC6f8F",
    px:     "0x4Ac9567D9b6391Da38Ba9E97E67137d3655F8625",
    dx:     "0x6f4937729ffb684568b9fA2d0A5dBD00c9543F68",
    feedId: "0x19e09bb805456ada3979a7d1cbb4b6d63babc3a0f8e8a9509f68afa5c4c11cd5",
    price:  65502, // ~$655.02
  },
  GOOGLx: {
    xStock: "0x8d88Bb68E5242F2b3E0f217a904c661Bb8427297",
    px:     "0x4fc424429E585008143E22C0E8B0716579494DF7",
    dx:     "0x3157605A05381d9339E52f2A796dD68a312075d5",
    feedId: "0x5a48c03e9b9cb337801073ed9d166817473697efff0d138874e0f6a33d6d5aa6",
    price:  29729, // ~$297.29
  },
  GLDx: {
    xStock: "0xC18288E58B79fAac72811dC1456515A88147e85a",
    px:     "0x7B9A52066888232D07759cc2dce27841235008E2",
    dx:     "0x86856d05df024A60DE21876797C2DfAE2c8426EE",
    feedId: "0xe190f467043db04548200354889dfe0d9d314c08b8d4e62fabf4d5a3140fecca",
    price:  43763, // ~$437.63
  },
  // SLV: feed returns price=0 / publish_time=0 (inactive) -- not deployed
  SLVx: {
    xStock: "0x0000000000000000000000000000000000000000",
    px:     "0x0000000000000000000000000000000000000000",
    dx:     "0x0000000000000000000000000000000000000000",
    feedId: "0x6fc08c9963d266069cbd9780d98383dabf2668322a5bef0b9491e11d67e5d7e7",
    price:  0,
  },
  // TBLL: no real Pyth feed -- not deployed
  TBLLx: {
    xStock: "0x0000000000000000000000000000000000000000",
    px:     "0x0000000000000000000000000000000000000000",
    dx:     "0x0000000000000000000000000000000000000000",
    feedId: "0x0000000000000000000000000000000000000000000000000000000000000000",
    price:  0,
  },
  // DEMOx aliases AAPLx for dividend / liquidation / recombine flows
  DEMOx: {
    xStock: "0xbE102BB350f600f2AA3f131a9FF9F80CaC5c8947",
    px:     "0x6775b4b106c05A0b96AEc0c8387C31F608Cdaba4",
    dx:     "0xCa51fC331797954283e4353141C6fad0e5839220",
    feedId: "0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
    price:  25551,
  },
};
