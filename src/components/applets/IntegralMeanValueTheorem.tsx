import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function MVTIntegralOptimized() {
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
                // 1. MATH DEFINITIONS
                // ===========================================
                const f = (x: number) => Math.sin(x) + Math.sin(2 * x) * 0.5 + 1.5;
                const F = (x: number) => -Math.cos(x) - Math.cos(2 * x) * 0.25 + 1.5 * x;

                const curve = board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue, strokeWidth: 3, name: 'f(x)',
                    withLabel: true, label: { position: 'rt', offset: [-10, 10], color: COLORS.blue }
                });

                // ===========================================
                // 2. CONTROLS
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
                // 3. MEAN VALUE CALCULATION
                // ===========================================

                const getMeanVal = () => {
                    const w = B.X() - A.X();
                    if (Math.abs(w) < 0.001) return f(A.X());
                    return (F(B.X()) - F(A.X())) / w;
                };

                const getExtrema = () => {
                    const start = Math.min(A.X(), B.X());
                    const end = Math.max(A.X(), B.X());
                    // Keep the sampling for min/max as there isn't a simple built-in range extrema
                    let min = Infinity;
                    let max = -Infinity;
                    const steps = 100;
                    for(let i=0; i<=steps; i++) {
                        const val = f(start + (end-start)*(i/steps));
                        if (val < min) min = val;
                        if (val > max) max = val;
                    }
                    return { min, max };
                };

                // ===========================================
                // 4. INTERSECTION LOGIC (Built-in)
                // ===========================================

                // Create an invisible horizontal line at the Mean Height
                const meanLine = board.create('line', [
                    [0, getMeanVal], [1, getMeanVal]
                ], { visible: false });

                // Find intersection between Curve and MeanLine
                // 'intersection' returns a point object that automatically updates
                // The 3rd argument '0' creates the intersection, '1' would be the second one, etc.
                // However, intersections on FunctionGraphs are tricky because there can be many.
                // A more robust way for general x ranges is a Glider constrained to intersection logic.
                
                // Better Approach for dynamic range:
                // We create a point defined by specific coordinates that calculates the root on the fly
                // This mimics the 'intersection' behavior but ensures we pick a root strictly between A and B
                
                const xiPoint = board.create('point', [
                    () => {
                        const target = getMeanVal();
                        // JXG.Math.Numerics.root finds x where (f(x) - target = 0)
                        // We search specifically between A and B
                        const root = JXG.Math.Numerics.root(
                            (x: number) => f(x) - target,
                            (A.X() + B.X()) / 2 // Initial guess: midpoint
                        );
                        return root;
                    },
                    getMeanVal
                ], {
                    name: 'ξ', color: COLORS.blue, size: 5, fixed: true,
                    label: { offset: [0, 10], color: COLORS.blue, fontSize: 16 }
                });


                // ===========================================
                // 5. VISUALIZATION
                // ===========================================

                // Integral Area
                board.create('integral', [[() => A.X(), () => B.X()], curve], {
                    color: COLORS.blue, fillOpacity: 0.1, label: { visible: false }
                });

                // PROOF BOUNDARIES (m and M)
                board.create('segment', [[() => A.X(), () => getExtrema().min], [() => B.X(), () => getExtrema().min]], { strokeColor: 'gray', dash: 2 });
                board.create('text', [() => A.X(), () => getExtrema().min, "m"], { anchorY: 'top', color: 'gray' });

                board.create('segment', [[() => A.X(), () => getExtrema().max], [() => B.X(), () => getExtrema().max]], { strokeColor: 'gray', dash: 2 });
                board.create('text', [() => A.X(), () => getExtrema().max, "M"], { anchorY: 'bottom', color: 'gray' });

                board.create('polygon', [
                    [() => A.X(), () => getExtrema().min], [() => B.X(), () => getExtrema().min],
                    [() => B.X(), () => getExtrema().max], [() => A.X(), () => getExtrema().max]
                ], { fillColor: 'gray', fillOpacity: 0.05, borders: { visible: false } });

                // MEAN VALUE RECTANGLE (Red)
                board.create('polygon', [
                    [() => A.X(), 0], [() => B.X(), 0],
                    [() => B.X(), getMeanVal], [() => A.X(), getMeanVal]
                ], {
                    fillColor: COLORS.red, fillOpacity: 0.2, 
                    borders: { strokeWidth: 2, strokeColor: COLORS.red }
                });

                // Drop line for Xi
                board.create('segment', [xiPoint, [() => xiPoint.X(), 0]], {
                    strokeColor: COLORS.blue, dash: 2, strokeWidth: 2
                });

            }}
        />
    );
}