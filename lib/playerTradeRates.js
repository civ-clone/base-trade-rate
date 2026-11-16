"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPlayerTradeRates = void 0;
const AvailableTradeRateRegistry_1 = require("@civ-clone/core-trade-rate/AvailableTradeRateRegistry");
const PlayerTradeRatesRegistry_1 = require("@civ-clone/core-trade-rate/PlayerTradeRatesRegistry");
const PlayerTradeRates_1 = require("@civ-clone/core-trade-rate/PlayerTradeRates");
/**
 * Gives `player` one of each available trade rate, in the order they're available, and registers them. A rate starts
 * at the value of the first of `defaultRates` it is an instance of, and at 0 when none is.
 *
 * Given the game's `ruleRegistry`, the player's rates ask that registry's `MaxRate` and `ExcessRate` rules; without it,
 * `PlayerTradeRates` uses its own default.
 */
const addPlayerTradeRates = (player, defaultRates, availableTradeRateRegistry = AvailableTradeRateRegistry_1.instance, playerTradeRatesRegistry = PlayerTradeRatesRegistry_1.instance, ruleRegistry) => {
    const availableRates = availableTradeRateRegistry.entries(), playerTradeRates = new PlayerTradeRates_1.default(player, ...availableRates.map((TradeRateType) => {
        const [defaultRate] = defaultRates.filter((rate) => rate instanceof TradeRateType);
        return new TradeRateType(defaultRate || 0);
    }), ...(ruleRegistry === undefined ? [] : [ruleRegistry]));
    playerTradeRatesRegistry.register(playerTradeRates);
};
exports.addPlayerTradeRates = addPlayerTradeRates;
exports.default = exports.addPlayerTradeRates;
//# sourceMappingURL=playerTradeRates.js.map