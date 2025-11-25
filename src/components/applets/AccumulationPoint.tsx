import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";

export default function AccumulationPointApplet() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-0.2, 1.2, 1.2, -1],
                axis: true,
            }}
            setup={(board: JXG.Board) => {

                const xAxisPositive = board.create('segment', [[0, 0], [1.0, 0]], { visible: false });
                const p = board.create('glider', [1, 0, xAxisPositive], {
                    name: 'p',
                    size: 6,
                    face: '<>',
                    layer: 100,
                    strokeOpacity: 0.4,
                    fillOpacity: 0.4,
                    highlight: false,
                    showInfobox: false,
                    color: '#FF9800'
                });

                const getRadius = () => Math.max(p.X() * 0.07, 0.01);

                // Create Points of rthe sequence
                const MAX_POINTS_HARD_CAP = 100;
                const sequencePoints: JXG.Point[] = [];
                for (let i = 1; i < MAX_POINTS_HARD_CAP; i++) {
                    const n = i;
                    if (n > 0 ) {
                        const pt = board.create('point', [1 / n, 0], {
                            name: ``,
                            size: 1,
                            color: '#2196F3',
                            fixed: true
                        });
                        sequencePoints.push(pt);
                    }
                }

                const isIntercepting = () => {
                    const r = getRadius();
                    // const centerTolerance = 0.001; 
                    if(p.X() == 0) return true
                    return sequencePoints.some(ps => {
                        const dist = ps.Dist(p);
                        return dist <= r // && dist > centerTolerance;
                    });
                };

                p.on('drag', function() {
                    // Color Logic
                    const newColor = isIntercepting() ? '#4CAF50' : '#FF9800';
                    p.setAttribute({ color: newColor });
                    // Zoom Logic
                    const pX = p.X();
                    const minP_X = 0.1; 
                    const maxP_X = 1.0;   
                    const clampedPX = Math.max(minP_X, Math.min(maxP_X, pX));
                    const zoomInState = { left: -0.1, top: 0.5, right: 0.5, bottom: -0.5 };
                    const zoomOutState = { left: -0.2, top: 1.2, right: 1.2, bottom: -1 };
                    const log_minP_X = Math.log(minP_X);
                    const log_maxP_X = Math.log(maxP_X);
                    const logPX = Math.log(clampedPX);
                    const ratio = (logPX - log_minP_X) / (log_maxP_X - log_minP_X);
                    const left = zoomInState.left + (zoomOutState.left - zoomInState.left) * ratio;
                    const top = zoomInState.top + (zoomOutState.top - zoomInState.top) * ratio;
                    const right = zoomInState.right + (zoomOutState.right - zoomInState.right) * ratio;
                    const bottom = zoomInState.bottom + (zoomOutState.bottom - zoomInState.bottom) * ratio;
                    board.setBoundingBox([left, top, right, bottom], true);
                });

                board.create('point', [0, 0], {
                    size: 2,
                    color: '#E91E63',
                    showInfobox: false,
                    fixed:true
                });

                board.create('segment', [
                    [() => p.X() - getRadius(), 0],
                    [() => p.X() + getRadius(), 0]
                ], {
                    strokeColor: () => isIntercepting() ? '#4CAF50' : '#FFC107',
                    strokeWidth: 4,
                    strokeOpacity: 0.6
                });
            }}
        />
    );
}