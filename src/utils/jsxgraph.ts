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
    size: 8,
    strokeWidth: 2,
    highlight: false,
};

export const DEFAULT_POINT_ATTRIBUTES: JXG.PointAttributes = {
    name: "",
    size: 1,
    strokeWidth: 1,
    fixed: true,
        highlight: false,

};

export const DEFAULT_LINE_ATTRIBUTES: JXG.LineAttributes = {
    strokeWidth: 1,
    highlight: false,
    fixed: true

};

export const DEFAULT_SEGMENT_ATTRIBUTES: JXG.SegmentAttributes = {
    strokeWidth: 1,    highlight: false,
    fixed: true

};

export const DEFAULT_FUNCTION_GRAPH_ATTRIBUTES: JXG.FunctiongraphAttributes = {
    strokeColor: COLORS.blue,
    strokeWidth: 2,
    highlight: false,
    fixed: true
};

export const DEFAULT_SECANT_ATTRIBUTES: JXG.LineAttributes = {
    strokeColor: COLORS.red,
    strokeWidth: 2,
    dash: 2,
    straightFirst: true,
    straightLast: true,
    highlight: false,
    fixed: true


};

export const DEFAULT_TANGENT_ATTRIBUTES: JXG.LineAttributes = {
    strokeColor: COLORS.purple,
    strokeWidth: 2,
    straightFirst: true,
    straightLast: true,
    highlight: false,
    fixed: true
};

export const DEFAULT_DASHED_SEGMENT_ATTRIBUTES: JXG.SegmentAttributes = {
    strokeColor: COLORS.gray,
    strokeWidth: 1,
    dash: 2,
    highlight: false,
    fixed: true
};

export const DEFAULT_ARROW_SEGMENT_ATTRIBUTES: JXG.SegmentAttributes = {
    strokeColor: COLORS.orange,
    strokeWidth: 1,
    lastArrow: true,
    highlight: false,
    fixed: true
};

export const DEFAULT_POLYGON_ATTRIBUTES: JXG.PolygonAttributes = {
    fillColor: COLORS.blue,
    fillOpacity: 0.2,
    borders: { strokeWidth: 1 },
    vertices: { visible: false },
    highlight: false,
    fixed: true
};

export const DEFAULT_INTEGRAL_ATTRIBUTES: JXG.IntegralAttributes = {
    color: COLORS.blue,
    fillOpacity: 0.2,
    isLabel: false,
    highlight: false,
    withLabel: false,
    fixed: true
};

export const DEFAULT_TEXT_ATTRIBUTES: JXG.TextAttributes = {
    fontSize: 12,
    color: COLORS.black,
    fixed: true
    
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
        label: { position: "rt", offset: [-10, -10], color, fontSize: 12 },
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
                label: { position: "rt", offset: [-10, -10], color, fontSize: 12 },

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
        label: { position: "rt", offset: [-10, -10], color, fontSize: 12 },
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
        strokeColor: color,
        label: { position: "rt", offset: [-10, -10], color, fontSize: 12 },
        ...attributes,
    });
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
        strokeColor: color,
        label: { position: "rt", offset: [-10, -10], color, fontSize: 12 },
        ...attributes,
    });
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
        strokeColor: color,
        label: { position: "rt", offset: [-10, -10], color, fontSize: 12 },
        ...attributes,
    });
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
        label: { position: "rt", offset: [-10, -10], color, fontSize: 12 },
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

export function createPolygon(
    board: JXG.Board,
    points: (JXG.Point | Coord)[],
    attributes: Partial<JXG.PolygonAttributes> = {},
    color: string | (() => string) = COLORS.blue
) {
    const polygon = board.create('polygon', points, {
        ...DEFAULT_POLYGON_ATTRIBUTES,
        fillColor: color,
        ...attributes,
    });
    return polygon;
}

export function createIntegral(
    board: JXG.Board,
    interval: [number | (() => number), number | (() => number)],
    functionGraph: JXG.Functiongraph,
    attributes: Partial<JXG.IntegralAttributes> = {},
    color: string | (() => string) = COLORS.blue
) {
    const integral = board.create('integral', [interval, functionGraph], {
        ...DEFAULT_INTEGRAL_ATTRIBUTES,
        color: color,
        ...attributes,
    });
    return integral;
}

export const DEFAULT_CURVE_ATTRIBUTES: JXG.CurveAttributes = {
    strokeWidth: 2,
    highlight: false,
};

export function createCurve(
    board: JXG.Board,
    dataFunction: [(() => number[]), (() => number[])],
    attributes: Partial<JXG.CurveAttributes> = {},
    color?: string | (() => string)
) {
    const curve = board.create('curve', dataFunction, {
        ...DEFAULT_CURVE_ATTRIBUTES,
        ...(color ? { strokeColor: color } : {}),
        ...attributes,
    });
    return curve;
}

export const createButton = (
    board: JXG.Board,
    x: number | (() => number),
    y: number | (() => number),
    label: string,
    onClick: () => void,
    color: string
) => {
            const btnStyle =
    "padding: 2px 4px; border-radius: 4px; cursor: pointer; user-select: none;";
    return board.create(
    "button",
    [x, y, label, onClick],
    {
        fixed: true,
        strokeColor: color,
    cssStyle: `${btnStyle} color: #E65100; background-color: #fff3e0;`,
    }
    ) as JXG.Button;
};