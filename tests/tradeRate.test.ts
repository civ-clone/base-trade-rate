import AdjustTradeRates from '@civ-clone/base-player-action-adjust-trade-rates/AdjustTradeRates';
import AvailableTradeRateRegistry from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import PlayerTradeRatesRegistry from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TradeRate from '@civ-clone/core-trade-rate/TradeRate';
import Yield from '@civ-clone/core-yield/Yield';
import addPlayerTradeRates from '../lib/playerTradeRates';
import adjustTradeRates from '../lib/adjustTradeRates';
import { expect } from 'chai';
import processTradeRateYields from '../lib/processTradeRateYields';
import splitTrade from '../lib/splitTrade';

class Income extends Yield {}
class Drain extends Income {
  constructor(value: number = 0, provider?: string) {
    super(-value, provider);
  }
}
class First extends Yield {}
class Second extends Yield {}
class Third extends Yield {}
class FirstRate extends TradeRate {
  static tradeYield: typeof Yield = First;
}
class SecondRate extends TradeRate {
  static tradeYield: typeof Yield = Second;
}
class ThirdRate extends TradeRate {
  static tradeYield: typeof Yield = Third;
}

const setUp = (
    defaultRates: () => TradeRate[],
    ...available: (typeof TradeRate)[]
  ): {
    availableTradeRateRegistry: AvailableTradeRateRegistry;
    player: Player;
    playerTradeRatesRegistry: PlayerTradeRatesRegistry;
  } => {
    const availableTradeRateRegistry = new AvailableTradeRateRegistry(),
      playerTradeRatesRegistry = new PlayerTradeRatesRegistry(),
      player = new Player(new RuleRegistry());

    availableTradeRateRegistry.register(...available);

    addPlayerTradeRates(
      player,
      defaultRates(),
      availableTradeRateRegistry,
      playerTradeRatesRegistry
    );

    return { availableTradeRateRegistry, player, playerTradeRatesRegistry };
  },
  rates = (
    playerTradeRatesRegistry: PlayerTradeRatesRegistry,
    player: Player
  ): [string, number][] =>
    playerTradeRatesRegistry
      .getByPlayer(player)
      .all()
      .map((rate): [string, number] => [rate.constructor.name, rate.value()]),
  cityOf = (player: Player, yields: Yield[] = []): City =>
    ({
      player: (): Player => player,
      yields: (): Yield[] => yields,
    } as unknown as City),
  describeYields = (yields: Yield[]): [string, number, string][] =>
    yields.map((tradeYield: Yield): [string, number, string] => [
      tradeYield.constructor.name,
      tradeYield.value(),
      tradeYield.values()[0][1],
    ]);

describe('addPlayerTradeRates', (): void => {
  it('gives the player one of each available rate, in the order available, at its default', (): void => {
    const { player, playerTradeRatesRegistry } = setUp(
      () => [new SecondRate(60), new FirstRate(40)],
      FirstRate,
      ThirdRate,
      SecondRate
    );

    expect(rates(playerTradeRatesRegistry, player)).to.deep.equal([
      ['FirstRate', 40],
      ['ThirdRate', 0],
      ['SecondRate', 60],
    ]);
    expect(playerTradeRatesRegistry.getByPlayer(player).player()).to.equal(
      player
    );
  });

  it('takes the first default a rate is an instance of', (): void => {
    class SubRate extends FirstRate {}

    const { player, playerTradeRatesRegistry } = setUp(
      () => [new FirstRate(30), new SubRate(70)],
      SubRate,
      FirstRate
    );

    expect(rates(playerTradeRatesRegistry, player)).to.deep.equal([
      ['SubRate', 70],
      ['FirstRate', 30],
    ]);
  });

  it('ignores defaults for rates that are not available', (): void => {
    const { player, playerTradeRatesRegistry } = setUp(
      () => [new ThirdRate(100)],
      FirstRate
    );

    expect(rates(playerTradeRatesRegistry, player)).to.deep.equal([
      ['FirstRate', 0],
    ]);
  });
});

