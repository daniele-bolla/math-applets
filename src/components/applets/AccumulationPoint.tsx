import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
    COLORS,
    DEFAULT_GLIDER_ATTRIBUTES,
    DEFAULT_POINT_ATTRIBUTES,
    createGlider,
    createPoint,
    createSegment
} from "../../utils/jsxgraph";

export default function AccumulationPointApplet() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-0.2, 1.2, 1.2, -1],
                axis: true,
                showZoom: false,
                pan: { enabled: false },
            }}
            setup={(board: JXG.Board) => {
                // Constants
                const MAX_POINTS_HARD_CAP = 150;

                // Helper Functions
                const getRadius = () => Math.max(Math.pow(p.X(), 2) * 0.2, 0.001);

                const isIntercepting = () => {
                    const r = getRadius();
                    if (p.X() === 0) return true;
                    return sequencePoints.some(ps => ps.Dist(p) <= r);
                };

                const updateZoom = () => {
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
                };

                const updateColors = () => {
                    const newColor = isIntercepting() ? COLORS.green : COLORS.red;
                    p.setAttribute({ color: newColor });
                };

                // JSXGraph Elements
                const xAxisPositive = createSegment(board, [[0, 0], [1.0, 0]], { visible: false });

                const p = createGlider(board, [1, 0, xAxisPositive], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: '',
                    layer: 100,
                    highlight: false,
                }, COLORS.green);

                const sequencePoints: JXG.Point[] = [];
                for (let i = 1; i < MAX_POINTS_HARD_CAP; i++) {
                    if (i > 0) {
                        const pt = createPoint(board, [1 / i, 0], {
                            ...DEFAULT_POINT_ATTRIBUTES,
                            name: ``,
                            fixed: true
                        });
                        sequencePoints.push(pt);
                    }
                }

                createPoint(board, [0, 0], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: '',
                    fixed: true
                }, COLORS.pink);

                createSegment(board, [
                    [() => p.X() - getRadius(), 0],
                    [() => p.X() + getRadius(), 0]
                ], {
                    strokeWidth: 4,
                    strokeOpacity: 0.6,
                    highlight: false,
                }, () => isIntercepting() ? COLORS.green : COLORS.red);

                // Event Listeners
                p.on('drag', () => {
                    updateColors();
                    updateZoom();
                });
            }}
        />
    );
}