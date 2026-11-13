"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitTrade = void 0;
const AvailableTradeRateRegistry_1 = require("@civ-clone/core-trade-rate/AvailableTradeRateRegistry");
const PlayerTradeRatesRegistry_1 = require("@civ-clone/core-trade-rate/PlayerTradeRatesRegistry");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
/**
 * A city `Yield` rule's effect that splits the city's `TradeYield` (never below 0) between its player's trade rates:
 * one yield of each rate's `tradeYield`, in the order the rates are available, labelled with the rate's name. Each
 * share is `round`ed in that order and capped by what the earlier rates have left, so the rates never take more than
 * the trade there is.
 */
const splitTrade = (TradeYield, round, availableTradeRateRegistry = AvailableTradeRateRegistry_1.instance, playerTradeRatesRegistry = PlayerTradeRatesRegistry_1.instance) => (city, yields) => {
    const playerRates = playerTradeRatesRegistry.getByPlayer(city.player()), total = Math.max(0, (0, reduceYields_1.reduceYield)(yields, TradeYield));
    let remaining = total;
    return availableTradeRateRegistry
        .entries()
        .map((TradeRateType) => {
        const RateYield = TradeRateType.tradeYield, value = Math.min(round(total *
            (playerRates.get(TradeRateType).value() /
                100)), remaining);
        remaining -= value;
        return new RateYield(value, TradeRateType.name);
    });
};
exports.splitTrade = splitTrade;
exports.default = exports.splitTrade;
//# sourceMappingURL=splitTrade.js.map