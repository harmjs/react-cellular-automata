import React, { useState, useRef, useEffect } from 'react';
import { useToggleableInterval } from './hooks';

import styled, { createGlobalStyle } from 'styled-components';
import { parseIntMinMax } from './helpers';

import { Button, TextField, RuleField, PresetSelectField, Checkbox} 
    from './components/Input';
import TileRenderer from './components/TileRenderer';

import Ca, { Preset as CaPreset, PRESETS } from './models/Ca';
import { LATTICES } from './models/Lattice';
import { CLEAR_MODES } from './models/Tiles';
import { Preset as NeighbourhoodPreset, Preset } from './models/Neighbourhood';

import ColorScheme, { COLOR_SCHEMES } from './models/ColorScheme';

import { CA_SIZE, MARGIN_SIZE, CA_GENERATIONS } 
    from './constants';

const GlobalStyle = createGlobalStyle`
    html {
        height: 100%;
    }
    body {
        height: 100%;
        margin: 0px;
    }
    #root {
        height: 100%;
    }
    label {
        min-width: 0px;
        width: 100%;
        box-sizing: border-box;
    }
    input { 
        min-width: 0px;
        width: 100%;
        box-sizing: border-box;
    }
    select {
        width: 100%;
        min-width: 0px;
        box-sizing: border-box;
    }
    form {
        width: 100%;
        min-width: 0px;
        box-sizing: border-box;
    }
    option{
        width: 100%;
        min-width: 0px;
        box-sizing: border-box;
    }
    `;

const Border = styled.div`
    width: 100%;
    height: 100%;
    border: 1px solid black;
`;    

const Container = styled.div`
    height: 100%;
`;

const MainLayout = styled.div` 
    display: flex;
    height: 100%;
    padding: ${MARGIN_SIZE.MEDIUM};
    box-sizing: border-box;
    flex-flow: wrap;
`;

const SmallPanel = styled.div`
    padding: ${MARGIN_SIZE.SMALL};
    display: flex;
    flex-direction: column;
    flex: 1 1;
    background-color: white;
    box-sizing: border-box;
`;

const SimulationWidth = styled.div`
    padding: ${MARGIN_SIZE.MEDIUM};
    display: flex;
    flex-direction: column;
    flex: 1 1 300px;
`;

const SimulationHeight = styled.div`
    flex: 1 1 300px;
    border: 1px solid black;
`;

const App = () =>
{
    const [ ca, setCa ] = useState(Ca.from(CaPreset.STAR_WARS, 25, false));

    const [ colorScheme, setColorScheme ] = useState(ColorScheme.FRUITY);

    const [ generationColors, setGenerationColors] = useState(
        colorScheme.createGenerationColors(ca.rules.generations));

    useEffect(
        () => setGenerationColors(
            colorScheme.createGenerationColors(ca.rules.generations)), 
        [ca.rules.generations, colorScheme]);

    return (
        <Container>
            <GlobalStyle />
            <MainLayout>
                <SimulationSettings 
                    ca={ca} setCa={setCa} 
                    colorScheme={colorScheme}
                    setColorScheme={setColorScheme}
                />
                <SimulationWidth>
                    <SimulationHeight>
                        <TileRenderer 
                            tiles={ca.tiles}
                            backgroundColor={colorScheme.backgroundColor}
                            generationColors={generationColors}
                            onClick={(coord, key) => setCa(ca.toggleTile(key))}
                        />
                    </SimulationHeight>
                </SimulationWidth>
                <CaSettings 
                    ca={ca} 
                    setCa={setCa} 
                    colorScheme={colorScheme}
                />
            </MainLayout>
        </Container>
    );
};

const latticeNeighbourhoodPresetMap = new Map(LATTICES
    .map((lattice) => [lattice, NeighbourhoodPreset.PRESETS
        .filter((preset) => preset.baseLattice === lattice)]));

const NeighbourhoodRendererWidth = styled.div`
    padding: ${MARGIN_SIZE.SMALL};
    display: flex;
    flex-direction: column;
    flex: 1 1 150px;
`;

const NeighbourhoodRendererHeight = styled.div`
    flex: 1 1 150px;
    border: 1px solid black;
`;

