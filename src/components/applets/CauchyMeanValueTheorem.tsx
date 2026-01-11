import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
    COLORS,
    DEFAULT_GLIDER_ATTRIBUTES,
    createLine,
    createGlider,
    createSegment,
    createText,
    createFunctionGraph,
    createPoint
} from "../../utils/jsxgraph";

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
                
                const xAxis = createLine(board, [[0,0], [1,0]], { visible: false });

                const aGlider = createGlider(board, [-1, 0, xAxis], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'a',
                    label: { offset: [0, -20], color: COLORS.blue }
                }, COLORS.blue);

                const bGlider = createGlider(board, [3, 0, xAxis], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'b', 
                    label: { offset: [0, -20], color: COLORS.blue }
                }, COLORS.blue);

                const cGlider = createGlider(board, [0.5, 0, xAxis], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'c', 
                    label: { offset: [0, 20], color: COLORS.orange, fontSize: 16 }
                }, COLORS.orange);

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
                createSegment(board, [[BAR_X, BASE_Y], [BAR_X, () => getTerm1()]], {
                    strokeWidth: 10,
                    name: '', withLabel: false
                }, COLORS.blue);
                createText(board, [BAR_X, () => getTerm1() + (getTerm1()>0?1:-1), "Δg · f '(c)"], {
                    anchorX: 'middle', fontSize: 14
                }, COLORS.blue);

                // Bar 2: Δf * g'(c)
                // Represents the Right Hand Side
                createSegment(board, [[BAR_X + 1.5, BASE_Y], [BAR_X + 1.5, () => getTerm2()]], {
                    strokeWidth: 10,
                    name: '', withLabel: false
                }, 'purple');
                createText(board, [BAR_X + 1.5, () => getTerm2() + (getTerm2()>0?1:-1), "Δf · g'(c)"], {
                    anchorX: 'middle', fontSize: 14
                }, 'purple');

                // Equality Indicator (A horizontal line connecting the tops)
                createSegment(board, [
                    [BAR_X, () => getTerm1()],
                    [BAR_X + 1.5, () => getTerm2()]
                ], {
                    strokeWidth: 2, dash: 2
                }, statusColor);

                // Label "MATCH" or "DIFF"
                createText(board, [BAR_X + 0.75, () => (getTerm1()+getTerm2())/2, () => isMatch() ? "EQUAL" : "≠"], {
                    anchorX: 'middle', fontSize: 16, fontWeight: 'bold'
                }, statusColor);


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
                createFunctionGraph(board, visH, [-10, 10], {
                    strokeWidth: 2,
                    name: 'h(x)', withLabel: true, label: {position:'rt', offset:[-20,10], color:'#D32F2F'}
                }, '#D32F2F');

                // Rolle's Points (h(a)=0, h(b)=0)
                createPoint(board, [getA, 0], { size: 3, fixed: true, name: '', showInfobox:false }, '#D32F2F');
                createPoint(board, [getB, 0], { size: 3, fixed: true, name: '', showInfobox:false }, '#D32F2F');

                // Tangent on h(x)
                createFunctionGraph(board,
                    (x: number) => visH(getC()) + (getRawH_prime(getC())*SCALE) * (x - getC()),
                    [-10, 10],
                    { strokeWidth: 3, dash: 0 },
                    statusColor
                );

                createPoint(board, [getC, () => visH(getC())], {
                    size: 4, fixed: true, name: '',
                }, COLORS.orange);

                // ===========================================
                // 6. REFERENCE GRAPHS f(x) & g(x)
                // ===========================================
                
                // f(x) Top
                createFunctionGraph(board, f, [-10, 10], { strokeWidth: 3, name: 'f(x)', withLabel: true }, COLORS.blue);
                createPoint(board, [getC, () => f(getC())], { size: 2, name: '', fixed: true }, COLORS.orange);

                // g(x) Bottom
                createFunctionGraph(board, g, [-10, 10], { strokeWidth: 3, name: 'g(x)', withLabel: true }, 'purple');
                createPoint(board, [getC, () => g(getC())], { size: 2, name: '', fixed: true }, COLORS.orange);

                // Vertical dashed line
                createLine(board, [[getC, -15], [getC, 15]], { strokeWidth: 1, dash: 3 }, COLORS.gray);

            }}
        />
    );
}