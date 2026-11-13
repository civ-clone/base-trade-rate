import {
  PlayerTradeRatesRegistry,
  instance as playerTradeRatesRegistryInstance,
} from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import AdjustTradeRates from '@civ-clone/base-player-action-adjust-trade-rates/AdjustTradeRates';
import Player from '@civ-clone/core-player/Player';
import PlayerAction from '@civ-clone/core-player/PlayerAction';

/** A player `Action` rule's effect: the player may adjust their own trade rates. */
export const adjustTradeRates =
  (
    playerTradeRatesRegistry: PlayerTradeRatesRegistry = playerTradeRatesRegistryInstance
  ): ((player: Player) => PlayerAction[]) =>
  (player: Player): PlayerAction[] =>
    [
      new AdjustTradeRates(
        player,
        playerTradeRatesRegistry.getByPlayer(player)
      ),
    ];

export default adjustTradeRates;
