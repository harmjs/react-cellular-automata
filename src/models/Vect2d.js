const Vect2d = function(x, y) 
{
    this.x = x;
    this.y = y;
}

Vect2d.deserialize = function(key)
{
    const [x, y] = key.split(",");
    return new Vect2d(x, y);
}

Vect2d.max = function(a, b)
{
    return new Vect2d(
        Math.max(a.x, b.x),
        Math.max(a.y, b.y));
}

Vect2d.min = function(a, b)
{
    return new Vect2d(
        Math.min(a.x, b.x),
        Math.min(a.y, b.y));
}

Vect2d.prototype = {
    serialize: function()
    {
        return this.x + "," + this.y;
    },
    add: function(vect2d)
    {
        return new Vect2d(this.x + vect2d.x, this.y + vect2d.y);
    },
    subtract: function(vect2d)
    {
        return new Vect2d(this.x - vect2d.x, this.y - vect2d.y);
    },
    multiply: function(scalar)
    {
        return new Vect2d(this.x * scalar, this.y * scalar);
    },
    divide: function(scalar)
    {
        return new Vect2d(this.x / scalar, this.y / scalar);
    },
    oldTransform: function(matrix)
    {
        return new Vect2d(
            this.x * matrix[0] + this.y * matrix[1],
            this.x * matrix[2] + this.y * matrix[3])
    },
    transform: function(transform)
    {
        return new Vect2d(
            this.x * transform.scale.x + this.y * transform.skew.x 
                + transform.translate.x,
            this.y * transform.scale.y + this.x * transform.skew.y 
                + transform.translate.y);
    },
    round: function()
    {
        return new Vect2d(Math.round(this.x), Math.round(this.y));
    }
}

Vect2d.ONE = new Vect2d(1, 1);
Vect2d.ZERO = new Vect2d(0, 0);

export const Transform2d = function(scale, skew, translate)
{
    this.scale = scale;
    this.skew = skew;
    this.translate = translate;
}

Transform2d.IDENTITY = new Transform2d(Vect2d.ONE, Vect2d.ZERO, Vect2d.ZERO);

Transform2d.scale = function(scale)
{
    return new Transform2d(scale, Vect2d.ZERO, Vect2d.ZERO);
}

Transform2d.skew = function(skew)
{
    return new Transform2d(Vect2d.ONE, skew, Vect2d.ZERO);
}

Transform2d.translate = function(translate)
{
    return new Transform2d(Vect2d.ONE, Vect2d.ZERO, translate);
}

Transform2d.multiply = function(...transform2ds)
{
    return transform2ds.reduce((acc, current) => acc.multiply(current));
}

Transform2d.prototype.multiply = function(that)
{
    return new Transform2d(
        new Vect2d(
            this.scale.x * that.scale.x 
                + this.skew.x * that.skew.y,
            this.scale.y * that.scale.y 
                + this.skew.y * that.scale.x),
        new Vect2d(
            this.scale.x * that.skew.x 
                + this.skew.x * that.scale.y,
            this.scale.y * that.skew.y 
                + this.skew.y * that.scale.x),
        new Vect2d(
            this.scale.x * that.translate.x 
                + this.skew.x * that.translate.y + this.translate.x,
            this.scale.y * that.translate.y 
                + this.skew.y * that.translate.x + this.translate.y));
}

Transform2d.prototype.inverse = function()
{
    const det = this.scale.x * this.scale.y - this.skew.x * this.skew.y;

    const b00 = this.scale.y / det;
    const b01 = -this.skew.x / det;
    const b02 = (this.skew.x * this.translate.y 
        - this.translate.x * this.scale.y) / det;

    const b10 = -this.skew.y / det;
    const b11 = this.scale.x / det;
    const b12 = -(this.scale.x * this.translate.y 
        - this.translate.x * this.skew.y) / det;

    return new Transform2d(
        new Vect2d(b00, b11),
        new Vect2d(b01, b10),
        new Vect2d(b02, b12));
}

export default Vect2d;