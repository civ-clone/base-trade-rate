import { AvailableTradeRateRegistry } from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import { PlayerTradeRatesRegistry } from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Player from '@civ-clone/core-player/Player';
import TradeRate from '@civ-clone/core-trade-rate/TradeRate';
/**
 * Gives `player` one of each available trade rate, in the order they're available, and registers them. A rate starts
 * at the value of the first of `defaultRates` it is an instance of, and at 0 when none is.
 *
 * Given the game's `ruleRegistry`, the player's rates ask that registry's `MaxRate` and `ExcessRate` rules; without it,
 * `PlayerTradeRates` uses its own default.
 */
export declare const addPlayerTradeRates: (
  player: Player,
  defaultRates: TradeRate[],
  availableTradeRateRegistry?: AvailableTradeRateRegistry,
  playerTradeRatesRegistry?: PlayerTradeRatesRegistry,
  ruleRegistry?: RuleRegistry
) => void;
export default addPlayerTradeRates;
