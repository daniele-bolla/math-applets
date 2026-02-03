import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
    COLORS,
    createSegment,
    createGlider,
    createLine,
    createPoint
} from "../../utils/jsxgraph";

export default function ConvergenceSequenceApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 1, 10, -1],                
                showZoom: false,
                zoom: {  enabled: false },
                pan: { enabled: false }, }}
            setup={(board: JXG.Board) => {

                const sequence = (n: number) => 1 / n;
                const limit = 0;

                // Calculate N for given epsilon
                function findN(epsilon: number): number {
                    return Math.ceil(1 / epsilon);
                }

                // Create a constrained segment for epsilon glider
                const epsilonSegment = createSegment(board, [
                    [0, 0.05],
                    [0, 1]
                ], {
                    visible: false,
                    fixed: true,
                });

                // Draggable epsilon point
                const epsilonPoint = createGlider(board, [0, 0.3, epsilonSegment], {
                    name: 'ε',
                }, COLORS.green);

                // Limit line
                createLine(board, [
                    [0, limit],
                    [1, limit]
                ], {
                    strokeWidth: 2,
                    fixed: true,
                }, COLORS.blue);

                // Limit point
                createPoint(board, [0, limit], {
                    name: 'a',
                    fixed: true,
                }, COLORS.blue);

                // Upper boundary (a + ε)
                createLine(board, [
                    [0, () => limit + epsilonPoint.Y()],
                    [1, () => limit + epsilonPoint.Y()]
                ], {
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                }, COLORS.green);

                // Lower boundary (a - ε)
                createLine(board, [
                    [0, () => limit - epsilonPoint.Y()],
                    [1, () => limit - epsilonPoint.Y()]
                ], {
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                }, COLORS.green);


                // Sequence points with spacing
                let sequencePoints: JXG.Point[] = [];
                let sequenceLabels: JXG.Text[] = [];
                const maxPoints = 60;

                function createSequencePoints() {
                    sequencePoints.forEach(p => board.removeObject(p));
                    sequenceLabels.forEach(l => board.removeObject(l));
                    sequencePoints = [];
                    sequenceLabels = [];

                    const epsilon = epsilonPoint.Y();
                    const N = findN(epsilon);

                    for (let n = 1; n <= maxPoints; n++) {
                        const an = sequence(n);
                        const isAfterN = n >= N;
                        const point = createPoint(board, [n, an], {
                            name: '',
                            fixed: true,
                        }, isAfterN ? COLORS.purple : COLORS.red);
                        sequencePoints.push(point);
                    }
                }
                // N vertical line
                let NLine: JXG.Line | null = null;
                let NPoint: JXG.Point | null = null;

                function updateNLine() {
                    if (NLine) board.removeObject(NLine);
                    if (NPoint) board.removeObject(NPoint);

                    const epsilon = epsilonPoint.Y();
                    const N = findN(epsilon);

                    NLine = createLine(board, [
                        [N, -1],
                        [N, 1]
                    ], {
                        strokeWidth: 3,
                        straightFirst: true,
                        straightLast: true,
                        dash: 1,
                        fixed: true,
                    }, COLORS.purple);

                    NPoint = createPoint(board, [N, 0], {
                        name: `N_ε`,
                        fixed: true,
                        label: { offset: [5, -15], fontSize: 12 }
                    }, COLORS.purple);
                }

                // Initialize
                createSequencePoints();
                updateNLine();

                // Update on epsilon change
                epsilonPoint.on('drag', () => {
                    createSequencePoints();
                    updateNLine();
                });

            }}
        />
    );
}