describe('splitTrade', (): void => {
  const setUpSplit = (
    values: [number, number, number]
  ): {
    availableTradeRateRegistry: AvailableTradeRateRegistry;
    player: Player;
    playerTradeRatesRegistry: PlayerTradeRatesRegistry;
  } =>
    setUp(
      () => [
        new FirstRate(values[0]),
        new SecondRate(values[1]),
        new ThirdRate(values[2]),
      ],
      FirstRate,
      SecondRate,
      ThirdRate
    );

  it('splits the trade, net of anything that reduces it, in rate order, rounding each share and capping it by what is left', (): void => {
    const { availableTradeRateRegistry, player, playerTradeRatesRegistry } =
      setUpSplit([0, 50, 50]);

    expect(
      describeYields(
        splitTrade(
          Income,
          Math.ceil,
          availableTradeRateRegistry,
          playerTradeRatesRegistry
        )(cityOf(player), [
          new Income(4),
          new First(10),
          new Income(3),
          new Drain(2),
        ])
      )
    ).to.deep.equal([
      ['First', 0, 'FirstRate'],
      ['Second', 3, 'SecondRate'],
      ['Third', 2, 'ThirdRate'],
    ]);
  });

  it('rounds with the function it is given', (): void => {
    const { availableTradeRateRegistry, player, playerTradeRatesRegistry } =
        setUpSplit([30, 30, 40]),
      split = (round: (share: number) => number): number[] =>
        splitTrade(
          Income,
          round,
          availableTradeRateRegistry,
          playerTradeRatesRegistry
        )(cityOf(player), [new Income(11)]).map((tradeYield) =>
          tradeYield.value()
        );

    expect(split(Math.ceil)).to.deep.equal([4, 4, 3]);
    expect(split(Math.floor)).to.deep.equal([3, 3, 4]);
    expect(split(Math.round)).to.deep.equal([3, 3, 4]);
  });

  it('works out each share from the whole, not from what is left', (): void => {
    const { availableTradeRateRegistry, player, playerTradeRatesRegistry } =
      setUpSplit([50, 25, 25]);

    expect(
      splitTrade(
        Income,
        (share: number): number => share,
        availableTradeRateRegistry,
        playerTradeRatesRegistry
      )(cityOf(player), [new Income(8)]).map((tradeYield) => tradeYield.value())
    ).to.deep.equal([4, 2, 2]);
  });

  it('splits nothing from negative trade', (): void => {
    const { availableTradeRateRegistry, player, playerTradeRatesRegistry } =
      setUpSplit([0, 50, 50]);

    expect(
      splitTrade(
        Income,
        Math.ceil,
        availableTradeRateRegistry,
        playerTradeRatesRegistry
      )(cityOf(player), [new Drain(5)]).map((tradeYield) => tradeYield.value())
    ).to.deep.equal([0, 0, 0]);
  });

  it("uses the city's player's rates", (): void => {
    const { availableTradeRateRegistry, playerTradeRatesRegistry } = setUpSplit(
        [0, 50, 50]
      ),
      other = new Player(new RuleRegistry());

    addPlayerTradeRates(
      other,
      [new FirstRate(100)],
      availableTradeRateRegistry,
      playerTradeRatesRegistry
    );

    expect(
      splitTrade(
        Income,
        Math.ceil,
        availableTradeRateRegistry,
        playerTradeRatesRegistry
      )(cityOf(other), [new Income(6)]).map((tradeYield) => tradeYield.value())
    ).to.deep.equal([6, 0, 0]);
  });
});

describe('adjustTradeRates', (): void => {
  it("offers the player one AdjustTradeRates, for the player's own rates", (): void => {
    const { player, playerTradeRatesRegistry } = setUp(
        () => [new FirstRate(100)],
        FirstRate
      ),
      actions = adjustTradeRates(playerTradeRatesRegistry)(player);

    expect(actions).to.have.length(1);
    expect(actions[0]).to.be.instanceOf(AdjustTradeRates);
    expect(actions[0].player()).to.equal(player);
    expect(actions[0].value()).to.equal(
      playerTradeRatesRegistry.getByPlayer(player)
    );
  });
});

