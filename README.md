# base-trade-rate

The wiring that turns a city's trade into its player's trade-rate yields, for a ruleset to wrap in its own `Added`,
`Yield`, `Action` and `TurnStart` rules with its own numbers:

- `lib/playerTradeRates`: `addPlayerTradeRates(player, defaultRates, …)` gives a player one of each available
  `TradeRate`, in the order they're available, each at the value of the first default it is an instance of (0 when
  there is none), and registers them.
- `lib/splitTrade`: `splitTrade(TradeYield, round, …)`, a city `Yield` effect that splits the city's trade (never below
  0) between its player's rates in rate order, `round`ing each share and capping it by what is left.
- `lib/adjustTradeRates`: `adjustTradeRates(…)`, a player `Action` effect offering `AdjustTradeRates` for the player's
  own rates.
- `lib/processTradeRateYields`: `processTradeRateYields(cache, …)`, a player `TurnStart` effect that consolidates each
  city's trade-rate yields into one of each type and runs the `ProcessYield` rules on them. The caller owns the cache
  array, and so how long it lives.

A library: it registers no rules. See `civ1-trade-rate` for Civilization's defaults and rounding.
