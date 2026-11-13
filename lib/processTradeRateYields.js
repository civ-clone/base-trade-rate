"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTradeRateYields = void 0;
const AvailableTradeRateRegistry_1 = require("@civ-clone/core-trade-rate/AvailableTradeRateRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
/**
 * A player `TurnStart` rule's effect: for each of the player's cities, adds up its yields of each trade rate's
 * `tradeYield` into one yield of each type (in the order the rates are available, labelled `Consolidated`) and runs
 * the `ProcessYield` rules on each.
 *
 * `cachedTradeRateYields` holds those yield types. It is filled on the first call while it's empty and kept after
 * that, so the caller decides how long it lives (and which games share it) by where it keeps the array.
 */
const processTradeRateYields = (cachedTradeRateYields, ruleRegistry = RuleRegistry_1.instance, cityRegistry = CityRegistry_1.instance, availableTradeRateRegistry = AvailableTradeRateRegistry_1.instance) => (player) => {
    if (cachedTradeRateYields.length === 0) {
        availableTradeRateRegistry
            .entries()
            .forEach((TradeRateType) => cachedTradeRateYields.push(TradeRateType.tradeYield));
    }
    cityRegistry.getByPlayer(player).forEach((city) => {
        const cityYields = city.yields();
        (0, reduceYields_1.reduceYields)(cityYields, ...cachedTradeRateYields)
            .reduce((yields, yieldValue, index) => {
            yields[index].set(yieldValue, 'Consolidated');
            return yields;
        }, cachedTradeRateYields.map((YieldType) => new YieldType()))
            .forEach((cityYield) => ruleRegistry.process(ProcessYield_1.default, cityYield, city, cityYields));
    });
};
exports.processTradeRateYields = processTradeRateYields;
exports.default = exports.processTradeRateYields;
//# sourceMappingURL=processTradeRateYields.js.map