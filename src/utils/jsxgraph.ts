import JXG, { type AxisAttributes } from "jsxgraph";

// Type aliases for coordinates that can be static [number, number] or dynamic [() => number, () => number] or mixed
type StaticCoord = [number, number];
type DynamicCoord = [() => number, () => number];
type MixedCoordX = [number, () => number];  // Static x, dynamic y
type MixedCoordY = [() => number, number];  // Dynamic x, static y
type Coord = StaticCoord | DynamicCoord | MixedCoordX | MixedCoordY;

export const COLORS = {
    // Primary colors
    black: "#000000",
    white: "#FFFFFF",
    blue: "#2196F3",
    green: "#4CAF50",
    red: "#F44336",
    orange: "#FF9800",
    purple: "#9C27B0",
    cyan: "#00BCD4",
    pink: "#E91E63",

    // Gray shades
    gray: "#9E9E9E",
    darkGray: "#616161",
    lightGray: "#E0E0E0",

    // Darker shades for strokes
    darkBlue: "#1976D2",
    darkGreen: "#388E3C",
    darkRed: "#D32F2F",
    darkOrange: "#F57C00",
    darkPurple: "#7B1FA2",
    darkCyan: "#0097A7",
    darkPink: "#C2185B",

    // Lighter shades for fills
    lightBlue: "#BBDEFB",
    lightGreen: "#C8E6C9",
    lightRed: "#FFCDD2",
    lightOrange: "#FFE0B2",
    lightPurple: "#E1BEE7",
    lightCyan: "#B2EBF2",
    lightPink: "#F8BBD0",
};

export const DEFAULT_GLIDER_ATTRIBUTES: JXG.GliderAttributes = {
    face: "<>",
    size: 6,
    strokeWidth: 2,
};

export const DEFAULT_POINT_ATTRIBUTES: JXG.PointAttributes = {
    size: 1,
    strokeWidth: 1,
};

export const DEFAULT_LINE_ATTRIBUTES: JXG.LineAttributes = {
    strokeWidth: 2,
};

export const DEFAULT_SEGMENT_ATTRIBUTES: JXG.SegmentAttributes = {
    strokeWidth: 2,
};

export const DEFAULT_FUNCTION_GRAPH_ATTRIBUTES: JXG.FunctiongraphAttributes = {
    strokeColor: COLORS.blue,
    strokeWidth: 3,
};

export const DEFAULT_SECANT_ATTRIBUTES: JXG.LineAttributes = {
    strokeColor: COLORS.red,
    strokeWidth: 2,
    dash: 2,
    straightFirst: true,
    straightLast: true,
};

export const DEFAULT_TANGENT_ATTRIBUTES: JXG.LineAttributes = {
    strokeColor: COLORS.purple,
    strokeWidth: 3,
    straightFirst: true,
    straightLast: true,
};

export const DEFAULT_DASHED_SEGMENT_ATTRIBUTES: JXG.SegmentAttributes = {
    strokeColor: COLORS.gray,
    strokeWidth: 1,
    dash: 2,
};

export const DEFAULT_ARROW_SEGMENT_ATTRIBUTES: JXG.SegmentAttributes = {
    strokeColor: COLORS.orange,
    strokeWidth: 2,
    lastArrow: true,
};

export const DEFAULT_TEXT_ATTRIBUTES: JXG.TextAttributes = {
    fontSize: 12,
    color: COLORS.black,
    fixed: true,
};

export const DEFAULT_SLIDER_ATTRIBUTES: JXG.SliderAttributes = {
    name: 'slider',
    snapWidth: 0.01,
};

// Helper functions to create JSXGraph elements with default styles
export function createFunctionGraph(
    board: JXG.Board,
    f: (x: number) => number,
    interval: [number, number],
    attributes: Partial<JXG.FunctiongraphAttributes> = {},
    color: string | (() => string) = COLORS.blue
) {
    return board.create('functiongraph', [f, ...interval], {
        ...DEFAULT_FUNCTION_GRAPH_ATTRIBUTES,
        strokeColor: color,
        ...attributes,
    }) as JXG.Functiongraph;
}

export function createPoint(
    board: JXG.Board,
    coords: Coord,
    attributes: Partial<JXG.PointAttributes> = {},
    color: string | (() => string) = COLORS.black
) {
    const point = board.create('point', coords, {
        ...DEFAULT_POINT_ATTRIBUTES,
        strokeColor: color, 
        fillColor: color,
        ...attributes,

    });
    return point as JXG.Point;
}

