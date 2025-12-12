import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

// Math Helpers
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const permutation = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0;
    return factorial(n) / factorial(n - k);
};

export default function CompleteProofVisualizer() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-5, 8, 5, -8],
                axis: true,
                showNavigation: false,
                showZoom: false,
                pan: { enabled: false },
            }}
            setup={(board: JXG.Board) => {
                // ===========================================
                // 1. MATH DEFINITIONS
                // f(x) = cos(x) + 0.02 * x^5 * |x|
                // ===========================================
                
                const f = (x: number) => Math.cos(x) + 0.02 * Math.pow(x, 5) * Math.abs(x);

                // N-th derivative of f
                const getDerivF = (n: number, x: number) => {
                    let cosVal = 0;
                    const cycle = n % 4;
                    if (cycle === 0) cosVal = Math.cos(x);
                    else if (cycle === 1) cosVal = -Math.sin(x);
                    else if (cycle === 2) cosVal = -Math.cos(x);
                    else cosVal = Math.sin(x);

                    let polyVal = 0;
                    const N = 6; 
                    if (n <= N) {
                         const sign = x >= 0 ? 1 : -1;
                         const powerRule = permutation(N, n) * Math.pow(x, N - n);
                         polyVal = 0.02 * sign * powerRule;
                    }
                    return cosVal + polyVal;
                };

                // Taylor Polynomial Tn(x) and its derivatives
                const getDerivTn = (k: number, t: number, x0: number, n: number) => {
                    if (k > n) return 0;
                    let sum = 0;
                    for (let j = k; j <= n; j++) {
                        const coeff = getDerivF(j, x0) / factorial(j);
                        const term = coeff * permutation(j, k) * Math.pow(t - x0, j - k);
                        sum += term;
                    }
                    return sum;
                };

                const TaylorPoly = (x: number, x0: number, n: number) => getDerivTn(0, x, x0, n);

                // The Auxiliary Function h(t) derivatives
                // Used to find roots for Rolle's Theorem chain
                const getDerivH = (k: number, t: number, x0: number, x_eval: number, n: number) => {
                    // R_n constant
                    const actual = f(x_eval);
                    const approx = TaylorPoly(x_eval, x0, n);
                    const Rn = actual - approx;

                    // f^(k)(t) - Tn^(k)(t)
                    const term1 = getDerivF(k, t) - getDerivTn(k, t, x0, n);

                    // Correction term derivative
                    const C = Rn / Math.pow(x_eval - x0, n + 1);
                    const term3 = C * permutation(n + 1, k) * Math.pow(t - x0, n + 1 - k);

                    return term1 - term3;
                };

                // ===========================================
                // 2. SETUP OBJECTS
                // ===========================================

                board.create('line', [[0, -10], [0, 10]], {
                    strokeColor: COLORS.lightGray, dash: 2, strokeWidth: 1, fixed: true
                });

                const nSlider = board.create('slider', [[1, -7], [4, -7], [0, 2, 6]], {
                    name: 'n', snapWidth: 1, precision: 0,
                    color: COLORS.green, label: { fontSize: 16, color: COLORS.green }
                });

                // MAIN FUNCTIONS
                const curve = board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue, strokeWidth: 3, name: 'f(x)', 
                    withLabel: true, label: { position: 'rt', offset: [-10, -10], color: COLORS.blue }
                });

                const P = board.create('glider', [-2, f(-2), curve], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'x₀', color: COLORS.blue, size: 6,
                });
                const Q = board.create('glider', [2, f(2), curve], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'x', color: COLORS.orange, size: 6,
                });

                board.create('functiongraph', [
                    (x: number) => TaylorPoly(x, P.X(), Math.floor(nSlider.Value())), -10, 10
                ], {
                    strokeColor: COLORS.green, strokeWidth: 2, name: 'Tₙ(x)',
                });

                // Error Line
                board.create('segment', [
                    Q, [() => Q.X(), () => TaylorPoly(Q.X(), P.X(), Math.floor(nSlider.Value()))]
                ], { strokeColor: COLORS.red, strokeWidth: 3, dash: 2 });


                // ===========================================
                // 3. THE ROLLE'S CHAIN CALCULATOR
                // ===========================================

                const findRoot = (k: number, start: number, end: number) => {
                    const n = Math.floor(nSlider.Value());
                    const steps = 60;
                    for(let i=0; i<steps; i++) {
                        const t1 = start + (end - start)*(i/steps);
                        const t2 = start + (end - start)*((i+1)/steps);
                        const v1 = getDerivH(k, t1, P.X(), Q.X(), n);
                        const v2 = getDerivH(k, t2, P.X(), Q.X(), n);
                        if (v1 * v2 <= 0) {
                            return t1 + (t2 - t1) * (Math.abs(v1) / (Math.abs(v1) + Math.abs(v2)));
                        }
                    }
                    return null;
                };

                const xi_points: (number|null)[] = [];

                const updateChain = () => {
                    const n = Math.floor(nSlider.Value());
                    const x0 = P.X();
                    const x = Q.X();
                    xi_points.length = 0;
                    
                    let currentLimit = x;
                    for(let k=1; k <= n+1; k++) {
                        // Rolle's Theorem guarantees a root between x0 and the previous root
                        const root = findRoot(k, x0, currentLimit);
                        xi_points.push(root);
                        if (root !== null) currentLimit = root;
                        else break; // Chain broken
                    }
                };
                
                board.on('update', updateChain);
                updateChain();

                // ===========================================
                // 4. VISUALIZING THE PROOF "LADDER"
                // ===========================================

                // Text Header
                board.create('text', [-4.5, -0.5, "Proof Chain (Rolle's Theorem):"], { fontSize: 12, color: 'gray' });

                for(let k=0; k<7; k++) {
                    const yPos = () => -1.5 - (k * 0.7);
                    
                    // The Dot
                    board.create('point', [
                        () => {
                            if (k < xi_points.length && xi_points[k] !== null) return xi_points[k];
                            return P.X() + (Q.X() - P.X()) * 0.5; // Center if fail
                        },
                        yPos
                    ], {
                        name: '',
                        size: 4,
                        fixed: true,
                        face: () => {
                             const n = Math.floor(nSlider.Value());
                             if (k >= n+1) return 'o'; 
                             if (k < xi_points.length && xi_points[k] !== null) return 'o';
                             return 'x'; // Failed
                        },
                        color: () => {
                            const n = Math.floor(nSlider.Value());
                            if (k >= n+1) return 'none'; // Invisible
                            if (k < xi_points.length && xi_points[k] !== null) return COLORS.green;
                            return COLORS.red;
                        },
                        strokeColor: () => {
                             const n = Math.floor(nSlider.Value());
                             if (k >= n+1) return 'none';
                             return ''; 
                        },
                        visible: () => {
                             const n = Math.floor(nSlider.Value());
                             return k < n+1;
                        }
                    });

                    // The Intervals (Visualizing the "Squeeze")
                    // Line from x0 to the previous limit
                    board.create('segment', [
                        [() => P.X(), yPos],
                        [() => {
                            if (k === 0) return Q.X();
                            if (k-1 < xi_points.length && xi_points[k-1] !== null) return xi_points[k-1];
                            return P.X();
                        }, yPos]
                    ], {
                        strokeColor: COLORS.lightGray, dash: 3, strokeWidth: 1,
                        visible: () => {
                             const n = Math.floor(nSlider.Value());
                             return k < n+1;
                        }
                    });

                    // Label
                    board.create('text', [
                        -4.5, yPos, 
                        () => {
                            const n = Math.floor(nSlider.Value());
                            if (k >= n+1) return "";
                            const label = k === n ? `<b>Final ξ</b>` : `ξ<sub>${k+1}</sub>`;
                            return `${label} (h<sup>(${k+1})</sup>=0)`;
                        }
                    ], { anchorY:'middle', fontSize:11, color: 'gray' });
                }

            }}
        />
    );
}