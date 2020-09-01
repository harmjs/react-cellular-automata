import Vect2d from './Vect2d';
import { TILE_RENDERER_PADDING } from '../constants';

const reduceRangeCallback = (accumulator, current) =>
{
    const { min, max } = accumulator;
    if(current.x < min.x)
    {
        min.x = current.x;
    }
    else if(current.x > max.x)
    {
        max.x = current.x;
    }

    if(current.y < min.y)
    {
        min.y = current.y;
    }
    else if(current.y > max.y)
    {
        max.y = current.y;
    }
    return accumulator;
}

const calculateRange = (tileArr) =>
{
    const base = tileArr.map((tile) => tile.position)
        .reduce(reduceRangeCallback, { 
            min: new Vect2d(0, 0),  max: new Vect2d(0, 0)});

    return {
        min: base.min.subtract(TILE_RENDERER_PADDING),
        max: base.max.add(TILE_RENDERER_PADDING)
    }
}

const Tiles = function(lattice, map, array, range) 
{
    this.lattice = lattice;
    this.map = map;
    this.array = array;
    this.range = range;
}

Tiles.from = function(lattice, coordMap, initTileState)
{
    const tileMap = new Map(Array.from(coordMap.entries())
        .map(([key, coord]) => [key, new Tile(coord, 
                lattice.coordToWorldSpace(coord),
                initTileState(coord, key))]));

    const tileArr = Array.from(tileMap.values());
    const range = calculateRange(tileArr);

    return new Tiles(lattice, tileMap, tileArr, range);
}

Tiles.prototype.changeLattice = function(lattice)
{
    for (let tile of this.array)
    {
        tile.position = lattice.coordToWorldSpace(tile.coord);
    }
    const range = calculateRange(this.array);

    return new Tiles(lattice, this.map, this.array, range);
}

Tiles.prototype.immutate = function({ lattice, map, array, range })
{
    return new Tiles(

        lattice || this.lattice,
        map || this.map, 
        array || this.array,
        range || this.range);
}

Tiles.prototype.tick = function(neighbourhood, rules, warp)
{
    // update tile counts
    for (let tile of this.array)
    {
        if (tile.state.generation < 2)
        {
            tile.state.count = 0;
            for (let [_, directionCoord] of neighbourhood.coordMap)
            {

                const neighbourKey = tile.coord
                    .add(directionCoord)
                    .serialize();

                if (
                    this.map.has(neighbourKey)
                    && this.map.get(neighbourKey).state.generation === 1)
                {
                    tile.state.count += 1;
                }
            }
        }
    }

    // update tile generations

    for (let tile of this.array)
    {
        if (tile.state.generation === 0 
            && rules.birthRule.bools[tile.state.count])
        {
            tile.state.generation = 1;
        }
        else if (tile.state.generation === 1 &&
            !rules.survivalRule.bools[tile.state.count])
        {
            tile.state.generation = 2;
        }
        else if(tile.state.generation >= 2)
        {
            tile.state.generation += 1;
        }

        if (tile.state.generation >= rules.generations)
        {
            tile.state.generation = 0;
        }
    }

    return new Tiles(this.lattice, this.map, this.array, this.range);
}

export default Tiles;

const Tile = function(coord, position, state)
{
    this.coord = coord;
    this.position = position;
    this.state = state;
}

export const State = function(generation)
{
    this.generation = generation;
    this.count = null;
}

export const ClearMode = function(name, clear)
{
    this.name = name;
    this.clear = clear;
}

ClearMode.RANDOM = new ClearMode('Random', 
    () => new State(Math.floor(Math.random() * 2)));

ClearMode.RANDOM_GENERATIONS = new ClearMode('Random Generations', 
    (coord, key, rules ) => new State(
        Math.floor(Math.random() * rules.generations)));

ClearMode.CENTER = new ClearMode('Center', 
    (coord) => (coord.x || coord.y) ? new State(0) : new State(1));

export const CLEAR_MODES = [ClearMode.CENTER, ClearMode.RANDOM, ClearMode.RANDOM_GENERATIONS];