import JXG from "jsxgraph";

// TODO: It would be better to read this from the CSS file
const theme = {
    // Primary Colors
    '--color-primary': '#2196F3',
    '--color-primary-dark': '#1976D2',
    '--color-secondary': '#FFC107',
    '--color-secondary-dark': '#FFA000',
    '--color-accent': '#E91E63',
    '--color-accent-dark': '#C2185B',
    // Graph Colors
    '--color-graph-function': '#2196F3',
    '--color-graph-function-highlight': '#1976D2',
    '--color-graph-point': '#E91E63',
    '--color-graph-point-highlight': '#C2185B',
    '--color-graph-line': '#4CAF50',
    '--color-graph-line-highlight': '#388E3C',
    '--color-graph-glider': '#FFC107',
    '--color-graph-glider-highlight': '#FFA000',
};


const defaultPointAttributes = {
    size: 3,
    face: 'o',
    fillColor: theme["--color-graph-point"],
    strokeColor: theme["--color-graph-point-highlight"],
    highlightFillColor: theme["--color-graph-point-highlight"],
    highlightStrokeColor: theme["--color-graph-point"],
};

const defaultLineAttributes = {
    strokeColor: theme['--color-graph-line'],
    highlightStrokeColor: theme['--color-graph-line-highlight'],
    strokeWidth: 2,
};

const defaultGliderAttributes = {
    size: 6,
    face: '<>',
    fillColor: theme['--color-graph-glider'],
    strokeColor: theme['--color-graph-glider-highlight'],
    highlightFillColor: theme['--color-graph-glider-highlight'],
    highlightStrokeColor: theme['--color-graph-glider'],
};

export function createPoint(board: JXG.Board, coords: JXG.Coords, attributes = {}) {
    return board.create('point', coords, { ...defaultPointAttributes, ...attributes });
}

export function createLine(board: JXG.Board, coords: [JXG.Coords, JXG.Coords], attributes = {}) {
    return board.create('line', coords, { ...defaultLineAttributes, ...attributes });
}

export function createGlider(board: JXG.Board, coords: JXG.Coords, target: JXG.GeometryElement, attributes = {}) {
    const newCoords: [number, number, JXG.GeometryElement] = [
        (coords[0] as number),
        (coords[1] as number),
        target
    ];

    return board.create('glider', newCoords, { ...defaultGliderAttributes, ...attributes });
}
