import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";

export default function LimitApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 1, 10, -1], axis: true }}
            setup={(board: JXG.Board) => {

                const sequence = (n: number) => 1 / n;
                const limit = 0;

                // Transform n to x-coordinate using log scale
                const transformN = (n: number) => n * 0.25;

                // Calculate N for given epsilon
                function findN(epsilon: number): number {
                    return Math.ceil(1 / epsilon);
                }

                // Create a constrained segment for epsilon glider
                const epsilonSegment = board.create('segment', [
                    [0, 0.05],
                    [0, 0.8]
                ], {
                    visible: false,
                    fixed: true,
                });

                // Draggable epsilon point
                const epsilonPoint = board.create('glider', [0, 0.3, epsilonSegment], {
                    name: 'ε',
                    face: '<>',
                    size: 6,
                    fillColor: '#FF9800',
                    strokeColor: '#E65100',
                });

                // Limit line
                board.create('line', [
                    [0, limit],
                    [1, limit]
                ], {
                    strokeColor: '#2196F3',
                    strokeWidth: 2,
                    fixed: true,
                });

                // Limit point
                board.create('point', [0, limit], {
                    name: 'a',
                    size: 2,
                    fillColor: '#2196F3',
                    strokeColor: '#1976D2',
                    fixed: true,
                });

                // Upper boundary (a + ε)
                board.create('line', [
                    [0, () => limit + epsilonPoint.Y()],
                    [1, () => limit + epsilonPoint.Y()]
                ], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                });

                // Lower boundary (a - ε)
                board.create('line', [
                    [0, () => limit - epsilonPoint.Y()],
                    [1, () => limit - epsilonPoint.Y()]
                ], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 2,
                    dash: 2,
                    fixed: true,
                });

                // Shaded ε-neighborhood
                board.create('polygon', [
                    [0, () => limit - epsilonPoint.Y()],
                    [10, () => limit - epsilonPoint.Y()],
                    [10, () => limit + epsilonPoint.Y()],
                    [0, () => limit + epsilonPoint.Y()]
                ], {
                    fillColor: '#4CAF50',
                    fillOpacity: 0.15,
                    borders: { strokeColor: 'transparent' },
                    fixed: true,
                });

                // Sequence points with logarithmic spacing
                let sequencePoints: any[] = [];
                let sequenceLabels: any[] = [];
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
                        const xPos = n //transformN(n);
                        const isAfterN = n >= N;

                        const point = board.create('point', [xPos, an], {
                            name: '',
                            size: 3,
                            fillColor: isAfterN ? '#9C27B0' : '#F44336',
                            strokeColor: isAfterN ? '#6A1B9A' : '#C62828',
                            fixed: true,
                        });
                        sequencePoints.push(point);

                    }
                }

                // N vertical line
                let NLine: any = null;
                let NPoint: any = null;

                function updateNLine() {
                    if (NLine) board.removeObject(NLine);
                    if (NPoint) board.removeObject(NPoint);

                    const epsilon = epsilonPoint.Y();
                    const N = findN(epsilon);
                    const xN = transformN(N);

                    NLine = board.create('line', [
                        [xN, -1],
                        [xN, 1]
                    ], {
                        strokeColor: '#9C27B0',
                        strokeWidth: 3,
                        straightFirst: true,
                        straightLast: true,
                        dash: 1,
                        fixed: true,
                    });

                    NPoint = board.create('point', [xN, 0], {
                        name: `N=${N}`,
                        size: 3,
                        fillColor: '#9C27B0',
                        strokeColor: '#6A1B9A',
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