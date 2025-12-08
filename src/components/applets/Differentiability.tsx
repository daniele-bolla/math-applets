import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function DifferentiabilityApplet() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-5, 8, 8, -5],
                axis: true,
                showNavigation: false,
                showZoom: false,
                pan: { enabled: false },
            }}
            setup={(board: JXG.Board) => {

                const f = (x: number) => 0.25 * Math.pow(x, 3) - 1.5 * x + 2;
                const df = (x: number) => 0.75 * Math.pow(x, 2) - 1.5;
                
                // The Function Graph
                const curve = board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue, 
                    strokeWidth: 3,
                    name: 'f(x)', 
                    withLabel: true,
                    label: { position: 'rt', offset: [-10, -10], color: COLORS.blue, fontSize: 12 }
                });

                // Point P (x0)
                const P = board.create('glider', [1, f(1), curve], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'x₀', 
                    size: 5, 
                    color: COLORS.blue, 
                    label: { offset: [0, 10], fontSize: 12, color: COLORS.blue }
                });

                // Slider for Slope (m)
                const mSlider = board.create('slider', [[1, -4], [6, -4], [-5, 1, 5]], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'm',
                    snapWidth: 0.1,
                    fillColor: COLORS.pink,
                    strokeColor: COLORS.pink,
                    label: { color: COLORS.pink, offset: [0, 10] }
                }) as JXG.Slider;

                // Point Q (x) 
                const Q = board.create('glider', [2, f(2), curve], { 
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'x', 
                    size: 5, 
                    color: COLORS.orange,
                    label: { fontSize: 12, offset: [0, -10] }
                });

                const getX0 = () => P.X();
                const getY0 = () => P.Y(); // f(x0)
                const getM = () => mSlider.Value();
                
                // Calculates y for the Tangent Line: y = y0 + m(x - x0)
                const tangentFunc = (x: number) => getY0() + getM() * (x - getX0());

                // Check if current m is a good approximation of f'(x0)
                const isBestApprox = () => Math.abs(getM() - df(getX0())) < 0.2;

                board.create('functiongraph', [tangentFunc, -10, 10], {
                    strokeColor: () => isBestApprox() ? COLORS.green : COLORS.pink,
                    strokeWidth: () => isBestApprox() ? 4 : 2,
                    dash: 0,
                    name: 't(x)', 
                    withLabel: true,
                    label: { position: 'rt', offset: [-10, 10], color: COLORS.pink, fontSize: 12 }
                });


                // R(x) = f(x) - t(x)
                board.create('segment', [
                    Q,
                    [() => Q.X(), () => tangentFunc(Q.X())]
                ], {
                    strokeColor: COLORS.green, 
                    strokeWidth: 3, 
                    dash: 2,
                    name: 'R(x)', 
                    withLabel: true, 
                    label: { color: COLORS.green, offset: [10, 0], fontSize: 12 }
                });

                
                // Ghost Secant Line
                board.create('line', [P, Q], {
                    strokeColor: COLORS.darkGray, strokeWidth: 1, dash: 3, opacity: 0.15
                });

                // Display Rel Error
                const getRelErrorX = () => getX0() + 1;
                
                const getTangentYPlus1 = () => getY0() + getM();

                const getSecantYPlus1 = () => {
                    const dx = Q.X() - getX0();
                    if (Math.abs(dx) < 0.001) return getY0() + getM();
                    
                    const secantSlope = (Q.Y() - getY0()) / dx;
                    return getY0() + secantSlope;
                };

                board.create('segment', [
                    [getRelErrorX, getTangentYPlus1],
                    [getRelErrorX, getSecantYPlus1]
                ], {
                    strokeColor: COLORS.purple, 
                    strokeWidth: 4,
                    name: 'Rel. Err', 
                    withLabel: true, 
                    label: { color: COLORS.purple, offset: [5, 0], fontSize: 12 }
                });
            }}
        />
    );
}