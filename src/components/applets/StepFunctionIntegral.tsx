import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function RefinementApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-5, 5, 9, -4]}}
            setup={(board: JXG.Board) => {
                // --- 1. SETUP DATA ---
                const jumps = [-4, -1, 2, 5, 8]; 
                const values = [1.5, -2, 2.5, -1]; 

                const getPhi = (x: number) => {
                    if (x < jumps[0] || x > jumps[jumps.length - 1]) return 0;
                    for (let i = 0; i < jumps.length - 1; i++) {
                        if (x >= jumps[i] && x < jumps[i+1]) return values[i];
                    }
                    return values[values.length - 1];
                };

                // Draw Static Background Function
                for (let i = 0; i < jumps.length - 1; i++) {
                    board.create('segment', [[jumps[i], values[i]], [jumps[i+1], values[i]]], {
                        strokeColor: COLORS.blue, strokeWidth: 4, fixed: true, highlight: false
                    });
                    if (i < jumps.length - 2) {
                        board.create('segment', [[jumps[i+1], values[i]], [jumps[i+1], values[i+1]]], {
                            strokeColor: COLORS.blue, strokeWidth: 1, dash: 2, fixed: true, highlight: false
                        });
                    }
                }

                // --- 2. CONTROLS ---
                const areaSegment = board.create('segment',[[-4, 0 ],[8,0]], { visible: false });
                
                const gliderA = board.create('glider', [-4, 0, areaSegment], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'a', size: 5, color: COLORS.blue
                });

                const gliderB = board.create('glider', [8, 0, areaSegment], {
                    ...DEFAULT_GLIDER_ATTRIBUTES, name: 'b', size: 5, color: COLORS.blue
                });

                // --- 3. BUTTONS ---
                let z1Active = true;
                let z2Active = false;
                const btnStyle = 'padding: 6px; border-radius: 4px; cursor: pointer;';

                const btnZ1 = board.create('button', [3.5, -3.5, 'Z1 [ ON ]', () => {
                    z1Active = !z1Active;
                    update(true); // Button click is an "end" event, so show labels
                }], { cssStyle: `${btnStyle} color: #E65100; background-color: #fff3e0;`, fixed: true });

                const btnZ2 = board.create('button', [6.0, -3.5, 'Z2 [ OFF ]', () => {
                    z2Active = !z2Active;
                    update(true);
                }], { cssStyle: `${btnStyle} color: #4A148C; background-color: #f3e5f5;`, fixed: true });

                // --- 4. PARTITION DEFINITIONS ---
                const cutsZ1_def: number[] = [];
                for(let k = -4; k <= 8; k+=2) cutsZ1_def.push(k); // Multiples of 2

                const cutsZ2_def: number[] = [];
                for(let k = -3; k <= 8; k+=3) cutsZ2_def.push(k); // Multiples of 3

                // --- 5. VISUAL ELEMENTS ---
                
                // Area Fill
                const areaCurve = board.create('curve', [[0], [0]], {
                    strokeWidth: 0, fillOpacity: 0.3, visible: true
                });

                // Line Layers (Base & Overlay for bi-color effect)
                const linesZ1_Base = board.create('curve', [[0],[0]], {
                    strokeColor: COLORS.orange, strokeWidth: 3, visible: true
                });
                const linesZ2_Unique = board.create('curve', [[0],[0]], {
                    strokeColor: COLORS.purple, strokeWidth: 3, visible: true
                });
                const linesShared_Overlay = board.create('curve', [[0],[0]], {
                    strokeColor: COLORS.purple, strokeWidth: 3, dash: 2, visible: true
                });

                // Total Sum Text
                const dynamicText = board.create('text', [3.5, -3, ''], {
                    fontSize: 16, fixed: true, visible: true, anchorX: 'left' 
                });

                // Array to store individual area labels
                let areaLabels: JXG.Text[] = [];

                // --- 6. UPDATE ENGINE ---
                // param showLabels: boolean -> If false, skips text generation (for smooth dragging)
                const update = (showLabels: boolean = true) => {
                    // Update Button Labels
                    const setButtonLabel = (btn: unknown, label: string) => {
                        const b = btn as { rendNodeButton?: HTMLElement | null };
                        if (b.rendNodeButton) b.rendNodeButton.innerHTML = label;
                    };
                    setButtonLabel(btnZ1, `Z1 ${z1Active ? '[ ON ]' : '[ OFF ]'}`);
                    setButtonLabel(btnZ2, `Z2 ${z2Active ? '[ ON ]' : '[ OFF ]'}`);

                    // 1. ALWAYS Clear old labels (so they disappear while dragging)
                    board.removeObject(areaLabels);
                    areaLabels = [];

                    const a = gliderA.X();
                    const b = gliderB.X();
                    const start = Math.min(a, b);
                    const end = Math.max(a, b);

                    // --- GENERATE ALL CUTS ---
                    let activeCuts: number[] = [start, end];
                    jumps.forEach(j => { if (j > start && j < end) activeCuts.push(j); });

                    const z1CutsInRange: number[] = [];
                    const z2CutsInRange: number[] = [];

                    if (z1Active) cutsZ1_def.forEach(c => { if(c > start && c < end) z1CutsInRange.push(c); });
                    if (z2Active) cutsZ2_def.forEach(c => { if(c > start && c < end) z2CutsInRange.push(c); });

                    z1CutsInRange.forEach(c => activeCuts.push(c));
                    z2CutsInRange.forEach(c => activeCuts.push(c));
                    activeCuts = [...new Set(activeCuts)].sort((u, v) => u - v);

                    // Determine Colors
                    let mainColor = COLORS.orange;
                    if (z1Active && z2Active) mainColor = '#008080';
                    else if (z2Active) mainColor = COLORS.purple;


                    // --- VISUAL LOGIC: LINES ---
                    const xZ1Base: number[] = [], yZ1Base: number[] = [];
                    const xZ2Unique: number[] = [], yZ2Unique: number[] = [];
                    const xShared: number[] = [], yShared: number[] = [];

                    const isShared = (x: number) => {
                        const inZ1 = cutsZ1_def.some(c => Math.abs(c - x) < 0.001);
                        const inZ2 = cutsZ2_def.some(c => Math.abs(c - x) < 0.001);
                        return inZ1 && inZ2;
                    };

                    if (z1Active) {
                        z1CutsInRange.forEach(x => {
                            const val = getPhi(x);
                            if (z2Active && isShared(x)) {
                                xZ1Base.push(x, x, NaN); yZ1Base.push(0, val, NaN);
                                xShared.push(x, x, NaN); yShared.push(0, val, NaN);
                            } else {
                                xZ1Base.push(x, x, NaN); yZ1Base.push(0, val, NaN);
                            }
                        });
                    }

                    if (z2Active) {
                        z2CutsInRange.forEach(x => {
                            const val = getPhi(x);
                            if (!(z1Active && isShared(x))) {
                                xZ2Unique.push(x, x, NaN); yZ2Unique.push(0, val, NaN);
                            }
                        });
                    }

                    linesZ1_Base.dataX = xZ1Base; linesZ1_Base.dataY = yZ1Base;
                    linesZ2_Unique.dataX = xZ2Unique; linesZ2_Unique.dataY = yZ2Unique;
                    linesShared_Overlay.dataX = xShared; linesShared_Overlay.dataY = yShared;


                    // --- AREA & LABEL CALCULATION ---
                    if (!z1Active && !z2Active) {
                        areaCurve.setAttribute({ visible: false });
                        dynamicText.setText("Select a partition");
                        dynamicText.setAttribute({ color: 'black' });
                        board.update();
                        return;
                    }

                    const areaX: number[] = [];
                    const areaY: number[] = [];
                    let totalSum = 0;

                    for (let i = 0; i < activeCuts.length - 1; i++) {
                        const x1 = activeCuts[i];
                        const x2 = activeCuts[i+1];
                        const mid = (x1 + x2)/2;
                        const h = getPhi(mid);
                        const subArea = h * (x2 - x1);
                        
                        totalSum += subArea;

                        areaX.push(x1, x1, x2, x2);
                        areaY.push(0, h, h, 0);

                        // 2. ONLY GENERATE TEXT LABELS IF showLabels IS TRUE
                        if (showLabels && Math.abs(x2 - x1) > 0.4) {
                            const label = board.create('text', [
                                mid, 
                                h / 2, 
                                subArea.toFixed(2)
                            ], {
                                fontSize: 10,
                                color: 'black', 
                                strokeColor: 'white', 
                                strokeWidth: 2,
                                anchorX: 'middle',
                                anchorY: 'middle',
                                layer: 9 
                            });
                            areaLabels.push(label);
                        }
                    }

                    let infoLabel = `Partition Z1: I = ${totalSum.toFixed(3)}`;
                    if (z1Active && z2Active) infoLabel = `Refinement Z: I = ${totalSum.toFixed(3)}`;
                    else if (z2Active) infoLabel = `Partition Z2: I = ${totalSum.toFixed(3)}`;

                    areaCurve.dataX = areaX;
                    areaCurve.dataY = areaY;
                    areaCurve.setAttribute({ visible: true, fillColor: mainColor });

                    dynamicText.setText(infoLabel);
                    dynamicText.setAttribute({ color: mainColor });
                    
                    board.update();
                };

                // --- 7. LISTENERS (MODIFIED) ---
                
                // When dragging: Update GEOMETRY ONLY (false), do not create text
                gliderA.on('drag', () => update(false));
                gliderB.on('drag', () => update(false));
                
                // When released (or clicked): Update EVERYTHING (true), create text
                // 'up' covers dropping the drag
                // 'down' covers just clicking on the line without dragging
                gliderA.on('up', () => update(true));
                gliderB.on('up', () => update(true));
                gliderA.on('down', () => update(true));
                gliderB.on('down', () => update(true));

                update(true);
            }}
        />
    );
}