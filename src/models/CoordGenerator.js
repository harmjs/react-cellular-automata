import Vect2d from './Vect2d';

export const GENERATE = {
    SQUARE: {
        BASE: function(size)
        {
            const coords = [];
            for (let x = -size; x <= size; x++)
            {
                for (let y = -size; y <= size; y++)
                {
                    coords.push(new Vect2d(x, y));
                }
            }
            return coords;
        },
        CROSS: function(size)
        {
            const coords = [new Vect2d(0, 0)];
            for (let r = 1; r <= size; r++)
            {
                coords.push(
                    new Vect2d(r, 0), new Vect2d(-r, 0),
                    new Vect2d(0, r), new Vect2d(0, -r));
            }
            return coords;
        }
    },
    TRIANGLE: {
        BASE: function(size)
        {
            const coords = [];
            const r = size + 2*(size - 1);

            let i = 0;
            for(let y = -size + 1; y <= r; y++)
            {
                for(let x = -(r - i); x <= r - i; x++)
                {
                    coords.push(new Vect2d(x, y));
                }
                i += 1;
            }
            return coords;
        },
        MOORE: function()
        {
            //  frankly too lazy to lazy
            return [
                new Vect2d(-2, 1), new Vect2d(-1, 1), new Vect2d(0, 1), new Vect2d(1, 1), new Vect2d(2, 1),
                new Vect2d(-2, 0), new Vect2d(-1, 0), new Vect2d(0, 0), new Vect2d(1, 0), new Vect2d(2, 0),
                new Vect2d(-1, -1), new Vect2d(0, -1), new Vect2d(1, -1),
            ]
        },
    },
    HEXAGON: {
        BASE: function(size)
        {
            const coords = [];

            for (let x = -size; x <= size; x++) 
            {
                const y1 = Math.max(-size, -x - size);
                const y2 = Math.min(size, -x + size);
                for (let y = y1; y <= y2; y++) 
                {
                    coords.push(new Vect2d(x, y));
                }
            }
            return coords;
        },
        MOORE_OFFSET: function(size)
        {
            const coords = [];
            for (let r = 1; r <= size; r++)
            {
                coords.push(
                    new Vect2d(-r, -r), new Vect2d(r, r),
                    new Vect2d(r * 2, - r), new Vect2d(-r, r * 2),
                    new Vect2d(-r * 2, r), new Vect2d(r, - r * 2));
 
            }
            return coords;
        }}};

const CoordGenerator = function(generate, size = null, add = true)
{
    this.generate = generate;
    this.size = size;
    this.add = add;
}

CoordGenerator.assembleCoordMap = function(...generators)
{
    const map = new Map();

    const addAction = (coord) => 
    {
        map.set(coord.serialize(), coord);
    } 

    const removeAction = (coord) => 
    {
        map.delete(coord.serialize(), coord);
    }

    for (let generator of generators)
    {
        const action = generator.add ? addAction : removeAction;

        generator.generate(generator.size)
            .forEach((coord) => action(coord));
    }

    return map;
}

export default CoordGenerator;