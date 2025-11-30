import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES, DEFAULT_POINT_ATTRIBUTES } from "../../utils/jsxgraph";

export default function ConvergenceSequenceApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 1, 10, -1], axis: true }}
            setup={(board: JXG.Board) => {

                const sequence = (n: number) => 1 / n;
                const limit = 0;

                // Calculate N for given epsilon
                function findN(epsilon: number): number {
                    return Math.ceil(1 / epsilon);
                }

                // Create a constrained segment for epsilon glider
                const epsilonSegment = board.create('segment', [
                    [0, 0.05],
                    [0, 1]
                ], {
                    visible: false,
                    fixed: true,
                });

                // Draggable epsilon point
                const epsilonPoint = board.create('glider', [0, 0.3, epsilonSegment], {
                    ...DEFAULT_GLIDER_ATTRIBUTES,
                    name: 'ε',
                    fillColor: COLORS.orange,
                    strokeColor: COLORS.darkOrange,
                });

                // Limit line
                board.create('line', [
                    [0, limit],
                    [1, limit]
                ], {
                    strokeColor: COLORS.blue,
                    strokeWidth: 2,
                    fixed: true,
                });
                // Limit point
                board.create('point', [0, limit], {
                    ...DEFAULT_POINT_ATTRIBUTES,
                    name: 'a',
                    fillColor: COLORS.blue,
                    strokeColor: COLORS.darkBlue,
                    fixed: true,
                });

                // Upper boundary (a + ε)
                board.create('line', [
                    [0, () => limit + epsilonPoint.Y()],
                    [1, () => limit + epsilonPoint.Y()]
                ], {
                    strokeColor: COLORS.green,
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                });

                // Lower boundary (a - ε)
                board.create('line', [
                    [0, () => limit - epsilonPoint.Y()],
                    [1, () => limit - epsilonPoint.Y()]
                ], {
                    strokeColor: COLORS.green,
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                });


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
                        const point = board.create('point', [n, an], {
                            ...DEFAULT_POINT_ATTRIBUTES,
                            name: '',
                            fillColor: isAfterN ? COLORS.purple : COLORS.red,
                            strokeColor: isAfterN ? COLORS.darkPurple : COLORS.darkRed,
                            fixed: true,
                        });
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

                    NLine = board.create('line', [
                        [N, -1],
                        [N, 1]
                    ], {
                        strokeColor: COLORS.purple,
                        strokeWidth: 3,
                        straightFirst: true,
                        straightLast: true,
                        dash: 1,
                        fixed: true,
                    });

                    NPoint = board.create('point', [N, 0], {
                        ...DEFAULT_POINT_ATTRIBUTES,
                        name: `N_ε`,
                        fillColor: COLORS.purple,
                        strokeColor: COLORS.darkPurple,
                        fixed: true,
                        label: { offset: [5, -15], fontSize: 12 }
                    });
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
