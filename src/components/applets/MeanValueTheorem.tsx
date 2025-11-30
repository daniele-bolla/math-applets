import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES, DEFAULT_POINT_ATTRIBUTES } from "../../utils/jsxgraph";

export default function MeanValueTheoremApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 5, 5, -1], axis: true }}
            setup={(board: JXG.Board) => {

                const f = (x: number) => 0.2 * x * x * x - 0.5 * x * x + 2;
                // const fPrime = (x: number) => 0.6 * x * x - x;

                board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue,
                    strokeWidth: 3,
                });

                const intervalABLimits = board.create('segment', [[-6.5, 0], [6.5, 0]], {
                    visible: false,
                    fixed: true,
                });

                const pointA = board.create('glider', [0.5, 0, intervalABLimits], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'a',
                    face: '<>',
                    size: 6,
                    fillColor: COLORS.green,
                    strokeColor: COLORS.darkGreen,
                });

                const pointB = board.create('glider', [3.5, 0, intervalABLimits], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'b',
                    face: '<>',
                    size: 6,
                    fillColor: COLORS.red,
                    strokeColor: COLORS.darkRed,
                });

                const pointFA = board.create('point', [
                    () => pointA.X(),
                    () => f(pointA.X())
                ], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: 'f(a)',
                    size: 2,
                    fillColor: COLORS.green,
                    strokeColor: COLORS.darkGreen,
                    fixed: true,
                });

                const pointFB = board.create('point', [
                    () => pointB.X(),
                    () => f(pointB.X())
                ], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: 'f(b)',
                    size: 2,
                    fillColor: COLORS.red,
                    strokeColor: COLORS.darkRed,
                    fixed: true,
                });

                const secant = board.create('line', [pointFA, pointFB], {
                    strokeColor: COLORS.red,
                    strokeWidth: 2,
                    dash: 2,
                    straightFirst: true,
                    straightLast: true,
                });

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

                const pointConX = board.create('point', [
                    () => findC(),
                    () => 0
                ], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: 'c',
                    size: 2,
                    fillColor: COLORS.purple,
                    strokeColor: COLORS.darkPurple,
                    fixed: true,
                });
                const pointC = board.create('point', [
                    () => findC(),
                    () => f(findC())
                ], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: 'f(c)',
                    size: 2,
                    fillColor: COLORS.purple,
                    strokeColor: COLORS.darkPurple,
                    fixed: true,
                });

                board.create('parallel', [secant, pointC], {
                    strokeColor: COLORS.purple,
                    strokeWidth: 3,
                    straightFirst: true,
                    straightLast: true,
                });

                board.create('segment', [
                    [() => pointA.X(), 0],
                    pointFA
                ], {
                    strokeColor: COLORS.green,
                    strokeWidth: 1,
                    dash: 2,
                });

                board.create('segment', [
                    [() => pointB.X(), 0],
                    pointFB
                ], {
                    strokeColor: COLORS.red,
                    strokeWidth: 1,
                    dash: 2,
                });

                board.create('segment', [
                    pointConX,
                    pointC
                ], {
                    strokeColor: COLORS.purple,
                    strokeWidth: 1,
                    dash: 2,
                });

            }}
        />
    );
}
