import { PlayerTradeRatesRegistry } from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
/** A player `Action` rule's effect: the player may adjust their own trade rates. */
export declare const adjustTradeRates: (
  playerTradeRatesRegistry?: PlayerTradeRatesRegistry
) => (player: Player) => PlayerAction[];
export default adjustTradeRates;