describe('processTradeRateYields', (): void => {
  const setUpProcess = (
    cities: City[],
    player: Player,
    availableTradeRateRegistry: AvailableTradeRateRegistry
  ): {
    cityRegistry: CityRegistry;
    processed: [City, string, number, string, Yield[]][];
    ruleRegistry: RuleRegistry;
  } => {
    const ruleRegistry = new RuleRegistry(),
      processed: [City, string, number, string, Yield[]][] = [],
      cityRegistry = {
        getByPlayer: (cityPlayer: Player): City[] =>
          cityPlayer === player ? cities : [],
      } as unknown as CityRegistry;

    ruleRegistry.register(
      new ProcessYield(
        new Effect(
          (processedYield: Yield, city: City, yields: Yield[]): void => {
            processed.push([
              city,
              processedYield.constructor.name,
              processedYield.value(),
              processedYield.values()[0][1],
              yields,
            ]);
          }
        )
      )
    );

    return { cityRegistry, processed, ruleRegistry };
  };

  it("processes one consolidated yield of each rate's type per city, in rate order", (): void => {
    const availableTradeRateRegistry = new AvailableTradeRateRegistry(),
      player = new Player(new RuleRegistry()),
      firstYields = [new Third(2), new First(1), new Income(7), new Third(3)],
      secondYields = [new Second(5)],
      cities = [cityOf(player, firstYields), cityOf(player, secondYields)],
      { cityRegistry, processed, ruleRegistry } = setUpProcess(
        cities,
        player,
        availableTradeRateRegistry
      ),
      cache: (typeof Yield)[] = [];

    availableTradeRateRegistry.register(FirstRate, SecondRate, ThirdRate);

    processTradeRateYields(
      cache,
      ruleRegistry,
      cityRegistry,
      availableTradeRateRegistry
    )(player);

    expect(processed).to.deep.equal([
      [cities[0], 'First', 1, 'Consolidated', firstYields],
      [cities[0], 'Second', 0, 'Consolidated', firstYields],
      [cities[0], 'Third', 5, 'Consolidated', firstYields],
      [cities[1], 'First', 0, 'Consolidated', secondYields],
      [cities[1], 'Second', 5, 'Consolidated', secondYields],
      [cities[1], 'Third', 0, 'Consolidated', secondYields],
    ]);
    expect(cache).to.deep.equal([First, Second, Third]);
  });

  it('fills the cache once and keeps using it', (): void => {
    const availableTradeRateRegistry = new AvailableTradeRateRegistry(),
      player = new Player(new RuleRegistry()),
      cities = [cityOf(player, [new First(1), new Second(2)])],
      { cityRegistry, processed, ruleRegistry } = setUpProcess(
        cities,
        player,
        availableTradeRateRegistry
      ),
      cache: (typeof Yield)[] = [Second];

    availableTradeRateRegistry.register(FirstRate, SecondRate);

    processTradeRateYields(
      cache,
      ruleRegistry,
      cityRegistry,
      availableTradeRateRegistry
    )(player);

    expect(
      processed.map(([, name, value]): [string, number] => [name, value])
    ).to.deep.equal([['Second', 2]]);
    expect(cache).to.deep.equal([Second]);
  });

  it("does nothing for a player with no cities, and leaves other players' cities alone", (): void => {
    const availableTradeRateRegistry = new AvailableTradeRateRegistry(),
      player = new Player(new RuleRegistry()),
      { cityRegistry, processed, ruleRegistry } = setUpProcess(
        [cityOf(player, [new First(1)])],
        player,
        availableTradeRateRegistry
      );

    availableTradeRateRegistry.register(FirstRate);

    processTradeRateYields(
      [],
      ruleRegistry,
      cityRegistry,
      availableTradeRateRegistry
    )(new Player(new RuleRegistry()));

    expect(processed).to.deep.equal([]);
  });
});
