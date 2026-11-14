import { AvailableTradeRateRegistry } from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import { PlayerTradeRatesRegistry } from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import City from '@civ-clone/core-city/City';
import Yield from '@civ-clone/core-yield/Yield';
/** How a rate's share of the trade is made a whole number, `Math.ceil` for example. */
export type Rounding = (share: number) => number;
/**
 * How a rate's share is worked out from the whole `total` and the rate's `percent`, as a whole number, for a ruleset
 * whose rounding can't be written as a function of the fractional share (integer arithmetic, say).
 */
export type Share = (total: number, percent: number) => number;
export type SplitTradeOptions = {
  /** Replaces `round(total × percent / 100)` for each rate. */
  share?: Share;
  /** The last rate takes whatever the earlier rates leave, rather than its own share. */
  lastTakesRemainder?: boolean;
};
/**
 * A city `Yield` rule's effect that splits the city's `TradeYield` (never below 0) between its player's trade rates:
 * one yield of each rate's `tradeYield`, in the order the rates are available, labelled with the rate's name. Each
 * share is `round`ed in that order and capped by what the earlier rates have left, so the rates never take more than
 * the trade there is.
 *
 * `options` change the arithmetic for a ruleset that splits differently: `share` works out each share instead of
 * `round`, and with `lastTakesRemainder` the last rate gets whatever is left. Without them, the split is as above.
 */
export declare const splitTrade: (
  TradeYield: typeof Yield,
  round: Rounding,
  availableTradeRateRegistry?: AvailableTradeRateRegistry,
  playerTradeRatesRegistry?: PlayerTradeRatesRegistry,
  { share, lastTakesRemainder }?: SplitTradeOptions
) => (city: City, yields: Yield[]) => Yield[];
export default splitTrade;
