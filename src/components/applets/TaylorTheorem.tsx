import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

// Helper for factorial
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

export default function TaylorTheoremApplet() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-5, 5, 8, -5],
                axis: true,
                showNavigation: false,
                showZoom: false,
                pan: { enabled: false },
            }}
            setup={(board: JXG.Board) => {
                // ===========================================
                // 1. MATH DEFINITIONS
                // ===========================================
                // f(x) = sin(x) + cos(x)
                const f = (x: number) => Math.sin(x) + Math.cos(x);
                
                // Calculate coefficients: (f^(k)(x0) / k!)
                const getCoeff = (k: number, x0: number) => {
                    const cycle = k % 4;
                    const sin = Math.sin(x0);
                    const cos = Math.cos(x0);
                    let deriv = 0;
                    
                    // Derivatives of sin(x) + cos(x) cycle:
                    // 0: s + c
                    // 1: c - s
                    // 2: -s - c
                    // 3: -c + s
                    switch (cycle) {
                        case 0: deriv = sin + cos; break;
                        case 1: deriv = cos - sin; break;
                        case 2: deriv = -sin - cos; break;
                        case 3: deriv = -cos + sin; break;
                    }
                    return deriv / factorial(k);
                };

                // Taylor Polynomial Function
                const TaylorPoly = (x: number, x0: number, n: number) => {
                    let sum = 0;
                    for (let k = 0; k <= n; k++) {
                        sum += getCoeff(k, x0) * Math.pow(x - x0, k);
                    }
                    return sum;
                };

                // ===========================================
                // 2. PRIMARY OBJECTS
                // ===========================================

                // n Slider (Degree)
                const nSlider = board.create('slider', [[-4, 4], [0, 4], [0, 1, 10]], {
                    name: 'n',
                    snapWidth: 1,
                    precision: 0,
                    fillColor: COLORS.green, // Green because it defines the "Correct" poly
                    strokeColor: COLORS.green,
                    label: { fontSize: 16, color: COLORS.green }
                }) as JXG.Slider;

                // f(x) Curve
                const curve = board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue, strokeWidth: 3,
                    name: 'f(x)', withLabel: true,
                    label: { position: 'rt', offset: [-10, -10], color: COLORS.blue, fontSize: 12 }
                });

                // x0 Glider (Expansion Point)
                const P = board.create('glider', [0, f(0), curve], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'x₀', 
                    size: 5, 
                    color: COLORS.blue, 
                    label: { offset: [0, 10], fontSize: 12, color: COLORS.blue }
                });

                // Q Glider (Wandering x)
                const Q = board.create('glider', [2, f(2), curve], { 
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'x', 
                    size: 5, 
                    color: COLORS.orange,
                    label: { fontSize: 12, offset: [0, -10] }
                });

                // ===========================================
                // 3. TAYLOR POLYNOMIAL VISUALIZATION (Tn)
                // ===========================================
                
                // Note: We use GREEN here because the Taylor Polynomial is 
                // ALWAYS the unique "best" approximation of order n. 
                // Unlike the previous applet, the user doesn't have to find it.
                board.create('functiongraph', [
                    (x: number) => {
                        const x0 = P.X();
                        const n = Math.floor(nSlider.Value());
                        return TaylorPoly(x, x0, n);
                    }, -10, 10
                ], {
                    strokeColor: COLORS.green, 
                    strokeWidth: 3, 
                    dash: 0,
                    name: 'Tₙ(x)', 
                    withLabel: true,
                    label: { position: 'rt', offset: [-10, 10], color: COLORS.green, fontSize: 12 }
                });

                // Label indicating it's the best fit
                board.create('text', [-4.5, 3.5, () => {
                    const n = Math.floor(nSlider.Value());
                    return `
                        <div style="font-family:sans-serif; font-size:12px; color:${COLORS.green}">
                           <b>T<sub>${n}</sub>(x)</b>: Unique Best Approximation of order ${n}
                        </div>
                    `;
                }], { fixed: true });


                // ===========================================
                // 4. REMAINDER VISUALIZATION (Rn)
                // ===========================================
                
                // R(x) Segment (Red to show Error)
                board.create('segment', [
                    Q, 
                    [() => Q.X(), () => {
                        const x0 = P.X();
                        const n = Math.floor(nSlider.Value());
                        return TaylorPoly(Q.X(), x0, n);
                    }]
                ], {
                    strokeColor: 'red', strokeWidth: 3, dash: 2,
                    name: 'Rₙ(x)', withLabel: true, 
                    label: { color: 'red', offset: [10, 0], fontSize: 12 }
                });

                // ===========================================
                // 5. RELATIVE ERROR VISUALIZATION (Purple)
                // ===========================================
                
                // Helper coordinates for x0 + 1
                const getRelErrorX = () => P.X() + 1;
                
                const getPolyYPlus1 = () => {
                    const x0 = P.X();
                    const n = Math.floor(nSlider.Value());
                    // Evaluate Tn at (x0 + 1)
                    return TaylorPoly(x0 + 1, x0, n);
                };

                const getFuncYPlus1 = () => {
                    const x0 = P.X();
                    // Evaluate f at (x0 + 1)
                    return f(x0 + 1);
                };

                // Ghost line connecting P to the visualization bar
                board.create('segment', [
                    P, [getRelErrorX, () => P.Y()]
                ], { strokeColor: COLORS.darkGray, dash: 3, strokeWidth: 1, opacity: 0.3 });

                // The Purple Bar
                // This shows the error magnitude exactly 1 unit away from x0.
                // Since (x - x0)^n = 1 at this point, this visually scales the error coefficient.
                board.create('segment', [
                    [getRelErrorX, getPolyYPlus1],
                    [getRelErrorX, getFuncYPlus1]
                ], {
                    strokeColor: COLORS.purple, 
                    strokeWidth: 4,
                    name: 'Error at x₀+1', 
                    withLabel: true, 
                    label: { color: COLORS.purple, offset: [5, 0], fontSize: 12 }
                });

            }}
        />
    );
}