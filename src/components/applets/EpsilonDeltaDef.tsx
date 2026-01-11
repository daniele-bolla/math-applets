import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
    COLORS,
    createFunctionGraph,
    createGlider,
    createPoint,
    createLine
} from "../../utils/jsxgraph";

export default function EpsilonDeltaDefApplet() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-3, 5, 5.5, -2],
                axis: true,
            }}
            setup={(board: JXG.Board) => {

                // Function
                const DISCONTINUITY = 1.25;

                const f = (x: number) => {
                    if (x < DISCONTINUITY) {
                        return Math.pow(x, 3) * 0.3;
                    } else {
                        return Math.pow(x, 2);
                    }
                };

                
                // Function graph
                createFunctionGraph(board, f, [-10, 10], {
                    strokeWidth: 2,
                }, COLORS.blue);

                // a glider
                const pointA = createGlider(board, [DISCONTINUITY, 0, board.defaultAxes.x], {
                    name: 'a',
                    face: '<>',
                }, COLORS.pink);

                // Point (a, f(a))
                const fpointA = createPoint(board,
                    [() => pointA.X(), () => f(pointA.X())],
                    {
                        name: '',
                        size: 2,
                        fixed: true,
                    },
                    COLORS.black
                );

                // Vertical line from a to f(a)
                createLine(board, [pointA, fpointA], {
                    dash: 2,
                    straightFirst: false,
                    straightLast: false,
                    strokeWidth: 1,
                }, COLORS.black);

                // Point (0, f(a))
                const pointYfpointA = createPoint(board,
                    [0, () => f(pointA.X())],
                    {
                        name: '',
                        size: 2,
                        fixed: true,
                    },
                    COLORS.black
                );

                // Horizontal line from (a, f(a)) to (0, f(a))
                createLine(board, [fpointA, pointYfpointA], {
                    dash: 2,
                    straightFirst: false,
                    straightLast: false,
                    strokeWidth: 1,
                }, COLORS.black);

                // ===== EPSILON =====
                // Helper line for epsilon glider (vertical)
                const epsLine = createLine(board,
                    [() => [0, f(pointA.X())], () => [0, f(pointA.X()) + 2.5]],
                    {
                        visible: false,
                        straightFirst: false,
                        straightLast: false
                    }
                );

                // Epsilon glider
                const epsPoint = createGlider(board,
                    [1, f(pointA.X()) + 0.5, epsLine],
                    {
                        name: 'f(a)+ε',
                        face: '<>',
                    },
                    COLORS.green
                );

                const getEpsilon = () => Math.abs(epsPoint.Y() - f(pointA.X()));

                // ε line (green)
                createLine(board, [pointYfpointA, epsPoint], {
                    straightFirst: false,
                    straightLast: false,
                    strokeWidth: 3,
                }, COLORS.green);

                // Line (a + ε)
                createLine(board,
                    [() => [0, epsPoint.Y()], () => [1, epsPoint.Y()]],
                    {
                        strokeWidth: 2,
                        dash: 2,
                    },
                    COLORS.green
                );

                // Line (a - ε)
                createLine(board,
                    [() => [0, f(pointA.X()) - getEpsilon()], () => [1, f(pointA.X()) - getEpsilon()]],
                    {
                        strokeWidth: 2,
                        dash: 2,
                    },
                    COLORS.green
                );

                // ===== DELTA =====
                // Helper line for delta glider (horizontal)
                const deltaLine = createLine(board,
                    [() => [pointA.X(), 0], () => [pointA.X() + 1.5, 0]],
                    {
                        visible: false,
                        straightFirst: false,
                        straightLast: false
                    }
                );

                // Delta glider
                const deltaPoint = createGlider(board,
                    [pointA.X() + 0.75, 0, deltaLine],
                    {
                        name: 'a+δ',
                        face: '<>',
                    },
                    COLORS.orange
                );

                const getDelta = () => Math.abs(deltaPoint.X() - pointA.X());

                // Line (a+δ)
                createLine(board,
                    [() => [deltaPoint.X(), 0], () => [deltaPoint.X(), 1]],
                    {
                        strokeWidth: 2,
                        dash: 2,
                    },
                    COLORS.orange
                );

                // Line (a - ε)
                createLine(board,
                    [() => [0, pointA.X() - getDelta()], () => [1, pointA.X() - getDelta()]],
                    {
                        strokeWidth: 2,
                        dash: 2,
                    },
                    COLORS.orange
                );

                // δ line (orange)
                createLine(board, [pointA, deltaPoint], {
                    straightFirst: false,
                    straightLast: false,
                    strokeWidth: 3,
                }, COLORS.orange);

                // ===== POINT X =====
                // Line for x glider (constrained to delta neighborhood)
                const xLine = createLine(board,
                    [() => [pointA.X() - getDelta(), 0], () => [deltaPoint.X(), 0]],
                    {
                        visible: false,
                        straightFirst: false,
                        straightLast: false
                    }
                );

                // x glider
                const xPoint = createGlider(board,
                    [pointA.X() + getDelta() / 2, 0, xLine],
                    {
                        name: 'x',
                        face: "<>",
                    },
                    COLORS.blue
                );

                // Point (x, f(x))
                const fxPoint = createPoint(board,
                    [() => xPoint.X(), () => f(xPoint.X())],
                    {
                        name: '',
                        size: 2,
                        fixed: true,
                    },
                    COLORS.black
                );

                // Point (0, f(x))
                const point0fx = createPoint(board,
                    [0, () => f(xPoint.X())],
                    {
                        name: 'f(x)',
                        size: 2,
                        fixed: true,
                    },
                    COLORS.black
                );

                // Vertical line from x to f(x)
                createLine(board, [xPoint, fxPoint], {
                    dash: 2,
                    straightFirst: false,
                    straightLast: false,
                    strokeWidth: 1,
                }, COLORS.black);

                // Horizontal line from f(x) to y-axis
                createLine(board, [fxPoint, point0fx], {
                    dash: 2,
                    straightFirst: false,
                    straightLast: false,
                    strokeWidth: 1,
                }, COLORS.black);

                // ===== CONDITION CHECK =====
                // |x - a| line (blue)
                createLine(board, [pointA, xPoint], {
                    straightFirst: false,
                    straightLast: false,
                    strokeWidth: 3,
                }, COLORS.blue);

                // |f(x) - f(a)| line (changes color)
                createLine(board, [pointYfpointA, point0fx], {
                    straightFirst: false,
                    straightLast: false,
                    strokeWidth: 3,
                }, () => {
                    const epsilon = getEpsilon();
                    const dist = Math.abs(point0fx.Y() - pointYfpointA.Y());
                    return dist < epsilon ? COLORS.green : COLORS.red;
                });

            }}
        />
    );
}