import {
  AvailableTradeRateRegistry,
  instance as availableTradeRateRegistryInstance,
} from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import {
  PlayerTradeRatesRegistry,
  instance as playerTradeRatesRegistryInstance,
} from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerTradeRates from '@civ-clone/core-trade-rate/PlayerTradeRates';
import TradeRate from '@civ-clone/core-trade-rate/TradeRate';

/**
 * Gives `player` one of each available trade rate, in the order they're available, and registers them. A rate starts
 * at the value of the first of `defaultRates` it is an instance of, and at 0 when none is.
 *
 * Given the game's `ruleRegistry`, the player's rates ask that registry's `MaxRate` and `ExcessRate` rules; without it,
 * `PlayerTradeRates` uses its own default.
 */
export const addPlayerTradeRates = (
  player: Player,
  defaultRates: TradeRate[],
  availableTradeRateRegistry: AvailableTradeRateRegistry = availableTradeRateRegistryInstance,
  playerTradeRatesRegistry: PlayerTradeRatesRegistry = playerTradeRatesRegistryInstance,
  ruleRegistry?: RuleRegistry
): void => {
  const availableRates = availableTradeRateRegistry.entries(),
    playerTradeRates = new PlayerTradeRates(
      player,
      ...availableRates.map(
        (TradeRateType: IConstructor<TradeRate>): TradeRate => {
          const [defaultRate] = defaultRates.filter(
            (rate: TradeRate): boolean => rate instanceof TradeRateType
          );

          return new TradeRateType(defaultRate || 0);
        }
      ),
      ...(ruleRegistry === undefined ? [] : [ruleRegistry])
    );

  playerTradeRatesRegistry.register(playerTradeRates);
};

export default addPlayerTradeRates;
