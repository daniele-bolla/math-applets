import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES, DEFAULT_POINT_ATTRIBUTES } from "../../utils/jsxgraph";

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

                // 1. The Complex Sequence
                const seq = (n: number) => {
                    const sign = Math.pow(-1, n);
                    const numerator = 10 + 60 * Math.sin(n * 0.8);
                    return sign * (10 + numerator / n);
                };

                const values: number[] = Array.from({ length: MAX_K }, (_, i) => seq(i + 1));

                // 2. Visual Envelopes
                board.create('functiongraph', [(x: number) => 10 + 70 / x, 1, MAX_K], {
                    strokeColor: COLORS.pink, 
                    strokeWidth: 1, 
                    dash: 2, 
                    opacity: 0.1
                });
                board.create('functiongraph', [(x: number) => -10 - 70 / x, 1, MAX_K], {
                    strokeColor: COLORS.blue, 
                    strokeWidth: 1, 
                    dash: 2, 
                    opacity: 0.1
                });

                // --- 3. FIXED LIMIT LINES WITH LABELS ---

                // LimSup Line
                board.create('line', [[0, TRUE_SUP], [1, TRUE_SUP]], {
                    strokeColor: COLORS.pink,
                    strokeWidth: 2,
                    dash: 2,
                    opacity: 0.6,
                    fixed: true
                });
                // board.create('text', [82, TRUE_SUP + 2, 'lim sup'], {
                //     color: COLORS.pink,
                //     fontSize: 16,
                //     fixed: true,
                //     anchorY: 'bottom'
                // });

                // LimInf Line
                board.create('line', [[0, TRUE_INF], [1, TRUE_INF]], {
                    strokeColor: COLORS.blue,
                    strokeWidth: 2,
                    dash: 2,
                    opacity: 0.6,
                    fixed: true
                });
                // board.create('text', [82, TRUE_INF - 2, 'lim inf'], {
                //     color: COLORS.blue,
                //     fontSize: 16,
                //     fixed: true,
                //     anchorY: 'top'
                // });

                // 4. Slider (k)
                const kSlider = board.create('slider', [[SLIDER_X_START, SLIDER_Y], [SLIDER_X_END, SLIDER_Y], [SLIDER_MIN, SLIDER_INITIAL, SLIDER_MAX]], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'k',
                    snapWidth: 1,
                    precision: 0,
                    fillColor: COLORS.gray,
                    strokeColor: COLORS.black,
                    label: { fontSize: 20, color: COLORS.black }
                });

                // --- 5. EPSILON SLIDERS (Constrained Segments) ---

                const SLIDER_X = -4;

                // SUPREMUM SLIDER (Controls top neighborhood)
                const epsLineSup = board.create('segment', [[SLIDER_X, TRUE_SUP], [SLIDER_X, 40]], {
                    strokeColor: COLORS.lightGray,
                    strokeWidth: 3,
                    lineCap: 'round',
                    fixed: true
                });
                const epsGliderSup = board.create('glider', [SLIDER_X, 15, epsLineSup], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'ε₁',
                    color: COLORS.pink,
                });

                // INFIMUM SLIDER (Controls bottom neighborhood)
                const epsLineInf = board.create('segment', [[SLIDER_X, TRUE_INF], [SLIDER_X, -40]], {
                    strokeColor: COLORS.lightGray,
                    strokeWidth: 3,
                    lineCap: 'round',
                    fixed: true
                });
                const epsGliderInf = board.create('glider', [SLIDER_X, -15, epsLineInf], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'ε₂',
                    color: COLORS.blue,
                    label: { fontSize: 18, color: COLORS.blue, offset: [-25, 0] }
                });

                const getEpsSup = () => Math.abs(epsGliderSup.Y() - TRUE_SUP);
                const getEpsInf = () => Math.abs(epsGliderInf.Y() - TRUE_INF);

                // --- 6. NEIGHBORHOOD VISUALIZATION ---

                // Sup Neighborhood Lines (Pink)
                board.create('line', [[0, () => TRUE_SUP + getEpsSup()], [1, () => TRUE_SUP + getEpsSup()]], {
                    strokeColor: COLORS.pink,
                    strokeWidth: 2,
                    dash: 3
                });
                board.create('line', [[0, () => TRUE_SUP - getEpsSup()], [1, () => TRUE_SUP - getEpsSup()]], {
                    strokeColor: COLORS.pink,
                    strokeWidth: 2,
                    dash: 3
                });

                // Inf Neighborhood Lines (Blue)
                board.create('line', [[0, () => TRUE_INF + getEpsInf()], [1, () => TRUE_INF + getEpsInf()]], {
                    strokeColor: COLORS.blue,
                    strokeWidth: 2,
                    dash: 3
                });
                board.create('line', [[0, () => TRUE_INF - getEpsInf()], [1, () => TRUE_INF - getEpsInf()]], {
                    strokeColor: COLORS.blue,
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
                        ...DEFAULT_POINT_ATTRIBUTES,
                        name: '',
                        size: 1,
                        strokeColor: COLORS.black,
                        strokeWidth: 1,
                        fixed: true,
                        fillColor: () => {
                            const k = kSlider.Value();
                            const val = values[n - 1];

                            // 1. Tail Logic: If before k, ghost it out
                            if (n < k) return COLORS.lightGray;

                            // 2. Supremum Logic
                            const epsSup = getEpsSup();
                            if (Math.abs(val - TRUE_SUP) < epsSup) {
                                return COLORS.pink;
                            }

                            // 3. Infimum Logic
                            const epsInf = getEpsInf();
                            if (Math.abs(val - TRUE_INF) < epsInf) {
                                return COLORS.blue;
                            }

                            return COLORS.black;
                        },
                        strokeOpacity: () => n < kSlider.Value() ? 0.3 : 1
                    });
                }

                // 8. The "Cut" Line
                board.create('line', [
                    [() => kSlider.Value(), -200],
                    [() => kSlider.Value(), 200]
                ], {
                    strokeColor: COLORS.darkGray,
                    strokeWidth: 1,
                    dash: 2,
                    straightFirst: false,
                    straightLast: false
                });

                // 9. HIGHLIGHTERS
                board.create('point', [
                    () => getSupData().index,
                    () => getSupData().val
                ], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: '', size: 6,
                    fillColor: 'transparent',
                    strokeColor: COLORS.pink,
                    strokeWidth: 3,
                    fixed: true
                });

                board.create('point', [
                    () => getInfData().index,
                    () => getInfData().val
                ], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: '', size: 6,
                    fillColor: 'transparent',
                    strokeColor: COLORS.blue,
                    strokeWidth: 3,
                    fixed: true
                });

                // // 10. LEGEND
                // board.create('text', [40, 50, () => {
                //     const supVal = getSupData().val.toFixed(2);
                //     const infVal = getInfData().val.toFixed(2);
                //     return `sup { a_n : n >= k } = ${supVal}\ninf { a_n : n >= k } = ${infVal}`;
                // }], { fixed: true, anchorX: 'left', fontSize: 14, color: COLORS.black });
            }}
        />
    );
}