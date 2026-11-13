import { AvailableTradeRateRegistry } from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import { PlayerTradeRatesRegistry } from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import City from '@civ-clone/core-city/City';
import Yield from '@civ-clone/core-yield/Yield';
/** How a rate's share of the trade is made a whole number, `Math.ceil` for example. */
export type Rounding = (share: number) => number;
/**
 * A city `Yield` rule's effect that splits the city's `TradeYield` (never below 0) between its player's trade rates:
 * one yield of each rate's `tradeYield`, in the order the rates are available, labelled with the rate's name. Each
 * share is `round`ed in that order and capped by what the earlier rates have left, so the rates never take more than
 * the trade there is.
 */
export declare const splitTrade: (
  TradeYield: typeof Yield,
  round: Rounding,
  availableTradeRateRegistry?: AvailableTradeRateRegistry,
  playerTradeRatesRegistry?: PlayerTradeRatesRegistry
) => (city: City, yields: Yield[]) => Yield[];
export default splitTrade;
