import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
    COLORS,
    DEFAULT_GLIDER_ATTRIBUTES,
    createFunctionGraph,
    createGlider,
    createSlider,
    createSegment,
    createLine
} from "../../utils/jsxgraph";

export default function DifferentiabilityApplet() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-5, 12, 12, -5],
            }}
            setup={(board: JXG.Board) => {

                const f = (x: number) => 0.25 * Math.pow(x, 3) - 1.5 * x + 2;
                const df = (x: number) => 0.75 * Math.pow(x, 2) - 1.5;
                
                // The Function Graph
                const curve = createFunctionGraph(board, f, [-10, 10], {
                    name: 'f(x)',
                    withLabel: true,
                    label: { position: 'rt', offset: [-10, -10], color: COLORS.blue, fontSize: 12 }
                }, COLORS.blue);

                // Point P (x0)
                const P = createGlider(board, [1, f(1), curve], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'x₀',
                    label: { offset: [0, 10], fontSize: 12, color: COLORS.blue }
                }, COLORS.blue);

                // Slider for Slope (m)
                const mSlider = createSlider(board, [1, -4], [6, -4], [-5, -1.8, 5], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'm',
                    snapWidth: 0.1,
                    label: { color: COLORS.pink, offset: [0, 10] }
                }) as JXG.Slider;

                // Point Q (x)
                const Q = createGlider(board, [3, f(3), curve], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'x',
                }, COLORS.orange);

                const getX0 = () => P.X();
                const getY0 = () => P.Y(); // f(x0)
                const getM = () => mSlider.Value();
                
                // Calculates y for the Tangent Line: y = y0 + m(x - x0)
                const tangentFunc = (x: number) => getY0() + getM() * (x - getX0());

                // Check if current m is a good approximation of f'(x0)
                const isBestApprox = () => Math.abs(getM() - df(getX0())) < 0.2;

                //Linear function L(x) becoming the tangent line t(x) at P
                createFunctionGraph(board, tangentFunc, [-10, 10], {
                    name: 'L(x)', 
                    withLabel: true,
                    label: { position: 'rt', offset: [-10, 10], color: COLORS.pink, fontSize: 12 },
                    strokeWidth: () => isBestApprox() ? 4 : 2
                }, () => isBestApprox() ? COLORS.green : COLORS.pink);


                // R(x) = f(x) - t(x)
                createSegment(board, [
                    Q,
                    [() => Q.X(), () => tangentFunc(Q.X())]
                ], {
                    dash: 2,
                    name: 'R(x)',
                    withLabel: true,
                    label: { color: COLORS.green, offset: [10, 0], fontSize: 12 }
                }, COLORS.green);


                // Ghost Secant Line
                createLine(board, [P, Q], {
                    strokeWidth: 1,
                    dash: 3,
                    opacity: 0.15
                }, COLORS.darkGray);

                // Display Rel Error
                const getRelErrorX = () => getX0() + 1;

                const getTangentYPlus1 = () => getY0() + getM();

                const getSecantYPlus1 = () => {
                    const dx = Q.X() - getX0();
                    if (Math.abs(dx) < 0.001) return getY0() + getM();

                    const secantSlope = (Q.Y() - getY0()) / dx;
                    return getY0() + secantSlope;
                };

                createSegment(board, [
                    [getRelErrorX, getTangentYPlus1],
                    [getRelErrorX, getSecantYPlus1]
                ], {
                    strokeWidth: 4,
                    name: 'Rel. Err',
                    withLabel: true,
                    label: { color: COLORS.purple, offset: [5, 0], fontSize: 12 }
                }, COLORS.purple);
            }}
        />
    );
}