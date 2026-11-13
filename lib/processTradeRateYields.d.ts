import { AvailableTradeRateRegistry } from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Player from '@civ-clone/core-player/Player';
import Yield from '@civ-clone/core-yield/Yield';
/**
 * A player `TurnStart` rule's effect: for each of the player's cities, adds up its yields of each trade rate's
 * `tradeYield` into one yield of each type (in the order the rates are available, labelled `Consolidated`) and runs
 * the `ProcessYield` rules on each.
 *
 * `cachedTradeRateYields` holds those yield types. It is filled on the first call while it's empty and kept after
 * that, so the caller decides how long it lives (and which games share it) by where it keeps the array.
 */
export declare const processTradeRateYields: (
  cachedTradeRateYields: (typeof Yield)[],
  ruleRegistry?: RuleRegistry,
  cityRegistry?: CityRegistry,
  availableTradeRateRegistry?: AvailableTradeRateRegistry
) => (player: Player) => void;
export default processTradeRateYields;
