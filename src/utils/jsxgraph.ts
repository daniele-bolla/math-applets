import JXG from "jsxgraph";

export const COLORS = {
    // Primary colors
    blue: "#2196F3",
    green: "#4CAF50",
    red: "#F44336",
    orange: "#FF9800",
    purple: "#9C27B0",
    cyan: "#00BCD4",
    pink: "#E91E63",

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
    fillColor: COLORS.orange,
    strokeColor: COLORS.darkOrange,
    strokeWidth: 2,
};

export const DEFAULT_POINT_ATTRIBUTES: JXG.PointAttributes = {
    size: 2,
    fillColor: COLORS.blue,
    strokeColor: COLORS.darkBlue,
    strokeWidth: 1,
};

export const DEFAULT_LINE_ATTRIBUTES: JXG.LineAttributes = {
    strokeColor: COLORS.blue,
    strokeWidth: 2,
};

export const DEFAULT_SEGMENT_ATTRIBUTES: JXG.SegmentAttributes = {
    strokeColor: COLORS.blue,
    strokeWidth: 2,
};

export const DEFAULT_FUNCTION_GRAPH_ATTRIBUTES: JXG.FunctionGraphAttributes = {
    strokeColor: COLORS.blue,
    strokeWidth: 2,
};