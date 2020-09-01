export const parseIntMinMax = function(str, min, max)
{
    const int = parseInt(str);

    if(Number.isNaN(int))
    {
        return null;
    }
    else if(int > max)
    {
        return max;
    }
    else if(int < min)
    {
        return min;
    } 
    else 
    {
        return int;
    }
}