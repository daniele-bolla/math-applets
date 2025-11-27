import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";

export default function EpsilonDeltaApplet() {
    return (
        <JSXGraphBoard
            config={{ 
                boundingbox: [-3, 5, 5.5, -2], 
                axis: true,
            }}
            setup={(board: JXG.Board) => {

                // Function
                const DISCONTINUITY = 1.25;

                const f = (x: number) => {
                    if (x < DISCONTINUITY) {
                        return Math.pow(x,3) *0.3 ;
                    } else {
                        return Math.pow(x,2) ;
                    }
                };

                // Function graph
                board.create('functiongraph', [f], {
                    strokeColor: '#4080aa',
                    strokeWidth: 2,
                });

                // a glider
                const pointA = board.create('glider', [DISCONTINUITY,0, board.defaultAxes.x], {
                    name: 'a',
                    size: 6,
                    face: '<>',
                    fillColor: '#ff00ff',
                    strokeColor: '#000',
                });

                // Point (a, f(a))
                const fpointA = board.create('point', [
                    () => pointA.X(),
                    () => f(pointA.X())
                ], {
                    name: '',
                    size: 2,
                    fillColor: '#000',
                    fixed: true,
                });

                // Vertical line from a to f(a)
                board.create('line', [pointA, fpointA], {
                    dash: 2,
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#000',
                    strokeWidth: 1,
                });

                // Point (0, f(a))
                const pointYfpointA = board.create('point', [
                    0,
                    () => f(pointA.X())
                ], {
                    name: '',
                    size: 2,
                    fillColor: '#000',
                    fixed: true,
                });

                // Horizontal line from (a, f(a)) to (0, f(a))
                board.create('line', [fpointA, pointYfpointA], {
                    dash: 2,
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#000',
                    strokeWidth: 1,
                });

                // ===== EPSILON =====
                // Helper line for epsilon glider (vertical)
                const epsLine = board.create('line', [
                    [0, () => f(pointA.X())],
                    [0, () => f(pointA.X()) + 2.5]
                ], {
                    visible: false,
                    straightFirst: false,
                    straightLast: false
                });

                // Epsilon glider
                const epsPoint = board.create('glider', [
                    1,
                    f(pointA.X()) + 0.5, 
                    epsLine
                ], {
                    name: 'f(a)+ε',
                    size: 6,
                    face: '<>',
                    fillColor: '#00dd66',
                    strokeColor: '#000',
                });

                const getEpsilon = () => Math.abs(epsPoint.Y() - f(pointA.X()));

                // ε line (green)
                board.create('line', [pointYfpointA, epsPoint], {
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#00dd66',
                    strokeWidth: 3,
                });
                // Line (a + ε)
                board.create('line', [
                    [0, () =>  epsPoint.Y()],
                    [1, () =>  epsPoint.Y()]
                ], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 2,
                    dash: 2,
                });

                // Line (a - ε)
                board.create('line', [
                    [0, () =>f(pointA.X()) - getEpsilon()],
                    [1, () => f(pointA.X()) -  getEpsilon()]
                ], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 2,
                    dash: 2,
                });

                // ===== DELTA =====
                // Helper line for delta glider (horizontal)
                const deltaLine = board.create('line', [
                    [() => pointA.X(), 0],
                    [() => pointA.X() + 1.5, 0]
                ], {
                    visible: false,
                    straightFirst: false,
                    straightLast: false
                });

                // Delta glider
                const deltaPoint = board.create('glider', [
                     pointA.X() + 0.75,
                    0,
                    deltaLine
                ], {
                    name: 'a+δ',
                    size: 6,
                    face:'<>',
                    fillColor: '#ffaa33',
                    strokeColor: '#000',
                });

                const getDelta = () => Math.abs(deltaPoint.X() - pointA.X());
                // Line (a+δ)
                board.create('line', [
                    [() =>  deltaPoint.X(), 0],
                    [() =>  deltaPoint.X(), 1]
                ], {
                    strokeColor: '#ffaa33',
                    strokeWidth: 2,
                    dash: 2,
                });

                // Line (a - ε)
                board.create('line', [
                    [() =>  pointA.X() - getDelta(), 0],
                    [() =>  pointA.X()- getDelta(), 1]
                ], {
                    strokeColor: '#ffaa33',
                    strokeWidth: 2,
                    dash: 2,
                });
            //     // δ line (orange)
                board.create('line', [pointA, deltaPoint], {
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#ffaa33',
                    strokeWidth: 3,
                });

                 // ===== POINT X =====
                // Line for x glider (constrained to delta neighborhood)
                const xLine = board.create('line', [
                    [() => pointA.X() - getDelta(), 0],
                    [() => deltaPoint.X(), 0]
                ], {
                    visible: false,
                    straightFirst: false,
                    straightLast: false
                });

                // x glider
                const xPoint = board.create('glider', [
                    pointA.X() + getDelta() / 2,
                    0,
                    xLine
                ], {
                    name: 'x',
                    size: 6,
                    face:"<>",
                    fillColor: '#3366ff',
                    strokeColor: '#000',
                });

                // Point (x, f(x))
                const fxPoint = board.create('point', [
                    () => xPoint.X(),
                    () => f(xPoint.X())
                ], {
                    name: '',
                    size: 2,
                    fillColor: '#000',
                    fixed: true,
                });

                // Point (0, f(x))
                const point0fx = board.create('point', [
                    0,
                    () => f(xPoint.X())
                ], {
                    name: 'f(x)',
                    size: 2,
                    fillColor: '#000',
                    fixed: true,
                });

                // Vertical line from x to f(x)
                board.create('line', [xPoint, fxPoint], {
                    dash: 2,
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#000',
                    strokeWidth: 1,
                });

                // Horizontal line from f(x) to y-axis
                board.create('line', [fxPoint, point0fx], {
                    dash: 2,
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#000',
                    strokeWidth: 1,
                });

                // ===== CONDITION CHECK =====
                // |x - a| line (blue)
                board.create('line', [pointA, xPoint], {
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: '#3366ff',
                    strokeWidth: 3,
                });

                // |f(x) - f(a)| line (changes color)
                board.create('line', [pointYfpointA, point0fx], {
                    straightFirst: false,
                    straightLast: false,
                    strokeColor: () => {
                        const epsilon = getEpsilon();
                        const dist = Math.abs(point0fx.Y() - pointYfpointA.Y());
                        return dist < epsilon ? '#ff00ff' : '#ff0e0eff';
                    },
                    strokeWidth: 3,
                });

            }}
        />
    );
}