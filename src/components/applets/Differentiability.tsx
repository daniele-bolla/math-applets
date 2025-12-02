import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES, DEFAULT_POINT_ATTRIBUTES } from "../../utils/jsxgraph";

export default function DifferentiabilityApplet() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-5, 8, 8, -5],
                axis: true,
                showNavigation: false,
                pan: { enabled: false },
                zoom: { enabled: false },
            }}
            setup={(board: JXG.Board) => {
                // 1. Define Function and Derivative
                // f(x) = 1/4 x^3 - 1.5x + 2
                const f = (x: number) => 0.25 * Math.pow(x, 3) - 1.5 * x + 2;
                const df = (x: number) => 0.75 * Math.pow(x, 2) - 1.5;

                // 2. Sliders
                const x0Slider = board.create('slider', [[1, -4], [6, -4], [-3, 1, 4]], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'x₀',
                    snapWidth: 0.1,
                    fillColor: COLORS.gray,
                    strokeColor: COLORS.black,
                });

                const mSlider = board.create('slider', [[1, -3], [6, -3], [-5, 1, 5]], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'm',
                    snapWidth: 0.1,
                    fillColor: COLORS.pink,
                    strokeColor: COLORS.pink,
                    label: { color: COLORS.pink }
                });

                // Helper to check if m is close to f'(x0)
                const isBestApprox = () => {
                    const x0 = x0Slider.Value();
                    const m = mSlider.Value();
                    const actualSlope = df(x0);
                    return Math.abs(m - actualSlope) < 0.2; // Tolerance
                };

                // 3. The Function Graph f(x)
                const curve = board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue, strokeWidth: 3,
                    name: 'f(x)', withLabel: true,
                    label: { position: 'rt', offset: [-10, -10], color: COLORS.blue }
                });

                // 4. Base Point P
                const P = board.create('point', [
                    () => x0Slider.Value(),
                    () => f(x0Slider.Value())
                ], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: 'x₀', size: 4, color: COLORS.blue, fixed: true, 
                    label: { offset: [0, 10] }
                });

                // 5. The Linear Approximation t(x)
                // Color changes dynamically (Pink -> Green)
                board.create('functiongraph', [
                    (x: number) => {
                        const x0 = x0Slider.Value();
                        const y0 = f(x0);
                        const m = mSlider.Value();
                        return y0 + m * (x - x0);
                    }, -10, 10
                ], {
                    strokeColor: () => isBestApprox() ? COLORS.green : COLORS.pink,
                    strokeWidth: () => isBestApprox() ? 4 : 2,
                    dash: 0,
                    name: 't(x)', withLabel: true,
                    label: { position: 'rt', offset: [-10, 10], color: COLORS.pink }
                });

                // 6. The "Wandering" Point Q (x)
                const Q = board.create('glider', [2, f(2), curve], { 
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: 'x', size: 5, color: COLORS.orange,
                });

                // 7. ABSOLUTE ERROR R(x) (Green segment)
                board.create('segment', [
                    Q,
                    [() => Q.X(), () => {
                        const x0 = x0Slider.Value();
                        const m = mSlider.Value();
                        return f(x0) + m * (Q.X() - x0);
                    }]
                ], {
                    strokeColor: COLORS.green, strokeWidth: 3, dash: 2,
                    name: 'R(x)', withLabel: true, label: { color: COLORS.green, offset: [10, 0] }
                });

                // 8. RELATIVE ERROR VISUALIZATION (Purple Bar)
                
                // 8a. Faint Secant Line (To show what the purple bar connects to)
                board.create('line', [P, Q], {
                    strokeColor: COLORS.darkGray, strokeWidth: 1, dash: 3, opacity: 0.15
                });

                // 8b. The Purple Bar at x0 + 1
                const RelErrorX = () => x0Slider.Value() + 1;

                const Y_Tangent_Plus1 = () => {
                    const x0 = x0Slider.Value();
                    const m = mSlider.Value();
                    return f(x0) + m; 
                };

                const Y_Secant_Plus1 = () => {
                    const x0 = x0Slider.Value();
                    const x = Q.X();
                    const dx = x - x0;
                    // Avoid division by zero when x is very close to x0
                    if (Math.abs(dx) < 0.001) return f(x0) + mSlider.Value(); 
                    
                    const secantSlope = (f(x) - f(x0)) / dx;
                    return f(x0) + secantSlope;
                };

                board.create('segment', [
                    [RelErrorX, Y_Tangent_Plus1],
                    [RelErrorX, Y_Secant_Plus1]
                ], {
                    strokeColor: 'purple', strokeWidth: 4,
                    name: 'Rel. Error', withLabel: true, label: { color: 'purple', offset: [5, 0] }
                });

                // 9. "Snap to Derivative" Button
                board.create('button', [-4.5, -4, 'Set m = f\'(x₀)', () => {
                    const exactM = df(x0Slider.Value());
                    mSlider.setValue(exactM);
                }]);
            }}
        />
    );
}