const CaSettings = ({ ca, setCa, colorScheme }) => {
    const divRef = useRef();

    return (
        <SmallPanel
            ref={divRef}
        >
            <PresetSelectField 
                label={'Lattice'}
                current={ca.lattice}
                presets={LATTICES}
                onSubmit={(lattice) => setCa(ca.changeLattice(lattice))}
            />
            <PresetSelectField 
                label={'Neighbourhood'}
                current={ca.neighbourhood.preset}
                presets={latticeNeighbourhoodPresetMap.get(ca.lattice)}
                onSubmit={(neighbourhoodPreset) => setCa(
                    ca.changeNeighbourhood(neighbourhoodPreset))}
            />
            <NeighbourhoodRendererWidth>
                <NeighbourhoodRendererHeight>
                    <TileRenderer
                        backgroundColor={colorScheme.backgroundColor}
                        generationColors={[
                            colorScheme.oldColor, 
                            colorScheme.youngColor, colorScheme.deadColor]}
                        tiles={ca.neighbourhood.tiles}
                        onClick={(coord, key) => setCa(
                            ca.toggleNeighbourhoodCoord(coord, key))}
                    />
                </NeighbourhoodRendererHeight>
            </NeighbourhoodRendererWidth>
            <RuleField
                label={"Birth Rule"}
                rule={ca.rules.birthRule}
                colors={[colorScheme.deadColor, colorScheme.oldColor]}
                onClick={(index) => setCa(ca.toggleRuleAt('birthRule', index))}
            />
            <RuleField
                label={"Survival Rule"}
                rule={ca.rules.survivalRule}
                colors={[colorScheme.deadColor, colorScheme.oldColor]}
                onClick={(index) => setCa(
                    ca.toggleRuleAt('survivalRule', index))}
            />
            <TextField 
                label={"Generations"}
                value={ca.rules.generations}
                stringToValue={(str) => parseIntMinMax(
                    str, CA_GENERATIONS.MIN, CA_GENERATIONS.MAX)}
                onSubmit={(generation) => setCa(
                    ca.changeGenerations(generation))}
            />
        </SmallPanel>
    );
};

const Speed = function(name, delay)
{
    this.name = name;
    this.delay = delay;
}

Speed.FAST = new Speed('Fast', 75);
Speed.NORMAL = new Speed('Normal', 150);
Speed.SLOW = new Speed('Slow', 300);

const SimulationSettings = ({ ca, setCa, colorScheme, setColorScheme }) =>
{
    const [isPlay, setIsPlay] = useState(false);
    const [speed, setSpeed] = useState(Speed.NORMAL);
    
    useToggleableInterval(isPlay, () => setCa(ca.tick()), speed.delay);

    return (
        <SmallPanel>
            <PresetSelectField
                label={'Preset'}
                current={ca.preset}
                presets={PRESETS}
                onSubmit={(caPreset) => setCa(ca.changePreset(caPreset))}
            />
            <PresetSelectField 
                label={'Speed'}
                presets={[ Speed.FAST, Speed.NORMAL, Speed.SLOW ]}
                current={speed}
                onSubmit={(speed) => setSpeed(speed)}
            />
            <Button 
                label={`${isPlay ? `Pause` : `Play`} (${ca.age })`}
                onSubmit={() => setIsPlay(!isPlay)}
            >
            </Button>
            <PresetSelectField 
                label={'Clear Mode'}
                presets={CLEAR_MODES}
                current={ca.clearMode}
                onSubmit={(clearMode) => setCa(ca.changeClearMode(clearMode))}
            />
            <Button label={'Reset'} onSubmit={() => setCa(ca.clear())} />
            <TextField 
                label={"Lattice Size"}
                value={ca.size}
                stringToValue={(str) => parseIntMinMax(str, 
                    CA_SIZE.MIN, CA_SIZE.MAX )}
                onSubmit={(size) => setCa(ca.changeSize(size))}
            />
            <Button label={'Generate Lattice'} 
                onSubmit={() => setCa(ca.generate())} />
            <PresetSelectField 
                label={'Color Scheme'}
                presets={COLOR_SCHEMES}
                current={colorScheme}
                onSubmit={(colorScheme) => setColorScheme(colorScheme) }
            />
            <Checkbox 
                label={"Warp"}
                value={ca.warp}
                onSubmit={(bool) => setCa(ca.setWarp(bool))}
            />
        </SmallPanel>
    );
}

export default App;