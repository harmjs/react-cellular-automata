import Neighbourhood, { Preset as NeighbourhoodPreset } from './Neighbourhood';
import Rules from './Rules'
import CoordGenerator from './CoordGenerator';
import Tiles, { State as TileState, ClearMode } from './Tiles'; 

export const Preset = function(
    name, neighbourhoodPreset, rulesString, clearMode) 
{
    this.name = name;
    this.neighbourhoodPreset = neighbourhoodPreset;
    this.rulesString = rulesString;
    this.clearMode = clearMode;
}

Preset.GAME_OF_LIFE = new Preset('Game of Life', 
    NeighbourhoodPreset.MOORE_SQUARE, '2,3/3/2', ClearMode.RANDOM);

Preset.STAR_WARS = new Preset('Star Wars', 
    NeighbourhoodPreset.MOORE_SQUARE, '3,4,5/2/4', ClearMode.RANDOM);

export const PRESETS = [
    Preset.GAME_OF_LIFE, Preset.STAR_WARS];

const Ca = function(lattice, neighbourhood, rules, 
    coordMap, tiles, clearMode, size, warp, age, preset = null)
{
    this.lattice = lattice;
    this.neighbourhood = neighbourhood;
    this.rules = rules;
    this.coordMap = coordMap;
    this.tiles = tiles;
    this.clearMode = clearMode;
    this.size = size;
    this.warp = warp;
    this.age = age;
    this.preset = preset;
}

Ca.from = function (preset, size, warp) 
{
    const { neighbourhoodPreset, rulesString, clearMode } = preset;

    const lattice = neighbourhoodPreset.baseLattice;
    const neighbourhood = Neighbourhood.fromPreset(
        neighbourhoodPreset, lattice);
    const rules = Rules.fromString(rulesString, neighbourhood.coordMap.size);

    const coordMap = CoordGenerator.assembleCoordMap(
        new CoordGenerator(lattice.baseGenerate, size));
    const tiles = Tiles.from(lattice, coordMap, 
        (coord, key) => clearMode.clear(coord, key, rules));
    const age = 0;

    return new Ca(lattice, neighbourhood, rules, coordMap, tiles, clearMode,
         size, warp, age, preset);
}

Ca.prototype.changePreset = function(preset) 
{
    const { neighbourhoodPreset, rulesString, clearMode } = preset;

    const lattice = neighbourhoodPreset.baseLattice;
    const neighbourhood = Neighbourhood.fromPreset(
        neighbourhoodPreset, lattice);
    const rules = Rules.fromString(rulesString, neighbourhood.coordMap.size);

    const coordMap = CoordGenerator.assembleCoordMap(
        new CoordGenerator(lattice.baseGenerate, this.size));
    const tiles = Tiles.from(lattice, coordMap, 
        (coord, key) => clearMode.clear(coord, key, rules));

    return this.immutate(
        { lattice, neighbourhood, rules, coordMap, tiles, preset });
}

Ca.prototype.immutate = function({ lattice, neighbourhood, rules,
     coordMap, tiles, clearMode, size, warp, age, preset })
{
    // when using this style in the future, 
    // pass a single param object to the constructor, 
    // to avoid this step, and having to remembering constructor param order

    const ca = new Ca(
        lattice || this.lattice,
        neighbourhood || this.neighbourhood,
        rules || this.rules,
        coordMap || this.coordMap,
        tiles || this.tiles,
        clearMode || this.clearMode, 
        size || this.size,
        warp || this.warp,
        Number.isInteger(age) ? age : this.age,
        preset !== undefined ? preset : this.preset);

    return ca;
}

Ca.prototype.toggleTile = function(key)
{
    if (this.tiles.map.has(key))
    {
        const tile = this.tiles.map.get(key);

        tile.state.generation += 1;

        if (tile.state.generation >= this.rules.generations)
        {
            tile.state.generation = 0;
        }

        const tiles = this.tiles.immutate({});

        return this.immutate({ tiles });
    }
    return this;
}

Ca.prototype.toggleNeighbourhoodCoord = function(coord, key)
{
    if (coord.x || coord.y)
    {
        const neighbourhood = this.neighbourhood.toggleCoord(coord, key);
        const rules = this.rules.adjustSize(neighbourhood.coordMap.size);
        const preset = null;


        return this.immutate({ neighbourhood, rules, preset });
    }
    else return this;
}

Ca.prototype.changeLattice = function(lattice)
{
    const neighbourhood = this.neighbourhood.changeLattice(lattice);
    const tiles = this.tiles.changeLattice(lattice);
    const preset = null;

    return this.immutate({ lattice, tiles, neighbourhood, preset });
}

Ca.prototype.changeNeighbourhood = function(neighbourhoodPreset)
{
    const neighbourhood = Neighbourhood.fromPreset(
        neighbourhoodPreset, this.lattice);
    const rules = this.rules.adjustSize(neighbourhood.coordMap.size);
    const preset = null;

    return this.immutate({ neighbourhood, rules, preset });
}

Ca.prototype.setWarp = function(warp)
{
    return this.immutate({ warp });
}

Ca.prototype.clear = function()
{
    const tiles = Tiles.from(this.lattice, this.coordMap, 
        (coord, key) => this.clearMode.clear(coord, key, this.rules));
    const age = 0;

    return this.immutate({ tiles, age });
}

Ca.prototype.generate = function()
{
    const coordMap = CoordGenerator.assembleCoordMap(
        new CoordGenerator(this.lattice.baseGenerate, this.size));

    const tiles = Tiles.from(this.lattice, coordMap, 
        (coord, key) => this.clearMode.clear(coord, key, this.rules));

    const age = 0;

    return this.immutate({ coordMap, tiles, age });
}

Ca.prototype.toggleRuleAt = function(ruleName, index) 
{
    const rules = this.rules.toggleRuleAt(ruleName, index);
    const preset = null;
    return this.immutate({ rules, preset });
}

Ca.prototype.changeGenerations = function(generations) 
{
    const rules = this.rules.immutate({ generations });
    const preset = null;

    return this.immutate({ rules, preset });
}

Ca.prototype.changeClearMode = function(clearMode)
{
    const preset = null;
    return this.immutate({ clearMode, preset })
}

Ca.prototype.changeSize = function(size)
{
    return this.immutate({ size });
}

Ca.prototype.tick = function()
{
    const tiles = this.tiles.tick(this.neighbourhood, this.rules, this.warp);
    const age = this.age += 1;
    return this.immutate({ tiles, age });
}

export default Ca;