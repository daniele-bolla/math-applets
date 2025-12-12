import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function MVTIntegralProof() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-1, 5, 8, -3],
                axis: true,
                showNavigation: false,
                showZoom: false,
                pan: { enabled: false },
            }}
            setup={(board: JXG.Board) => {
                // ===========================================
                // 1. FUNCTION DEFINITION
                // Using a function similar to Figure 7.4 (wiggly)
                // f(x) = sin(x) + sin(2x)*0.5 + 1.5
                // ===========================================
                const f = (x: number) => Math.sin(x) + Math.sin(2 * x) * 0.5 + 1.5;
                
                // Antiderivative for exact area calculation
                // F(x) = -cos(x) - cos(2x)*0.25 + 1.5x
                const F = (x: number) => -Math.cos(x) - Math.cos(2 * x) * 0.25 + 1.5 * x;

                const curve = board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue, strokeWidth: 3, name: 'f(x)',
                    withLabel: true, label: { position: 'rt', offset: [-10, 10], color: COLORS.blue }
                });

                // ===========================================
                // 2. CONTROLS (Interval [a, b])
                // ===========================================
                
                const xAxis = board.create('line', [[0, 0], [1, 0]], { visible: false });

                const A = board.create('glider', [1, 0, xAxis], {
                    name: 'a', size: 5, color: COLORS.blue, 
                    label: { offset: [0, -15], color: COLORS.blue }
                });

                const B = board.create('glider', [5, 0, xAxis], {
                    name: 'b', size: 5, color: COLORS.blue,
                    label: { offset: [0, -15], color: COLORS.blue }
                });

                // ===========================================
                // 3. CALCULATIONS
                // ===========================================

                const getWidth = () => B.X() - A.X();
                const getArea = () => F(B.X()) - F(A.X());
                
                const getMeanVal = () => {
                    const w = getWidth();
                    if (Math.abs(w) < 0.001) return f(A.X());
                    return getArea() / w;
                };

                // Helper to find Min (m) and Max (M) on [a, b] for the Proof View
                const getExtrema = () => {
                    const start = Math.min(A.X(), B.X());
                    const end = Math.max(A.X(), B.X());
                    let min = Infinity;
                    let max = -Infinity;
                    const steps = 100;
                    for(let i=0; i<=steps; i++) {
                        const x = start + (end-start)*(i/steps);
                        const val = f(x);
                        if (val < min) min = val;
                        if (val > max) max = val;
                    }
                    return { min, max };
                };

                // Helper to find Xi (Intersection of curve and mean height)
                // Simple scan search (IVT logic)
                const getXi = () => {
                    const target = getMeanVal();
                    const start = Math.min(A.X(), B.X());
                    const end = Math.max(A.X(), B.X());
                    const steps = 100;
                    
                    // We just need ONE xi to satisfy the theorem
                    for(let i=0; i<steps; i++) {
                        const x1 = start + (end-start)*(i/steps);
                        const x2 = start + (end-start)*((i+1)/steps);
                        const y1 = f(x1);
                        const y2 = f(x2);
                        
                        // Check for crossing
                        if ((y1 <= target && target <= y2) || (y2 <= target && target <= y1)) {
                            // Linear interp for better precision
                            return x1 + (target - y1) * (x2 - x1) / (y2 - y1);
                        }
                    }
                    return (start + end)/2; // Fallback
                };

                // ===========================================
                // 4. VISUALIZATION LAYERS
                // ===========================================

                // Toggle for Proof View
                const proofCheck = board.create('checkbox', [-0.5, 4, 'Show Proof (Min/Max Squeeze)'], {
                    fixed: true
                });

                // --- INTEGRAL AREA (Green/Blue) ---
                board.create('integral', [[() => A.X(), () => B.X()], curve], {
                    color: COLORS.blue, fillOpacity: 0.1, label: { visible: false }
                });

                // --- PROOF VIEW: MIN/MAX RECTANGLES ---
                // Only visible when checkbox is checked
                
                // Min Rectangle (m)
                board.create('polygon', [
                    [() => A.X(), 0], [() => B.X(), 0],
                    [() => B.X(), () => getExtrema().min], [() => A.X(), () => getExtrema().min]
                ], {
                    fillColor: 'gray', fillOpacity: 0.1, borders: { dash: 2, strokeColor: 'gray' },
                    visible: () => !!proofCheck.Value()
                });
                
                // Max Rectangle (M)
                board.create('polygon', [
                    [() => A.X(), 0], [() => B.X(), 0],
                    [() => B.X(), () => getExtrema().max], [() => A.X(), () => getExtrema().max]
                ], {
                    fillColor: 'gray', fillOpacity: 0.05, borders: { dash: 2, strokeColor: 'gray' },
                    visible: () => !!proofCheck.Value()
                });

                // Labels for m and M
                board.create('text', [() => A.X(), () => getExtrema().min, "m (min)"], { 
                    anchorY: 'top', color: 'gray', visible: () => !!proofCheck.Value() 
                });
                board.create('text', [() => A.X(), () => getExtrema().max, "M (max)"], { 
                    anchorY: 'bottom', color: 'gray', visible: () => !!proofCheck.Value() 
                });


                // --- MVT RECTANGLE (Red - Matching Fig 7.4) ---
                board.create('polygon', [
                    [() => A.X(), 0],
                    [() => B.X(), 0],
                    [() => B.X(), getMeanVal],
                    [() => A.X(), getMeanVal]
                ], {
                    fillColor: COLORS.red, fillOpacity: 0.2, 
                    borders: { strokeWidth: 2, strokeColor: COLORS.red }
                });

                // The Dashed Mean Value Line
                board.create('segment', [
                    [() => A.X(), getMeanVal], [() => B.X(), getMeanVal]
                ], {
                    strokeColor: 'black', strokeWidth: 1, dash: 2
                });

                // --- XI POINT ---
                const xiPoint = board.create('point', [getXi, getMeanVal], {
                    name: 'ξ', color: COLORS.blue, size: 5, fixed: true,
                    label: { offset: [0, 10], color: COLORS.blue, fontSize: 16 }
                });

                // Dotted line down to xi
                board.create('segment', [xiPoint, [() => xiPoint.X(), 0]], {
                    strokeColor: COLORS.blue, dash: 2, strokeWidth: 2
                });


                // ===========================================
                // 5. EXPLANATORY TEXT
                // ===========================================

                board.create('text', [3.5, 4, () => {
                    const mean = getMeanVal().toFixed(2);
                    const area = getArea().toFixed(2);
                    const isProof = !!proofCheck.Value();
                    
                    if (isProof) {
                        const m = getExtrema().min.toFixed(2);
                        const M = getExtrema().max.toFixed(2);
                        return `
                        <div style="font-family:sans-serif; background:white; padding:10px; border:1px solid gray; width:280px">
                           <b>Proof Logic (Squeeze Theorem):</b><br/>
                           m ≤ f(x) ≤ M<br/>
                           ${m} ≤ f(ξ) ≤ ${M}<br/>
                           <br/>
                           The Average Height (<b style="color:${COLORS.red}">${mean}</b>)<br/>
                           is trapped between m and M.<br/>
                           By IVT, the curve MUST cross this height.
                        </div>`;
                    } else {
                        return `
                        <div style="font-family:sans-serif; background:white; padding:10px; border:1px solid ${COLORS.red}; width:250px">
                           <b>Geometric View (Fig 7.4):</b><br/>
                           <span style="color:${COLORS.blue}">Integral Area = ${area}</span><br/>
                           <span style="color:${COLORS.red}">Rectangle Area = ${area}</span><br/>
                           <br/>
                           f(ξ) = ${mean}<br/>
                           At ξ, the curve matches the average height.
                        </div>`;
                    }
                }]);

            }}
        />
    );
}