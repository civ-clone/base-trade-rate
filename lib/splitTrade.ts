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
 * A city `Yield` rule's effect that splits the city's `TradeYield` (never below 0) between its player's trade rates:
 * one yield of each rate's `tradeYield`, in the order the rates are available, labelled with the rate's name. Each
 * share is `round`ed in that order and capped by what the earlier rates have left, so the rates never take more than
 * the trade there is.
 */
export const splitTrade =
  (
    TradeYield: typeof Yield,
    round: Rounding,
    availableTradeRateRegistry: AvailableTradeRateRegistry = availableTradeRateRegistryInstance,
    playerTradeRatesRegistry: PlayerTradeRatesRegistry = playerTradeRatesRegistryInstance
  ): ((city: City, yields: Yield[]) => Yield[]) =>
  (city: City, yields: Yield[]): Yield[] => {
    const playerRates = playerTradeRatesRegistry.getByPlayer(city.player()),
      total = Math.max(0, reduceYield(yields, TradeYield));

    let remaining = total;

    return availableTradeRateRegistry
      .entries()
      .map((TradeRateType: IConstructor<TradeRate>): Yield => {
        const RateYield = (TradeRateType as typeof TradeRate).tradeYield,
          value = Math.min(
            round(
              total *
                (playerRates.get(TradeRateType as typeof TradeRate).value() /
                  100)
            ),
            remaining
          );

        remaining -= value;

        return new RateYield(value, TradeRateType.name);
      });
  };

export default splitTrade;
