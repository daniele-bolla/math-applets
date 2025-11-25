import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";

export default function LimSupLimInfApplet() {
    return (
        <JSXGraphBoard
            config={{
                // Wide x-axis (to 80), Tall y-axis (-8 to 8) to show the "funnel"
                boundingbox: [-5, 2.5, 85, -2.5],
                axis: true,
            }}
            setup={(board: JXG.Board) => {
                const MAX_K = 80;
                const SLIDER_MIN = 1;
                const SLIDER_MAX = 75;
                const SLIDER_INITIAL = 1;
                const SLIDER_X_START = 5;
                const SLIDER_X_END = 45;
                const SLIDER_Y = -1.5;

                const READOUT_SUP_X = 5;
                const READOUT_INF_X = 30;
                const READOUT_Y = -2.2;
                
                // 1. The Sequence: Alternating with a large hyperbolic term
                // x_n = (-1)^n * (1 + 10/n)
                const seq = (k: number) => Math.pow(-1, k) * (1 + 10.0 / k);
                const values: number[] = Array.from({ length: MAX_K }, (_, i) => seq(i + 1));

                // 2. Visual Envelopes (The "Funnel")
                // These dashed lines show the theoretical bounds: y = 1 + 10/x and y = -1 - 10/x
                board.create('functiongraph', [(x:number) => 1 + 10/x, 1, MAX_K], {
                    strokeColor: '#E91E63', strokeWidth: 1, dash: 2, opacity: 0.3
                });
                board.create('functiongraph', [(x:number) => -1 - 10/x, 1, MAX_K], {
                    strokeColor: '#2196F3', strokeWidth: 1, dash: 2, opacity: 0.3
                });
                // The Limits (horizontal lines at y=1 and y=-1)
                board.create('line', [[0,1], [1,1]], { strokeColor: '#E91E63', strokeWidth: 1, dash: 1, opacity: 0.5 });
                board.create('line', [[0,-1], [1,-1]], { strokeColor: '#2196F3', strokeWidth: 1, dash: 1, opacity: 0.5 });

                // 3. Slider to control 'n' (the tail start)
                const nSlider = board.create('slider', [[SLIDER_X_START, SLIDER_Y], [SLIDER_X_END, SLIDER_Y], [SLIDER_MIN, SLIDER_INITIAL, SLIDER_MAX]], {
                    name: 'n',
                    snapWidth: 1,
                    precision: 0,
                    fillColor: '#444',
                    strokeColor: '#000',
                    label: { fontSize: 18, offset: [-10, -10] }
                });

                // Helper functions to calculate supremum and infimum of the tail
                const getTailSup = () => {
                    const n = Math.floor(nSlider.Value());
                    const tail = values.slice(n - 1);
                    return Math.max(...tail);
                };

                const getTailInf = () => {
                    const n = Math.floor(nSlider.Value());
                    const tail = values.slice(n - 1);
                    return Math.min(...tail);
                };

                // 4. Sequence Points: Gray if before 'n', Black if in the tail
                for (let k = 1; k <= MAX_K; k++) {
                    board.create('point', [k, values[k - 1]], {
                        name: '',
                        size: 1, 
                        fillColor: () => k < nSlider.Value() ? '#e0e0e0' : '#000000',
                        strokeColor: () => k < nSlider.Value() ? '#cccccc' : '#000000',
                        fixed: true
                    });
                }

                // 5. The "Cut" Line (vertical line at x = n)
                board.create('line', [
                    [() => nSlider.Value(), -10],
                    [() => nSlider.Value(), 10]
                ], {
                    strokeColor: '#666',
                    strokeWidth: 1,
                    dash: 2,
                    straightFirst: false, 
                    straightLast: false
                });

                // 6. The Supremum Line (Pink): From the cut line to the end of the graph
                board.create('line', [
                    [() => nSlider.Value(), getTailSup],
                    [MAX_K, getTailSup]
                ], {
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#E91E63',
                    strokeWidth: 3,
                });

                // 7. The Infimum Line (Blue): From the cut line to the end of the graph
                board.create('line', [
                    [() => nSlider.Value(), getTailInf],
                    [MAX_K, getTailInf]
                ], {
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#2196F3',
                    strokeWidth: 3,
                });

                // 8. Readouts for sup S_n and inf S_n
                board.create('text', [READOUT_SUP_X, READOUT_Y, () => {
                    const val = getTailSup().toFixed(4);
                    return `<span style="color:#E91E63; font-weight:bold; font-size:14px">sup Sₙ = ${val}</span>`;
                }], { fixed: true });

                board.create('text', [READOUT_INF_X, READOUT_Y, () => {
                    const val = getTailInf().toFixed(4);
                    return `<span style="color:#2196F3; font-weight:bold; font-size:14px">inf Sₙ = ${val}</span>`;
                }], { fixed: true });
            }}
        />
    );
}