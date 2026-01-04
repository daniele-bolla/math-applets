import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
    COLORS,
    createFunctionGraph,
    createGlider,
    createPoint,
    createSecant,
    createDashedSegment
} from "../../utils/jsxgraph";

export default function MeanValueTheoremApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 5, 5, -1], axis: true }}
            setup={(board: JXG.Board) => {

                const f = (x: number) => 0.2 * x * x * x - 0.5 * x * x + 2;
                // const fPrime = (x: number) => 0.6 * x * x - x;

                createFunctionGraph(board, f, [-10, 10]);

                const intervalABLimits = board.create('segment', [[-6.5, 0], [6.5, 0]], {
                    visible: false,
                    fixed: true,
                });

                const pointA = createGlider(board, [0.5, 0, intervalABLimits], {
                    name: 'a',
                }, COLORS.green);

                const pointB = createGlider(board, [3.5, 0, intervalABLimits], {
                    name: 'b',
                }, COLORS.red);

                const pointFA = createPoint(board,
                    [() => pointA.X(), () => f(pointA.X())],
                    {
                        name: 'f(a)',
                        fixed: true,
                    },
                    COLORS.green
                );

                const pointFB = createPoint(board,
                    [() => pointB.X(), () => f(pointB.X())],
                    {
                        name: 'f(b)',
                        fixed: true,
                    },
                    COLORS.red
                );

                const secant = createSecant(board, [pointFA, pointFB], {}, COLORS.red);

                function findC(): number {
                    const a = pointA.X();
                    const b = pointB.X();
                    const fa = f(a);
                    const fb = f(b);
                    const secantSlope = (fb - fa) / (b - a);
                    // Solve: 0.6c² - c = secantSlope
                    // 0.6c² - c - secantSlope = 0
                    // Using quadratic formula: c = (1 ± √(1 + 4*0.6*secantSlope)) / (2*0.6)
                    const discriminant = 1 + 4 * 0.6 * secantSlope;
                    if (discriminant < 0) {
                        return NaN; // No real solution
                    }
                    const cPos = (1 + Math.sqrt(discriminant)) / (2 * 0.6);
                    const cNeg = (1 - Math.sqrt(discriminant)) / (2 * 0.6);
                    const minAB = Math.min(a, b);
                    const maxAB = Math.max(a, b);
                    // Return the root that's in [a, b]
                    if (cPos >= minAB && cPos <= maxAB) {
                        return cPos;
                    } else if (cNeg >= minAB && cNeg <= maxAB) {
                        return cNeg;
                    } else {
                        return NaN;
                    }
                }

                const pointConX = createPoint(board,
                    [() => findC(), () => 0],
                    {
                        name: 'c',
                        fixed: true,
                    },
                    COLORS.purple
                );

                const pointC = createPoint(board,
                    [() => findC(), () => f(findC())],
                    {
                        name: 'f(c)',
                        fixed: true,
                    },
                    COLORS.purple
                );

                board.create('parallel', [secant, pointC], {
                    strokeColor: COLORS.purple,
                    strokeWidth: 3,
                    straightFirst: true,
                    straightLast: true,
                });

                createDashedSegment(board,
                    [() => [pointA.X(), 0], pointFA],
                    {},
                    COLORS.green
                );

                createDashedSegment(board,
                    [() => [pointB.X(), 0], pointFB],
                    {},
                    COLORS.red
                );

                createDashedSegment(board,
                    [pointConX, pointC],
                    {},
                    COLORS.purple
                );

            }}
        />
    );
}
