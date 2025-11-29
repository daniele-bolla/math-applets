import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";

export default function LimSupLimInfApplet() {
    return (
        <JSXGraphBoard
            config={{
                // Widened right side to 90 to fit the labels
                boundingbox: [-15, 60, 90, -80],
                axis: true,
            }}
            setup={(board: JXG.Board) => {
                const MAX_K = 150;
                const SLIDER_MIN = 1;
                const SLIDER_MAX = 100;
                const SLIDER_INITIAL = 1;

                const SLIDER_X_START = 35; 
                const SLIDER_X_END = 60;   
                const SLIDER_Y = -55;

                const TRUE_SUP = 10;
                const TRUE_INF = -10;
                
                const COLOR_SUP = '#E91E63'; // Pink
                const COLOR_INF = '#2196F3'; // Blue

                // 1. The Complex Sequence
                const seq = (n: number) => {
                    const sign = Math.pow(-1, n);
                    const numerator = 10 + 60 * Math.sin(n * 0.8);
                    return sign * (10 + numerator / n); 
                };
                
                const values: number[] = Array.from({ length: MAX_K }, (_, i) => seq(i + 1));

                // 2. Visual Envelopes
                board.create('functiongraph', [(x:number) => 10 + 70/x, 1, MAX_K], {
                    strokeColor: COLOR_SUP, strokeWidth: 1, dash: 2, opacity: 0.1
                });
                board.create('functiongraph', [(x:number) => -10 - 70/x, 1, MAX_K], {
                    strokeColor: COLOR_INF, strokeWidth: 1, dash: 2, opacity: 0.1
                });
                
                // --- 3. FIXED LIMIT LINES WITH LABELS ---
                
                // LimSup Line
                board.create('line', [[0, TRUE_SUP], [1, TRUE_SUP]], { 
                    strokeColor: COLOR_SUP, 
                    strokeWidth: 2, 
                    dash: 2, 
                    opacity: 0.6, 
                    fixed: true 
                });
                board.create('text', [82, TRUE_SUP + 2, 'lim sup'], {
                    color: COLOR_SUP, 
                    fontSize: 16, 
                    fixed: true, 
                    anchorY: 'bottom'
                });

                // LimInf Line
                board.create('line', [[0, TRUE_INF], [1, TRUE_INF]], { 
                    strokeColor: COLOR_INF, 
                    strokeWidth: 2, 
                    dash: 2, 
                    opacity: 0.6, 
                    fixed: true 
                });
                board.create('text', [82, TRUE_INF - 2, 'lim inf'], {
                    color: COLOR_INF, 
                    fontSize: 16, 
                    fixed: true, 
                    anchorY: 'top'
                });

                // 4. Slider (k)
                const kSlider = board.create('slider', [[SLIDER_X_START, SLIDER_Y], [SLIDER_X_END, SLIDER_Y], [SLIDER_MIN, SLIDER_INITIAL, SLIDER_MAX]], {
                    name: 'k', 
                    snapWidth: 1,
                    precision: 0,
                    fillColor: '#444',
                    strokeColor: '#000',
                    label: { fontSize: 20, color: 'black' } 
                });

                // --- 5. EPSILON SLIDERS (Constrained Segments) ---
                
                const SLIDER_X = -4;

                // SUPREMUM SLIDER (Controls top neighborhood)
                const epsLineSup = board.create('segment', [[SLIDER_X, TRUE_SUP], [SLIDER_X, 40]], { 
                    strokeColor: '#ccc', 
                    strokeWidth: 3, 
                    lineCap: 'round', 
                    fixed: true
                });
                const epsGliderSup = board.create('glider', [SLIDER_X, 15, epsLineSup], {
                    name: 'ε₁', 
                    size: 6, 
                    color: COLOR_SUP, 
                    label: { fontSize: 18, color: COLOR_SUP, offset: [-25, 0] }
                });

                // INFIMUM SLIDER (Controls bottom neighborhood)
                const epsLineInf = board.create('segment', [[SLIDER_X, TRUE_INF], [SLIDER_X, -40]], { 
                    strokeColor: '#ccc', 
                    strokeWidth: 3, 
                    lineCap: 'round', 
                    fixed: true
                });
                const epsGliderInf = board.create('glider', [SLIDER_X, -15, epsLineInf], {
                    name: 'ε₂', 
                    size: 6, 
                    face:'<>',
                    color: COLOR_INF, 
                    label: { fontSize: 18, color: COLOR_INF, offset: [-25, 0] }
                });

                const getEpsSup = () => Math.abs(epsGliderSup.Y() - TRUE_SUP);
                const getEpsInf = () => Math.abs(epsGliderInf.Y() - TRUE_INF);

                // --- 6. NEIGHBORHOOD VISUALIZATION ---
                
                // Sup Neighborhood Lines (Pink)
                board.create('line', [[0, () => TRUE_SUP + getEpsSup()], [1, () => TRUE_SUP + getEpsSup()]], {
                    strokeColor: COLOR_SUP,
                    strokeWidth: 2, 
                    dash: 3
                });
                board.create('line', [[0, () => TRUE_SUP - getEpsSup()], [1, () => TRUE_SUP - getEpsSup()]], {
                    strokeColor: COLOR_SUP, 
                    strokeWidth: 2, 
                    dash: 3
                });

                // Inf Neighborhood Lines (Blue)
                board.create('line', [[0, () => TRUE_INF + getEpsInf()], [1, () => TRUE_INF + getEpsInf()]], {
                    strokeColor: COLOR_INF, 
                    strokeWidth: 2, 
                    dash: 3
                });
                board.create('line', [[0, () => TRUE_INF - getEpsInf()], [1, () => TRUE_INF - getEpsInf()]], {
                    strokeColor: COLOR_INF, 
                    strokeWidth: 2, 
                    dash: 3
                });

                // --- LOGIC ---
                const getSupData = () => {
                    const k_curr = Math.floor(kSlider.Value());
                    let maxVal = -Infinity; let maxIndex = k_curr; 
                    for (let n = k_curr; n <= MAX_K; n++) {
                        const val = values[n - 1];
                        if (val >= maxVal) { maxVal = val; maxIndex = n; }
                    }
                    return { index: maxIndex, val: maxVal };
                };

                const getInfData = () => {
                    const k_curr = Math.floor(kSlider.Value());
                    let minVal = Infinity; let minIndex = k_curr;
                    for (let n = k_curr; n <= MAX_K; n++) {
                        const val = values[n - 1];
                        if (val <= minVal) { minVal = val; minIndex = n; }
                    }
                    return { index: minIndex, val: minVal };
                };

                // 7. Sequence Points with DUAL COLORING
                for (let n = 1; n <= MAX_K; n++) {
                    board.create('point', [n, values[n - 1]], {
                        name: '',
                        size: 1, 
                        strokeColor: '#000',
                        strokeWidth: 1,
                        fixed: true,
                        fillColor: () => {
                            const k = kSlider.Value();
                            const val = values[n - 1];
                            
                            // 1. Tail Logic: If before k, ghost it out
                            if (n < k) return '#e0e0e0';

                            // 2. Supremum Logic
                            const epsSup = getEpsSup();
                            if (Math.abs(val - TRUE_SUP) < epsSup) {
                                return COLOR_SUP; 
                            }

                            // 3. Infimum Logic
                            const epsInf = getEpsInf();
                            if (Math.abs(val - TRUE_INF) < epsInf) {
                                return COLOR_INF; 
                            }

                            return '#000000'; 
                        },
                        strokeOpacity: () => n < kSlider.Value() ? 0.3 : 1
                    });
                }

                // 8. The "Cut" Line
                board.create('line', [
                    [() => kSlider.Value(), -200],
                    [() => kSlider.Value(), 200]
                ], {
                    strokeColor: '#666', strokeWidth: 1, dash: 2, straightFirst: false, straightLast: false
                });

                // 9. HIGHLIGHTERS
                board.create('point', [
                    () => getSupData().index, 
                    () => getSupData().val
                ], {
                    name: '', size: 6, fillColor: 'transparent', strokeColor: COLOR_SUP, strokeWidth: 3, fixed: true
                });

                board.create('point', [
                    () => getInfData().index, 
                    () => getInfData().val
                ], {
                    name: '', size: 6, fillColor: 'transparent', strokeColor: COLOR_INF, strokeWidth: 3, fixed: true
                });

                // 10. LEGEND
                board.create('text', [40, 50, () => {
                    const supVal = getSupData().val.toFixed(2);
                    const infVal = getInfData().val.toFixed(2);
                    return `
                        <div style="font-size: 14px; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 4px; box-shadow: 2px 2px 5px #ccc">
                            <span style="color:#E91E63">sup { a<sub>n</sub> : n ≥ k } = ${supVal}</span><br/>
                            <span style="color:#2196F3">inf { a<sub>n</sub> : n ≥ k } = ${infVal}</span>
                        </div>
                    `;
                }], { fixed: true, anchorX: 'left' });
            }}
        />
    );
}