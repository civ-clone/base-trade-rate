import {
  AvailableTradeRateRegistry,
  instance as availableTradeRateRegistryInstance,
} from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Player from '@civ-clone/core-player/Player';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import TradeRate from '@civ-clone/core-trade-rate/TradeRate';
import Yield from '@civ-clone/core-yield/Yield';
import { reduceYields } from '@civ-clone/core-yield/lib/reduceYields';

/**
 * A player `TurnStart` rule's effect: for each of the player's cities, adds up its yields of each trade rate's
 * `tradeYield` into one yield of each type (in the order the rates are available, labelled `Consolidated`) and runs
 * the `ProcessYield` rules on each.
 *
 * `cachedTradeRateYields` holds those yield types. It is filled on the first call while it's empty and kept after
 * that, so the caller decides how long it lives (and which games share it) by where it keeps the array.
 */
export const processTradeRateYields =
  (
    cachedTradeRateYields: (typeof Yield)[],
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    cityRegistry: CityRegistry = cityRegistryInstance,
    availableTradeRateRegistry: AvailableTradeRateRegistry = availableTradeRateRegistryInstance
  ): ((player: Player) => void) =>
  (player: Player): void => {
    if (cachedTradeRateYields.length === 0) {
      availableTradeRateRegistry
        .entries()
        .forEach((TradeRateType: IConstructor<TradeRate>): number =>
          cachedTradeRateYields.push(
            (TradeRateType as typeof TradeRate).tradeYield
          )
        );
    }

    cityRegistry.getByPlayer(player).forEach((city: City): void => {
      const cityYields = city.yields();

      reduceYields(cityYields, ...cachedTradeRateYields)
        .reduce(
          (yields: Yield[], yieldValue, index) => {
            yields[index].set(yieldValue, 'Consolidated');

            return yields;
          },
          cachedTradeRateYields.map(
            (YieldType: typeof Yield) => new YieldType()
          )
        )
        .forEach((cityYield: Yield) =>
          ruleRegistry.process(ProcessYield, cityYield, city, cityYields)
        );
    });
  };

export default processTradeRateYields;
