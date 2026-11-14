import {
  AvailableTradeRateRegistry,
  instance as availableTradeRateRegistryInstance,
} from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import {
  PlayerTradeRatesRegistry,
  instance as playerTradeRatesRegistryInstance,
} from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import City from '@civ-clone/core-city/City';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import TradeRate from '@civ-clone/core-trade-rate/TradeRate';
import Yield from '@civ-clone/core-yield/Yield';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

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
export const splitTrade =
  (
    TradeYield: typeof Yield,
    round: Rounding,
    availableTradeRateRegistry: AvailableTradeRateRegistry = availableTradeRateRegistryInstance,
    playerTradeRatesRegistry: PlayerTradeRatesRegistry = playerTradeRatesRegistryInstance,
    { share, lastTakesRemainder = false }: SplitTradeOptions = {}
  ): ((city: City, yields: Yield[]) => Yield[]) =>
  (city: City, yields: Yield[]): Yield[] => {
    const playerRates = playerTradeRatesRegistry.getByPlayer(city.player()),
      total = Math.max(0, reduceYield(yields, TradeYield));

    let remaining = total;

    const tradeRates = availableTradeRateRegistry.entries();

    return tradeRates.map(
      (TradeRateType: IConstructor<TradeRate>, index: number): Yield => {
        const RateYield = (TradeRateType as typeof TradeRate).tradeYield,
          percent = playerRates.get(TradeRateType as typeof TradeRate).value(),
          value =
            lastTakesRemainder && index === tradeRates.length - 1
              ? remaining
              : Math.min(
                  share
                    ? share(total, percent)
                    : round(total * (percent / 100)),
                  remaining
                );

        remaining -= value;

        return new RateYield(value, TradeRateType.name);
      }
    );
  };

export default splitTrade;
