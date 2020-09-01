import Vect2d, { Transform2d } from './Vect2d';
import CoordGenerator, { GENERATE } from './CoordGenerator';

const ROOT_2 = Math.sqrt(2);

const createVertices = (verticesCount, offsetAngle) =>
{
    return [...Array(verticesCount)]
        .map((_, index) => offsetAngle + (index * 2 * Math.PI / verticesCount))
        .map((angle) => new Vect2d(Math.cos(angle), Math.sin(angle)));
}

const Lattice = function(
    name, coordToVertices, coordToWorldSpace, 
    worldToCoordSpace, borderOffset, baseGenerate)
{
    this.name = name;
    this.coordToVertices = coordToVertices;
    this.coordToWorldSpace = coordToWorldSpace;
    this.worldToCoordSpace = worldToCoordSpace;
    this.borderOffsetWorld = coordToWorldSpace(borderOffset);
    this.baseGenerate = baseGenerate;
    this.baseCoordMap = CoordGenerator.assembleCoordMap(
        new CoordGenerator(baseGenerate, 2));
}

const SQUARE_VERTICES = createVertices(4, Math.PI/4);

Lattice.SQUARE = new Lattice('Square', 
    (coord) => SQUARE_VERTICES,
    (coord) => coord.multiply(ROOT_2),
    (world) => world.divide(ROOT_2).round(),
    new Vect2d(1, 1), GENERATE.SQUARE.BASE);

const HEX_TO_POS_TRANSFORM = Transform2d.multiply(
    Transform2d.scale(new Vect2d(3/Math.sqrt(3), 3/2)),
    Transform2d.skew(new Vect2d(1/2, 0)));

const POS_TO_HEX_TRANSFORM = HEX_TO_POS_TRANSFORM.inverse();

const HEXAGON_VERTICES = createVertices(6, Math.PI/6);

Lattice.HEXAGON = new Lattice('Hexagon',
    (coord) => HEXAGON_VERTICES,
    (coord) => coord.transform(HEX_TO_POS_TRANSFORM),
    (world) => world.transform(POS_TO_HEX_TRANSFORM).round(),
    new Vect2d(0.5, -1), GENERATE.HEXAGON.BASE);

const points = [
    new Vect2d(0, 0),
    new Vect2d(1, 0),
    new Vect2d(0, 1),
    new Vect2d(1, 1)];

const TRIANGLE_VERTICES_0 = createVertices(3, Math.PI/6);
const TRIANGLE_VERTICES_1 = createVertices(3, -Math.PI/6);

// this triangle lattice implementation is an absolute nightmare,
// but it seems to work

const TRI_TO_POS_0 = Transform2d.multiply(
    Transform2d.scale(new Vect2d(3/Math.sqrt(3), 3/2)),
    Transform2d.scale(new Vect2d(1/2, 1)));

const TRI_TO_POS_1 = Transform2d.multiply(
    Transform2d.translate(new Vect2d(0, -1/2)),
    Transform2d.scale(new Vect2d(3/Math.sqrt(3), 3/2)),
    Transform2d.scale(new Vect2d(1/2, 1)));

const POS_TO_PARELLEGRAM = Transform2d.multiply(
    Transform2d.translate(new Vect2d(-1/2, -1/2)),
    Transform2d.skew(new Vect2d(1/2, 0)),
    Transform2d.scale(new Vect2d(Math.sqrt(3)/3, 2/3)),
    Transform2d.translate(new Vect2d(0, 1)),
);

const worldToTri = (world) =>
{
    const coord = world.transform(POS_TO_PARELLEGRAM);
    const round = coord.round();
    const decimal = coord.subtract(round);
    const diff = decimal.x - decimal.y;

    const x = round.x * 2 + (diff > 0) - round.y;
    const y = round.y;

    return new Vect2d(x, y);
}
 
Lattice.TRIANGLE = new Lattice('Triangle', 
    (coord) => Math.abs(coord.x + coord.y) % 2 
        ? TRIANGLE_VERTICES_1: TRIANGLE_VERTICES_0,
    (coord) => Math.abs(coord.x + coord.y) % 2 
        ? coord.transform(TRI_TO_POS_1) : coord.transform(TRI_TO_POS_0),
    worldToTri,
    new Vect2d(0, 0), GENERATE.TRIANGLE.BASE);

export const LATTICES = [Lattice.HEXAGON, Lattice.SQUARE, Lattice.TRIANGLE];

export default Lattice;
