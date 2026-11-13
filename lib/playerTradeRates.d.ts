import { AvailableTradeRateRegistry } from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import { PlayerTradeRatesRegistry } from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import Player from '@civ-clone/core-player/Player';
import TradeRate from '@civ-clone/core-trade-rate/TradeRate';
/**
 * Gives `player` one of each available trade rate, in the order they're available, and registers them. A rate starts
 * at the value of the first of `defaultRates` it is an instance of, and at 0 when none is.
 */
export declare const addPlayerTradeRates: (
  player: Player,
  defaultRates: TradeRate[],
  availableTradeRateRegistry?: AvailableTradeRateRegistry,
  playerTradeRatesRegistry?: PlayerTradeRatesRegistry
) => void;
export default addPlayerTradeRates;
