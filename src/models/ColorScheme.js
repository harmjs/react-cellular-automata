/*
// With help from https://web.archive.org/web/20081227003853/http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
*/

import chroma from 'chroma-js';

const getRatio = function(index, maxIndex)
{
    if(index === 0)
    {
        return 0;
    } else if (index === maxIndex)
    {
        return 1;
    } else 
    {
        return index / maxIndex;
    }
}

const ColorScheme = function(
    name, backgroundColor, youngColor, oldColor, deadColor)
{
    this.name = name;
    this.backgroundColor = backgroundColor;
    this.youngColor = youngColor;
    this.oldColor = oldColor;
    this.deadColor = deadColor;
}

ColorScheme.prototype.createGenerationColors = function(generations)
{
    const generationColors = [this.deadColor];
    const maxGenerationIndex = generations - 2;

    for(let i = 0; i <= maxGenerationIndex; i++)
    {
        const ratio = getRatio(i, maxGenerationIndex);
        generationColors.push(
            chroma.mix(this.youngColor, this.oldColor, ratio, "lch").css('hsl'));
    }
    return generationColors;
}

ColorScheme.FRUITY = new ColorScheme(
    'Fruity',
    '#003049','#fcbf49',
    '#d62828', '#eae2b7');

export const COLOR_SCHEMES = [
    ColorScheme.FRUITY
];

export default ColorScheme;

