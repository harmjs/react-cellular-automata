import styled from 'styled-components';
import Vect2d from './models/Vect2d';
import ColorScheme from './models/ColorScheme';

export const COLOR = {
    LIGHT: "Beige",
    DARK: "Black",
    PRIMARY: "Tomato",
    SECONDARY: "Orange",
    BACKGROUND: "Black",
};


export const MARGIN_SIZE = {
    LARGE: '24px',
    MEDIUM: '12px',
    SMALL: '6px',
    TINY: '3px'
};

export const CA_SIZE = {
    MAX: 25,
    MIN: 1
};

export const CA_GENERATIONS = {
    MAX: 16,
    MIN: 2
};


export const TILE_RENDERER_PADDING = new Vect2d(2, 2);