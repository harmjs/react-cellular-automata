import Ca from "./Ca";
import { parseIntMinMax } from '../helpers';
import { CA_GENERATIONS } from '../constants';

// problem rules need to change 

const Rules = function(birthRule, survivalRule, generations )
{
    this.birthRule = birthRule;
    this.survivalRule = survivalRule;
    this.generations = generations;
};

Rules.fromString = function(rulesString, neighbourhoodSize)
{
    const [ survivalString, birthString, generationString ] 
        = rulesString.split('/');

    return new Rules(
        Rule.fromString(birthString, neighbourhoodSize),
        Rule.fromString(survivalString, neighbourhoodSize),
        parseInt(generationString));
}

Rules.prototype.immutate = function({ birthRule, survivalRule, generations })
{
    return new Rules(
        birthRule || this.birthRule,
        survivalRule || this.survivalRule,
        generations || this.generations);
}

Rules.parseGenerations = function(string)
{
    return parseIntMinMax(string, CA_GENERATIONS.min, CA_GENERATIONS.max);
}

Rules.prototype.toggleRuleAt = function(ruleName, index)
{
    return this.immutate({ [ruleName]: this[ruleName].toggleAt(index) });
}

Rules.prototype.adjustSize = function(neighbourhoodSize)
{
    const current = this.birthRule.bools.length;
    const target = neighbourhoodSize + 1;
    if(current > target)
    {
        return new Rules(
            this.birthRule.shrinkTo(target),
            this.survivalRule.shrinkTo(target),
            this.generations);
    }
    else if (current < target)
    {
        return new Rules(
            this.birthRule.growTo(target, current),
            this.survivalRule.growTo(target, current),
            this.generations
        );
    }
    return this;
}

const Rule = function(bools)
{
    this.bools = bools;
}

Rule.fromString = function(rulesString, neighbourhoodSize)
{
    const set = new Set(rulesString.split(',')
        .map((str) => parseInt(str)));
    return new Rule([...Array(neighbourhoodSize + 1)]
        .map((_, index) => set.has(index)));
}

Rule.prototype.toggleAt = function(targetIndex)
{
    return new Rule(this.bools
        .map((bool, index) => index === targetIndex ? !bool : bool));
}

Rule.prototype.growTo = function(target, current)
{
    return new Rule([ ...this.bools, 
        ...Array(target - current).fill(false)]);
}

Rule.prototype.shrinkTo = function(target)
{
    return new Rule(this.bools.slice(0, target));
}

export default Rules;


/*
Rule.create = function(neighbourhoodSize)
{
    return new Rule(
        new Array(neighbourhoodSize + 1).fill(false));
}

Rule.prototype.createFromNeighbourhoodSize = function(neighbourhoodSize)
{
    const nextBoolCount = neighbourhoodSize + 1;
    const boolCount = this.bools.count;
    if(nextBoolCount > boolCount)
    {
        return new Rule([
            ...this.bools, 
            ...new Array(nextBoolCount - boolCount).fill(false)])
    }
    else
    {
        return new Rule(this.bools.slice(0, nextBoolCount));
    }
}

Rule.prototype.toggle = function(toggleIndex)
{
    return new Rule(this.bools
        .map((bool, index) => index === toggleIndex ? !bool : bool));
}

export default Rule;
*/