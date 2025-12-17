import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function IntegrabilityProofApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 6, 9, -5], axis: true }}
            setup={(board: JXG.Board) => {
                // --- 1. Define Function ---
                const f = (x: number) => 0.5 * Math.sin(x) * x + 2.5;

                board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue,
                    strokeWidth: 3,
                    withLabel: false,
                });

                // --- 2. Controls (Moved to Bottom Right) ---
                
                // Epsilon Slider
                const epsSlider = board.create('slider', [[5, -2], [8, -2], [0.1, 1.5, 5.0]], {
                    name: '&epsilon;',
                    snapWidth: 0.1,
                });

                // N Slider
                const nSlider = board.create('slider', [[5, -3.5], [8, -3.5], [1, 5, 100]], {
                    name: 'n',
                    snapWidth: 1,
                    precision: 0,
                }) as JXG.Slider;

                // Interval Points (a, b)
                const gliderA = board.create('glider', [1, 0, board.defaultAxes.x], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'a', color: COLORS.blue, size: 4
                });

                const gliderB = board.create('glider', [6, 0, board.defaultAxes.x], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'b', color: COLORS.blue, size: 4
                });

                // --- 3. Graphic Objects ---
                
                // Upper Sum (Phi)
                const upperPoly = board.create('curve', [[0],[0]], { 
                    strokeWidth: 1, 
                    strokeColor: COLORS.orange, 
                    fillColor: COLORS.orange, 
                    fillOpacity: 0.4, 
                    withLabel: false 
                });

                // Lower Sum (Psi)
                const lowerPoly = board.create('curve', [[0],[0]], { 
                    strokeWidth: 1, 
                    strokeColor: '#800080', 
                    fillColor: '#800080', 
                    fillOpacity: 0.6, 
                    withLabel: false 
                });

                // Vertical Divider Lines
                const rectLines = board.create('curve', [[0],[0]], { 
                    strokeColor: '#333', 
                    strokeWidth: 1, 
                    strokeOpacity: 0.3 
                });

                // Function Labels
                const labelPhi = board.create('text', [0, 0, '&phi;'], { color: COLORS.orange, anchorX:'left', fontSize: 16 });
                const labelPsi = board.create('text', [0, 0, '&psi;'], { color: '#800080', anchorX:'left', fontSize: 16 });


                // --- 4. Logic Loop ---
                const update = () => {
                    const n = Math.floor(nSlider.Value());
                    const aVal = gliderA.X();
                    const bVal = gliderB.X();
                    const a = Math.min(aVal, bVal);
                    const b = Math.max(aVal, bVal);
                    
                    const range = b - a;
                    const dx = range / n; 
                    
                    // Epsilon Tilde calculation
                    const eTilde = (range < 0.01) ? 0 : epsSlider.Value() / (2 * range);

                    // Coordinate Arrays
                    const uX: number[] = [a]; const uY: number[] = [0];
                    const lX: number[] = [a]; const lY: number[] = [0];
                    const rX: number[] = []; const rY: number[] = [];

                    let conditionHolds = true;

                    for (let i = 1; i <= n; i++) {
                        const x_prev = a + (i - 1) * dx;
                        const x_curr = a + i * dx;
                        
                        // Anchor at right endpoint f(x_i)
                        const anchor = f(x_curr);

                        const h_phi = anchor + eTilde;
                        const h_psi = anchor - eTilde;

                        // Build Shapes
                        uX.push(x_prev, x_curr); uY.push(h_phi, h_phi);
                        lX.push(x_prev, x_curr); lY.push(h_psi, h_psi);

                        // Vertical Lines
                        rX.push(x_curr, x_curr, NaN); rY.push(0, h_phi, NaN);
                        if(i===1) { rX.push(x_prev, x_prev, NaN); rY.push(0, h_phi, NaN); }

                        // Check Validity (Does f(x) stay inside?)
                        for(let k=0; k<=5; k++) {
                            const val = f(x_prev + (dx * (k/5)));
                            if (val > h_phi + 0.001 || val < h_psi - 0.001) {
                                conditionHolds = false;
                            }
                        }
                    }

                    // Close polygons to x-axis
                    uX.push(b, a); uY.push(0, 0);
                    lX.push(b, a); lY.push(0, 0);

                    // Update Data
                    upperPoly.dataX = uX; upperPoly.dataY = uY;
                    lowerPoly.dataX = lX; lowerPoly.dataY = lY;
                    rectLines.dataX = rX; rectLines.dataY = rY;
                    
                    // Position Labels at the top-right of the last box
                    labelPhi.setPosition(JXG.COORDS_BY_USER, [b + 0.1, uY[uY.length-3]]); 
                    labelPsi.setPosition(JXG.COORDS_BY_USER, [b + 0.1, lY[lY.length-3]]);

                    // Color Feedback (Red vs Green)
                    if (conditionHolds) {
                        upperPoly.setAttribute({ fillColor: COLORS.orange, strokeColor: COLORS.orange });
                        lowerPoly.setAttribute({ fillColor: '#800080', strokeColor: '#800080' });
                        labelPhi.setAttribute({ color: COLORS.orange });
                        labelPsi.setAttribute({ color: '#800080' });
                    } else {
                        // Error State
                        upperPoly.setAttribute({ fillColor: COLORS.red, strokeColor: COLORS.red });
                        lowerPoly.setAttribute({ fillColor: COLORS.darkRed, strokeColor: COLORS.darkRed });
                        labelPhi.setAttribute({ color: COLORS.red });
                        labelPsi.setAttribute({ color: COLORS.red });
                    }
                };

                gliderA.on('drag', update);
                gliderB.on('drag', update);
                epsSlider.on('drag', update);
                nSlider.on('drag', update);

                update();
            }}
        />
    );
}