export function createGlider(
    board: JXG.Board,
    coords: [number, number, JXG.GeometryElement | AxisAttributes | undefined],
    attributes: Partial<JXG.GliderAttributes> = {},
    color: string | (() => string) = COLORS.orange
) {
    return board.create('glider', coords, {
        ...DEFAULT_GLIDER_ATTRIBUTES,
        strokeColor: color,
        fillColor: color,
        ...attributes,
    }) as JXG.Glider
}

export function createLine(
    board: JXG.Board,
    points: [JXG.Point, JXG.Point],
    attributes: Partial<JXG.LineAttributes> = {},
     color: string | (() => string) = COLORS.blue
) {
    const line = board.create('line', points, {
        ...DEFAULT_LINE_ATTRIBUTES,
        ...attributes,
    });
    line.setAttribute({strokeColor: color});
    return line;
}

export function createSegment(
    board: JXG.Board,
    points: [JXG.Point | Coord, JXG.Point | Coord],
    attributes: Partial<JXG.SegmentAttributes> = {},
    color: string | (() => string) = COLORS.blue
) {
    const segment = board.create('segment', points, {
        ...DEFAULT_SEGMENT_ATTRIBUTES,
        ...attributes,
    });
    segment.setAttribute({strokeColor: color});
    return segment;
}


export function createSecant(
    board: JXG.Board,
    points: [JXG.Point, JXG.Point],
    attributes: Partial<JXG.LineAttributes> = {},
    color: string | (() => string) = COLORS.red
) {
    const line = board.create('line', points, {
        ...DEFAULT_SECANT_ATTRIBUTES,
        ...attributes,
    });
    line.setAttribute({strokeColor: color});
    return line;
}

export function createTangent(
    board: JXG.Board,
    points: [JXG.Point, JXG.Point],
    attributes: Partial<JXG.LineAttributes> = {},
    color: string | (() => string) = COLORS.purple
) {
    const line = board.create('line', points, {
        ...DEFAULT_TANGENT_ATTRIBUTES,
        strokeColor: color,
        ...attributes,
    });
    return line;
}

export function createText(
    board: JXG.Board,
    coords: Coord,
    content: string | (() => string),
    attributes: Partial<JXG.TextAttributes> = {},
    color: string | (() => string) = COLORS.black
) {
    const text = board.create('text', [coords[0], coords[1], content], {
        ...DEFAULT_TEXT_ATTRIBUTES,
        color: color,
        ...attributes,
    });
    return text;
}

export function createSlider(
    board: JXG.Board,
    startCoords: [number, number],
    endCoords: [number, number],
    range: [number, number, number],
    attributes: Partial<JXG.SliderAttributes> = {}
) {
    return board.create('slider', [startCoords, endCoords, range], {
        ...DEFAULT_SLIDER_ATTRIBUTES,
        ...attributes,
    });
}

export function createDashedSegment(
    board: JXG.Board,
    points: [JXG.Point | Coord, JXG.Point | Coord],
    attributes: Partial<JXG.SegmentAttributes> = {},
    color: string | (() => string) = COLORS.gray
) {
    const segment = board.create('segment', points, {
        ...DEFAULT_DASHED_SEGMENT_ATTRIBUTES,
        strokeColor: color,
        ...attributes,
    });
    return segment;
}

export function createArrow(
    board: JXG.Board,
    points: [JXG.Point | Coord, JXG.Point | Coord],
    attributes: Partial<JXG.LineAttributes> = {},
    color: string | (() => string) =COLORS.orange
) {
    const arrow = board.create('arrow', points, {
        ...DEFAULT_ARROW_SEGMENT_ATTRIBUTES,
        strokeColor: color,
        ...attributes,
    });
    return arrow;
}

export function createArrowSegment(
    board: JXG.Board,
    points: [JXG.Point | Coord, JXG.Point | Coord],
    attributes: Partial<JXG.SegmentAttributes> = {},
    color: string | (() => string) = COLORS.orange
) {
    const segment = board.create('segment', points, {
        ...DEFAULT_ARROW_SEGMENT_ATTRIBUTES,
        strokeColor: color,
        ...attributes,
    });
    return segment;
}