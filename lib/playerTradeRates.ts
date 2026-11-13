import {
  AvailableTradeRateRegistry,
  instance as availableTradeRateRegistryInstance,
} from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import {
  PlayerTradeRatesRegistry,
  instance as playerTradeRatesRegistryInstance,
} from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Player from '@civ-clone/core-player/Player';
import PlayerTradeRates from '@civ-clone/core-trade-rate/PlayerTradeRates';
import TradeRate from '@civ-clone/core-trade-rate/TradeRate';

/**
 * Gives `player` one of each available trade rate, in the order they're available, and registers them. A rate starts
 * at the value of the first of `defaultRates` it is an instance of, and at 0 when none is.
 */
export const addPlayerTradeRates = (
  player: Player,
  defaultRates: TradeRate[],
  availableTradeRateRegistry: AvailableTradeRateRegistry = availableTradeRateRegistryInstance,
  playerTradeRatesRegistry: PlayerTradeRatesRegistry = playerTradeRatesRegistryInstance
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
      )
    );

  playerTradeRatesRegistry.register(playerTradeRates);
};

export default addPlayerTradeRates;
