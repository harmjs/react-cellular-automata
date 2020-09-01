import CoordGenerator, { GENERATE } from './CoordGenerator.js';
import Vect2d from './Vect2d';
import Tiles, { State } from './Tiles';
import Lattice from './Lattice.js';

const REMOVE_ZERO_GENERATOR = new CoordGenerator(
    () => [new Vect2d(0, 0)], null, false);

export const Preset = function(name, baseLattice, ...generators)
{
    this.name = name;
    this.baseLattice = baseLattice;
    this.generators = generators;
}

Preset.prototype.assembleCoordMap = function()
{
    return CoordGenerator.assembleCoordMap(
        ...this.generators, REMOVE_ZERO_GENERATOR);
}

const PRESETS_OBJ = {
    VON_NEUMANN_SQUARE: new Preset(
        'von Neumann (Square)', Lattice.SQUARE, 
    new CoordGenerator(GENERATE.SQUARE.CROSS, 1)),
    MOORE_SQUARE: new Preset(
        'Moore (Square)', Lattice.SQUARE,
        new CoordGenerator(GENERATE.SQUARE.BASE, 1)),
    VON_NEUMANN_EXTENDED_SQUARE: new Preset(
        'Moore von Neumann (Square)', Lattice.SQUARE,
        new CoordGenerator(GENERATE.SQUARE.BASE, 1),
        new CoordGenerator(GENERATE.SQUARE.CROSS, 2)),
    MOORE_EXTENDED_SQAURE: new Preset(
        'Moore Extended (Square)', Lattice.SQUARE, 
        new CoordGenerator(GENERATE.SQUARE.BASE, 2)),
    VON_NEUMANN_HEXAGON: new Preset(
        'von Neumann (Hexagon)', Lattice.HEXAGON,
        new CoordGenerator(GENERATE.HEXAGON.BASE, 1)),
    MOORE_HEXAGON: new Preset(
        'Moore (Hexagon)', Lattice.HEXAGON,
        new CoordGenerator(GENERATE.HEXAGON.BASE, 1),
        new CoordGenerator(GENERATE.HEXAGON.MOORE_OFFSET, 1)),
    VON_NEUMANN_EXTENDED_HEXAGON: new Preset(
        'von Neumann Extended (Hexagon)', Lattice.HEXAGON,
        new CoordGenerator(GENERATE.HEXAGON.BASE, 2)),
    VON_NEUMANN_TRIANGLE: new Preset(
        'von Neumann (Triangle)', Lattice.TRIANGLE, 
        new CoordGenerator(GENERATE.TRIANGLE.BASE, 1)),
    MOORE_TRIANGLE: new Preset(
        'Moore (Triangle)', Lattice.TRIANGLE, 
        new CoordGenerator(GENERATE.TRIANGLE.MOORE)),
    };


Object.assign(Preset, PRESETS_OBJ);
Preset.PRESETS = Object.values(PRESETS_OBJ);

const Neighbourhood = function(coordMap, baseCoordMap, tiles, preset = null)
{
    this.coordMap = coordMap;
    this.baseCoordMap = baseCoordMap;
    this.tiles = tiles;
    this.preset = preset;
}

const ZERO_STATE = new State(0);
const IN_NEIGHBOURHOOD_STATE = new State(1);
const NOT_IN_NEIGHBOURHOOD_STATE = new State(2);

Neighbourhood.createTiles = function(lattice, coordMap, baseCoordMap) 
{
    const initTiles = (coord, key) =>
    {
        if (coord.x || coord.y)
        {
            return coordMap.has(key) 
                ? IN_NEIGHBOURHOOD_STATE
                : NOT_IN_NEIGHBOURHOOD_STATE
        } 
        return ZERO_STATE;
    }
    return Tiles.from(lattice, baseCoordMap, initTiles);
}

Neighbourhood.fromPreset = function(preset, lattice)
{
    const coordMap = preset.assembleCoordMap();
    const baseCoordMap = preset.baseLattice.baseCoordMap;
    const tiles = Neighbourhood.createTiles(lattice, coordMap, baseCoordMap);

    return new Neighbourhood(coordMap, baseCoordMap, tiles, preset);
}

Neighbourhood.prototype.toggleCoord = function(coord, key)
{
    if (this.coordMap.has(key))
    {
        this.coordMap.delete(key);
    } 
    else 
    {
        this.coordMap.set(key, coord);
    }

    
    const tiles = Neighbourhood.createTiles(
        this.tiles.lattice, this.coordMap, this.baseCoordMap);

    return new Neighbourhood(
        this.coordMap, this.baseCoordMap, tiles);
}

Neighbourhood.prototype.changeLattice = function(lattice)
{
    const tiles = this.tiles.changeLattice(lattice);
    return new Neighbourhood(this.coordMap, this.baseCoordMap, tiles);
}


export default Neighbourhood;