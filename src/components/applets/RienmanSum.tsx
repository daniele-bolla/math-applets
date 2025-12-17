import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function RandomRiemannApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-4, 6, 8, -6], axis: true }}
            setup={(board: JXG.Board) => {
                // 1. Define Function
                // f(x) = 0.25x^3 - x^2 - x + 2
                const f = (x: number) => 0.25 * Math.pow(x, 3) - Math.pow(x, 2) - x + 2;

                // 2. Draw Graph
                board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue,
                    strokeWidth: 3,
                    withLabel: false,
                });

                // 3. Controls
                const gliderA = board.create('glider', [-2, 0, board.defaultAxes.x], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    size: 4,
                    color: COLORS.blue,
                    withLabel: false,
                    name: ''
                });

                const gliderB = board.create('glider', [5, 0, board.defaultAxes.x], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    size: 4,
                    color: COLORS.blue,
                    withLabel: false,
                    name: ''
                });

                // UPDATED SLIDER: Max set to 500
                const nSlider = board.create('slider', [
                    [3, -5],
                    [6, -5],
                    [1, 50, 500] // [Min, Start, Max]
                ], {
                    name: 'n',
                    snapWidth: 1,
                    precision: 0,
                }) as JXG.Slider;

                // 4. Random Partition Logic
                // UPDATED: Increase pool size to support up to 500 partitions
                const MAX_PARTITIONS = 500;
                const randomWeights = Array.from({ length: MAX_PARTITIONS }, () => Math.random() * 0.8 + 0.3);

                // Helper: Sample points inside interval to find correct height
                // (Critical for non-monotonic functions)
                const getLocalExtrema = (x1: number, x2: number) => {
                    let min = Infinity;
                    let max = -Infinity;
                    // We sample a few points. 
                    // 5 steps is enough for N=500 (since intervals are tiny). 
                    // 10 steps is safer for small N.
                    const steps = 6; 
                    for (let i = 0; i <= steps; i++) {
                        const x = x1 + (x2 - x1) * (i / steps);
                        const val = f(x);
                        if (val < min) min = val;
                        if (val > max) max = val;
                    }
                    return { min, max };
                };

                // --- Calculation Logic ---
                const getCurveData = (type: 'upper' | 'lower') => {
                    const n = Math.floor(nSlider.Value());
                    const a = gliderA.X();
                    const b = gliderB.X();
                    
                    const start = Math.min(a, b);
                    const end = Math.max(a, b);
                    const range = end - start;

                    let totalWeight = 0;
                    // Safety check: Ensure loop doesn't exceed array bounds
                    const limit = Math.min(n, MAX_PARTITIONS);
                    
                    for (let i = 0; i < limit; i++) totalWeight += randomWeights[i];

                    const X: number[] = [];
                    const Y: number[] = [];
                    
                    let currentSum = 0;
                    let x1 = start;

                    for (let i = 0; i < limit; i++) {
                        currentSum += randomWeights[i];
                        const x2 = start + range * (currentSum / totalWeight);
                        
                        const { min, max } = getLocalExtrema(x1, x2);
                        let h = 0;

                        if (type === 'upper') {
                            h = max;
                        } else {
                            h = min;
                        }

                        X.push(x1, x1, x2, x2);
                        Y.push(0, h, h, 0);

                        x1 = x2; 
                    }
                    return { X, Y };
                };

                // 5. Create Curves 
                // Using thinner lines (strokeWidth 0.5) so 500 rectangles don't look messy
                const upperCurve = board.create('curve', [[0], [0]], {
                    strokeColor: COLORS.darkRed,
                    strokeOpacity: 0.6,
                    strokeWidth: 0.5, 
                    fillColor: COLORS.red,
                    fillOpacity: 0.2,
                    withLabel: false
                });

                const lowerCurve = board.create('curve', [[0], [0]], {
                    strokeColor: COLORS.darkGreen,
                    strokeOpacity: 0.6,
                    strokeWidth: 0.5,
                    fillColor: COLORS.green,
                    fillOpacity: 0.3,
                    withLabel: false
                });

                // 6. Update Function
                const updateShapes = () => {
                    // Optimization: If n > 300, reduce opacity of strokes further?
                    // Optional, but keeps performance snappy.
                    
                    const upData = getCurveData('upper');
                    const lowData = getCurveData('lower');

                    upperCurve.dataX = upData.X;
                    upperCurve.dataY = upData.Y;
                    
                    lowerCurve.dataX = lowData.X;
                    lowerCurve.dataY = lowData.Y;
                };

                // 7. Attach Listeners
                nSlider.on('drag', updateShapes);
                nSlider.on('down', updateShapes);
                gliderA.on('drag', updateShapes);
                gliderB.on('drag', updateShapes);

                // 8. Initial Run
                updateShapes();
                board.update();
            }}
        />
    );
}