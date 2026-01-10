import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
  COLORS,
  createFunctionGraph,
  createGlider,
  createPoint,
  createLine,
  createIntegral,
  createPolygon,
  createSegment,
  createDashedSegment
} from "../../utils/jsxgraph";

export default function IntegralMeanValueTheorem() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1, 5, 8, -3],
        axis: true,
        showNavigation: false,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {

        // f(x) = 0.1 * x^3 + 1
        const f = (x: number) => 0.1 * Math.pow(x, 3) + 1;

        // Antiderivative: F(x) = 0.025 * x^4 + x
        const F = (x: number) => 0.025 * Math.pow(x, 4) + x;

        // Inverse Function: f^-1(y) = cbrt(10 * (y - 1))
        const fInverse = (y: number) => Math.cbrt(10 * (y - 1));

        const curve = createFunctionGraph(board, f, [-10, 10], {
          name: "f(x)",
          withLabel: true,
          label: { position: "rt", offset: [-10, 10], color: COLORS.blue },
        }, COLORS.blue);

        const xAxisPoint1 = board.create('point', [0, 0], { visible: false });
        const xAxisPoint2 = board.create('point', [1, 0], { visible: false });
        const xAxis = createLine(board, [xAxisPoint1, xAxisPoint2], { visible: false }, COLORS.black);

        const A = createGlider(board, [1, 0, xAxis], {
          name: "a",
        }, COLORS.blue);

        const B = createGlider(board, [4, 0, xAxis], {
          name: "b",
        }, COLORS.blue);

        const interval = () => {
          const a = A.X();
          const b = B.X();
          return { start: Math.min(a, b), end: Math.max(a, b) };
        };

        const meanValue = () => {
          const { start, end } = interval();
          if (Math.abs(end - start) < 1e-6) return f(start);
          return (F(end) - F(start)) / (end - start);
        };

        const extrema = () => {
          const { start, end } = interval();
          return {
            min: f(start),
            max: f(end)
          };
        };

        createIntegral(board, [() => interval().start, () => interval().end], curve, {
        }, COLORS.blue);

        // labeled points m and M
        createPoint(board, [
          () => interval().start,
          () => extrema().min,
        ], {
          name: "m",
          label: { offset: [-10, -10], color: "gray" },
        }, "gray");

        createPoint(board, [
          () => interval().end,
          () => extrema().max,
        ], {
          name: "M",
          label: { offset: [-10, 10], color: "gray" },
        }, "gray");

        // Horizontal Min/Max Lines
        const minLinePoint1 = board.create('point', [() => interval().start, () => extrema().min], { visible: false });
        const minLinePoint2 = board.create('point', [() => interval().end, () => extrema().min], { visible: false });
        createLine(board, [minLinePoint1, minLinePoint2], { dash: 2, strokeWidth: 0.5 }, "gray");

        const maxLinePoint1 = board.create('point', [() => interval().start, () => extrema().max], { visible: false });
        const maxLinePoint2 = board.create('point', [() => interval().end, () => extrema().max], { visible: false });
        createLine(board, [maxLinePoint1, maxLinePoint2], { dash: 2, strokeWidth: 0.5 }, "gray");

        // Mean Value Rectangle
        createPolygon(board, [
          [() => interval().start, 0],
          [() => interval().end, 0],
          [() => interval().end, meanValue],
          [() => interval().start, meanValue],
        ], {
          borders: {  strokeColor: COLORS.red },
        }, COLORS.red);

        const getXi = () => fInverse(meanValue());

        const xiPoint = createPoint(board, [getXi, meanValue], {
          name: "f(ξ)",
          label: { offset: [0, 10], fontSize: 14, color: COLORS.green },
        }, COLORS.green);

        createDashedSegment(board, [xiPoint, [() => xiPoint.X(), 0]], {
        }, COLORS.green);
      }}
    />
  );
}