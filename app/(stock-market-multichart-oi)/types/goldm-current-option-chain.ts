export type GoldmCurrentOptionChainDatahcRow = [
  strike: number,
  callOi: number,
  putOi: number,
  changePercent: number,
  callOiChange: number,
  putOiChange: number
];

export type GoldmCurrentOptionChainResponse = {
  datahc: GoldmCurrentOptionChainDatahcRow[];
  atm?: number | null;
  future_price?: number | null;
  spot_price?: number | null;
};
