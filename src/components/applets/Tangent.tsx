import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";

export default function TangentApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 5, 5, -1], axis: true }}
            setup={(board: JXG.Board) => {

                const f = (x: number) => x * x;
                const fPrime = (x: number) => 2 * x;

                const graph = board.create('functiongraph', [f, -10, 10], {
                    strokeColor: '#2196F3',
                    strokeWidth: 3,
                });

                board.create('text', [3.5, f(3.5) + 0.3, 'f(x) = x²'], {
                    fontSize: 16,
                    color: '#2196F3',
                    fixed: true,
                });

                const pointA = board.create('glider', [0.5, f(0.5), graph], {
                    name: '(a, f(a))',
                    face: '<>',
                    size: 6,
                    fillColor: '#4CAF50',
                    strokeColor: '#2E7D32',
                });


                const hSlider = board.create('slider', [
                    [0.5, -0.5],
                    [3, -0.5],
                    [0.001, 1, 3]
                ], {
                    name: 'h',
                    snapWidth: 0.01,
                });

                // Point B = A + h
                const pointB = board.create('point', [
                    () => pointA.X() + hSlider.Value(),
                    () => f(pointA.X() + hSlider.Value())
                ], {
                    name: '(a + h, f(a + h))',
                    size: 2,
                    fillColor: '#F44336',
                    strokeColor: '#C62828',
                    fixed: true,
                    visible: () => hSlider.Value() >= 0.1
                });


                // Secant line through A and B
                board.create('line', [pointA, pointB], {
                    strokeColor: '#FF6B6B',
                    strokeWidth: 3,
                    dash: 1,
                    straightFirst: true,
                    straightLast: true,
                    visible: () => hSlider.Value() >= 0.1

                });

                // Secant line label
                board.create('text', [
                    () => (pointA.X() + pointB.X()) / 2 + 0.2,
                    () => (pointA.Y() + pointB.Y()) / 2 + 0.3,
                    () => `Secant: slope = ${((pointB.Y() - pointA.Y()) / (hSlider.Value())).toFixed(3)}`
                ], {
                    fontSize: 12,
                    color: '#FF6B6B',
                    fixed: true,
                    // visible: () => hSlider.Value() >= 0.1
                });

                // Tangent line at A
                board.create('line', [
                    pointA,
                    [() => pointA.X() + 1, () => pointA.Y() + fPrime(pointA.X())]
                ], {
                    strokeColor: '#9C27B0',
                    strokeWidth: 3,
                    straightFirst: true,
                    straightLast: true,
                    visible: () => hSlider.Value() < 0.1,
                });

                board.create('text', [
                    () => pointA.X() + 0.5,
                    () => pointA.Y() + fPrime(pointA.X()) * 0.5 + 0.3,
                    () => `Tangent: f'(${pointA.X()}) = ${fPrime(pointA.X()).toFixed(3)}`
                ], {
                    fontSize: 12,
                    color: '#9C27B0',
                    fixed: true,
                    visible: () => hSlider.Value() < 0.1
                });

                board.create('segment', [
                    [() => pointA.X(), 0],
                    pointA
                ], {
                    strokeColor: '#4CAF50',
                    strokeWidth: 1,
                    dash: 2,
                });

                board.create('segment', [
                    [() => pointB.X(), 0],
                    pointB
                ], {
                    strokeColor: '#F44336',
                    strokeWidth: 1,
                    dash: 2,
                });

                board.create('segment', [
                    [() => pointA.X(), 0],
                    [() => pointB.X(), 0]
                ], {
                    strokeColor: '#FF9800',
                    strokeWidth: 2,
                    lastArrow: true,
                });

                board.create('text', [
                    () => (pointA.X() + pointB.X()) / 2,
                    -0.25,
                    () => `h = ${hSlider.Value().toFixed(3)}`
                ], {
                    fontSize: 12,
                    color: '#FF9800',
                    fixed: true,
                });

                board.create('segment', [
                    [() => pointB.X(), () => pointA.Y()],
                    pointB
                ], {
                    strokeColor: '#FF9800',
                    strokeWidth: 2,
                    lastArrow: true,
                });

                board.create('text', [
                    () => pointB.X() + 0.15,
                    () => (pointA.Y() + pointB.Y()) / 2,
                    () => `Δf = ${(pointB.Y() - pointA.Y()).toFixed(3)}`
                ], {
                    fontSize: 12,
                    color: '#FF9800',
                    fixed: true,
                });
            }}
        />
    );
}
