import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';

import Vect2d, { Transform2d } from '../models/Vect2d';
import { useTimeoutDivResize } from '../hooks';
import { Field, Spacer } from './Input';
import { MARGIN_SIZE, COLOR } from '../constants';

// im missing something here :P

// get rid of other thing 

/*
const Width = styled.div`
    display: flex;
    padding: ${MARGIN_SIZE.SMALL};
    display: flex;
    flex-direction: row;
    flex: 1 0 ${({ minWidth }) => minWidth + "px"};
    box-sizing: border-box;
    flex-wrap: wrap;
`;

const Height = styled.div`
    justify-content: center;
    flex: 1 0 ${({ minHeight }) => minHeight + "px"};
    border: 1px solid black;
    background-color: LightBlue;
    cursor: pointer;
    box-sizing: border-box;
    flex-wrap: wrap;
`;
*/

const Container = styled.div`
    background-color: ${({ backgroundColor }) => backgroundColor};
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`;

const RenderSettings = function(transform, inverseTransform, scaleFactor)
{
    this.transform = transform;
    this.inverseTransform = inverseTransform;
    this.scaleFactor = scaleFactor;
}

const TileRenderer = ({ backgroundColor, tiles, generationColors, onClick }) => 
{
    const divRef = useRef(null);
    const canvasRef = useRef(null);

    const [canvasSize, setCanvasSize] = useState(Vect2d.ZERO);
    const [renderSettings, setRenderSettings] = useState(
        new RenderSettings(Transform2d.IDENTITY, Transform2d.IDENTITY, 1));

    const calculateRenderSettings = () => 
    {
        const contentSize = tiles.range.max.subtract(tiles.range.min);
       
        const scaleFactor = Math.min(
            canvasSize.x/contentSize.x, 
            canvasSize.y/contentSize.y);

        const translation = canvasSize.divide(2);
        const offset = contentSize.divide(2).subtract(tiles.range.max);
        
        // context.translate(translation.x, translation.y);
        // context.scale(scaleFactor, -scaleFactor);
        // context.translate(offset.x, offset.y);
        // const oldTransform = context.getTransform();

       const transform = Transform2d.multiply(
            Transform2d.translate(new Vect2d(translation.x, translation.y)),
            Transform2d.scale(new Vect2d(scaleFactor, -scaleFactor)),
            Transform2d.translate(offset));

        const inverseTransform = transform.inverse();


        setRenderSettings({ scaleFactor, inverseTransform, transform });
    }

    const render = () =>
    {
        const { transform, scaleFactor} = renderSettings;

        const context = canvasRef.current.getContext('2d');

        context.imageSmoothingEnabled = false;
        context.lineWidth = 1/scaleFactor;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvasSize.x, canvasSize.y);

        context.setTransform(
            transform.scale.x, transform.skew.y,
            transform.skew.x, transform.scale.y,
            transform.translate.x, transform.translate.y);

        const contentTransform = context.getTransform();

        const renderTile = (tile) => 
        {
            context.translate(tile.position.x, tile.position.y);
            context.beginPath();

            const vertices = tiles.lattice.coordToVertices(tile.coord);

            context.moveTo(vertices[0].x, vertices[0].y);
    
            context.fillStyle = generationColors[tile.state.generation];
    
            for(let i = 1; i < vertices.length; i++)
            {
                context.lineTo(vertices[i].x, vertices[i].y);
            }

    
            context.closePath();
            context.fill();

            context.setTransform(contentTransform);
        };

        tiles.array.forEach(renderTile);
    }

    const waiting = () =>
    {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
    }

    const resize = () => 
    {
        const size = new Vect2d(
            divRef.current.clientWidth - 1,
            divRef.current.clientHeight - 1);

        // slightly shrinken to prevent from triggering an infinite loop of 
        // div resizes in some cases
        // perhaps due to DOM integer imprecision?

        canvasRef.current.width = size.x;
        canvasRef.current.height = size.y;

        setCanvasSize(size);
    }

    useTimeoutDivResize(divRef, waiting, resize, 75);
    useEffect(calculateRenderSettings, [canvasSize, tiles]);

    useEffect(render, [renderSettings, tiles, generationColors]);

    const handleClick = (event) =>
    {
        const { inverseTransform } = renderSettings;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const canvasSpace = new Vect2d(
            event.clientX - rect.left, 
            event.clientY - rect.top);

        const worldSpace = canvasSpace.transform(inverseTransform);
        const coordSpace = tiles.lattice.worldToCoordSpace(worldSpace);
        const coordKey = coordSpace.serialize();
        
        if (tiles.map.has(coordKey))
        {
            onClick(coordSpace, coordKey);
        }
    }

    return (
        <Container
            ref={divRef}
            backgroundColor={backgroundColor}
        >
            <canvas 
                ref={canvasRef}
                onClick={onClick ? handleClick : () => null}
            />
        </Container>
    );
}

export default TileRenderer;