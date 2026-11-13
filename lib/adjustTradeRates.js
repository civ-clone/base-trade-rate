"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustTradeRates = void 0;
const PlayerTradeRatesRegistry_1 = require("@civ-clone/core-trade-rate/PlayerTradeRatesRegistry");
const AdjustTradeRates_1 = require("@civ-clone/base-player-action-adjust-trade-rates/AdjustTradeRates");
/** A player `Action` rule's effect: the player may adjust their own trade rates. */
const adjustTradeRates = (playerTradeRatesRegistry = PlayerTradeRatesRegistry_1.instance) => (player) => [
    new AdjustTradeRates_1.default(player, playerTradeRatesRegistry.getByPlayer(player)),
];
exports.adjustTradeRates = adjustTradeRates;
exports.default = exports.adjustTradeRates;
//# sourceMappingURL=adjustTradeRates.js.map