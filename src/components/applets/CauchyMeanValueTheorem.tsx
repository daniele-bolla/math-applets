import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function CauchyMVTApplet() {
    return (
        <JSXGraphBoard
            config={{
                // Bounding box fits f(top), h(middle), g(bottom)
                boundingbox: [-3, 14, 8, -12], // Extended right to fit the bars
                axis: true,
                showNavigation: false,
                showZoom: false,
                pan: { enabled: false },
            }}
            setup={(board: JXG.Board) => {
                // ===========================================
                // 1. MATH DEFINITIONS
                // ===========================================
                
                // f(x) (Top)
                const f = (x: number) => 0.4 * Math.pow(x, 2) + 6; 
                const df = (x: number) => 0.8 * x;

                // g(x) (Bottom)
                const g = (x: number) => 0.1 * Math.pow(x, 3) - x - 8; 
                const dg = (x: number) => 0.3 * Math.pow(x, 2) - 1;

                // ===========================================
                // 2. SLIDERS
                // ===========================================
                
                const xAxis = board.create('line', [[0,0], [1,0]], { visible: false });

                const aGlider = board.create('glider', [-1, 0, xAxis], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'a', color: COLORS.blue, size: 5,
                    label: { offset: [0, -20], color: COLORS.blue }
                });

                const bGlider = board.create('glider', [3, 0, xAxis], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'b', color: COLORS.blue, size: 5,
                    label: { offset: [0, -20], color: COLORS.blue }
                });

                const cGlider = board.create('glider', [0.5, 0, xAxis], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'c', color: COLORS.orange, size: 6,
                    label: { offset: [0, 20], color: COLORS.orange, fontSize: 16 }
                });

                const getA = () => Math.min(aGlider.X(), bGlider.X());
                const getB = () => Math.max(aGlider.X(), bGlider.X());
                const getC = () => cGlider.X();

                // ===========================================
                // 3. CALCULATE TERMS
                // ===========================================
                
                // Term 1: (g(b) - g(a)) * f'(c)
                const getTerm1 = () => {
                    const deltaG = g(getB()) - g(getA());
                    return deltaG * df(getC());
                };

                // Term 2: (f(b) - f(a)) * g'(c)
                const getTerm2 = () => {
                    const deltaF = f(getB()) - f(getA());
                    return deltaF * dg(getC());
                };

                // Check equality
                const isMatch = () => Math.abs(getTerm1() - getTerm2()) < 0.5;
                const statusColor = () => isMatch() ? COLORS.green : '#D32F2F';

                // ===========================================
                // 4. VISUALIZATION OF TERMS (Comparison Bars)
                // ===========================================
                
                const BAR_X = 5.5; // X position for the bars
                const BAR_WIDTH = 0.8;
                const BASE_Y = 0;

                // Bar 1: Δg * f'(c)
                // Represents the Left Hand Side of the simplified equation
                board.create('segment', [[BAR_X, BASE_Y], [BAR_X, () => getTerm1()]], {
                    strokeColor: COLORS.blue, strokeWidth: 10,
                    name: '', withLabel: false
                });
                board.create('text', [BAR_X, () => getTerm1() + (getTerm1()>0?1:-1), "Δg · f '(c)"], {
                    anchorX: 'middle', color: COLORS.blue, fontSize: 14
                });

                // Bar 2: Δf * g'(c)
                // Represents the Right Hand Side
                board.create('segment', [[BAR_X + 1.5, BASE_Y], [BAR_X + 1.5, () => getTerm2()]], {
                    strokeColor: 'purple', strokeWidth: 10,
                    name: '', withLabel: false
                });
                board.create('text', [BAR_X + 1.5, () => getTerm2() + (getTerm2()>0?1:-1), "Δf · g'(c)"], {
                    anchorX: 'middle', color: 'purple', fontSize: 14
                });

                // Equality Indicator (A horizontal line connecting the tops)
                board.create('segment', [
                    [BAR_X, () => getTerm1()],
                    [BAR_X + 1.5, () => getTerm2()]
                ], {
                    strokeColor: statusColor, strokeWidth: 2, dash: 2
                });
                
                // Label "MATCH" or "DIFF"
                board.create('text', [BAR_X + 0.75, () => (getTerm1()+getTerm2())/2, () => isMatch() ? "EQUAL" : "≠"], {
                    anchorX: 'middle', color: statusColor, fontSize: 16, fontWeight: 'bold'
                });


                // ===========================================
                // 5. AUXILIARY FUNCTION h(x) (MIDDLE)
                // ===========================================
                // h(x) scaled for visual fit
                
                const getRawH = (x: number) => {
                    const df_val = f(getB()) - f(getA());
                    const dg_val = g(getB()) - g(getA());
                    return df_val * g(x) - dg_val * f(x);
                };
                
                const getRawH_prime = (x: number) => {
                    const df_val = f(getB()) - f(getA());
                    const dg_val = g(getB()) - g(getA());
                    return df_val * dg(x) - dg_val * df(x);
                };

                const SCALE = 0.3; 
                const visH = (x: number) => {
                    const offset = getRawH(getA());
                    return (getRawH(x) - offset) * SCALE;
                };

                // h(x) Graph
                board.create('functiongraph', [visH, -10, 10], {
                    strokeColor: '#D32F2F', strokeWidth: 2,
                    name: 'h(x)', withLabel: true, label: {position:'rt', offset:[-20,10], color:'#D32F2F'}
                });

                // Rolle's Points (h(a)=0, h(b)=0)
                board.create('point', [getA, 0], { size: 3, color: '#D32F2F', fixed: true, name: '', showInfobox:false });
                board.create('point', [getB, 0], { size: 3, color: '#D32F2F', fixed: true, name: '', showInfobox:false });

                // Tangent on h(x)
                board.create('functiongraph', [
                    (x: number) => visH(getC()) + (getRawH_prime(getC())*SCALE) * (x - getC()), -10, 10
                ], {
                    strokeColor: statusColor, strokeWidth: 3, dash: 0
                });
                
                board.create('point', [getC, () => visH(getC())], {
                    size: 4, color: COLORS.orange, strokeColor: '#D32F2F', name: '', fixed: true
                });

                // ===========================================
                // 6. REFERENCE GRAPHS f(x) & g(x)
                // ===========================================
                
                // f(x) Top
                board.create('functiongraph', [f, -10, 10], { strokeColor: COLORS.blue, strokeWidth: 3, name: 'f(x)', withLabel: true });
                board.create('point', [getC, () => f(getC())], { size: 2, color: COLORS.orange, name: '', fixed: true });

                // g(x) Bottom
                board.create('functiongraph', [g, -10, 10], { strokeColor: 'purple', strokeWidth: 3, name: 'g(x)', withLabel: true });
                board.create('point', [getC, () => g(getC())], { size: 2, color: COLORS.orange, name: '', fixed: true });

                // Vertical dashed line
                board.create('line', [[getC, -15], [getC, 15]], { strokeColor: COLORS.gray, strokeWidth: 1, dash: 3 });

            }}
        />
    );
}