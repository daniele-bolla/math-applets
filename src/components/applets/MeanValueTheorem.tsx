import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";

export default function MVTApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 5, 5, -1], axis: true }}
            setup={(board: JXG.Board) => {

                const f = (x: number) => 0.2 * x * x * x - 0.5 * x * x + 2;
                // const fPrime = (x: number) => 0.6 * x * x - x;

                board.create('functiongraph', [f, -10, 10], {
                    strokeColor: '#2196F3',
                    strokeWidth: 3,
                }); 

                const intervalABLimits = board.create('segment', [[-6.5, 0], [6.5, 0]], {
                    visible: false,
                    fixed: true,
                });
 
                const pointA = board.create('glider', [0.5, 0,intervalABLimits], {
                    name: 'a',
                    face: '<>',
                    size: 6,
                    fillColor: '#4CAF50',
                    strokeColor: '#2E7D32',
                });

                const pointB = board.create('glider', [3.5, 0, intervalABLimits], {
                    name: 'b',
                    face: '<>',
                    size: 6,
                    fillColor: '#F44336',
                    strokeColor: '#C62828',
                });

                const pointFA = board.create('point', [
                    () => pointA.X(),
                    () => f(pointA.X())
                ], {
                    name: 'f(a)',
                    size: 2,
                    fillColor: '#4CAF50',
                    strokeColor: '#2E7D32',
                    fixed: true,
                });

                const pointFB = board.create('point', [
                    () => pointB.X(),
                    () => f(pointB.X())
                ], {
                    name: 'f(b)',
                    size: 2,
                    fillColor: '#F44336',
                    strokeColor: '#C62828',
                    fixed: true,
                });

                const secant = board.create('line', [pointFA, pointFB], {
                    strokeColor: '#FF6B6B',
                    strokeWidth: 2,
                    dash: 2,
                    straightFirst: true,
                    straightLast: true,
                });

            function findC(): number {
                const a = pointA.X();
                const b = pointB.X();
                const fa = f(a);
                const fb = f(b);
                const secantSlope = (fb - fa) / (b - a);
                // Solve: 0.6c² - c = secantSlope
                // 0.6c² - c - secantSlope = 0
                // Using quadratic formula: c = (1 ± √(1 + 4*0.6*secantSlope)) / (2*0.6)
                const discriminant = 1 + 4 * 0.6 * secantSlope;
                if (discriminant < 0) {
                    return NaN; // No real solution
                }
                const cPos = (1 + Math.sqrt(discriminant)) / (2 * 0.6);
                const cNeg = (1 - Math.sqrt(discriminant)) / (2 * 0.6);
                const minAB = Math.min(a, b);
                const maxAB = Math.max(a, b);
                // Return the root that's in [a, b]
                if (cPos >= minAB && cPos <= maxAB) {
                    return cPos;
                } else if (cNeg >= minAB && cNeg <= maxAB) {
                    return cNeg;
                } else {
                    return NaN;
                }
            }

                const pointConX = board.create('point', [
                    () => findC(),
                    () => 0
                ], {
                    name: 'c',
                    size: 2,
                    fillColor: '#9C27B0',
                    strokeColor: '#6A1B9A',
                    fixed: true,
                });
                const pointC = board.create('point', [
                    () => findC(),
                    () => f(findC())
                ], {
                    name: 'f(c)',
                    size: 2,
                    fillColor: '#9C27B0',
                    strokeColor: '#6A1B9A',
                    fixed: true,
                });

                board.create('parallel', [secant, pointC], {
                    strokeColor: '#9C27B0',
                    strokeWidth: 3,
                    straightFirst: true,
                    straightLast: true,
                });

                board.create('segment', [
                    [() => pointA.X(), 0],
                    pointFA
                ], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 1,
                    dash: 2,
                });

                board.create('segment', [
                    [() => pointB.X(), 0],
                    pointFB
                ], {
                    strokeColor: '#F44336',
                    strokeWidth: 1,
                    dash: 2,
                });

                board.create('segment', [
                    pointConX,
                    pointC
                ], {
                    strokeColor: '#9C27B0',
                    strokeWidth: 1,
                    dash: 2,
                });

            }}
        />
    );
}
