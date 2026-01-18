import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
  COLORS,
  createFunctionGraph,
  createGlider,
  createPoint,
  createDashedSegment,
  createPolygon,
  createIntegral,
} from "../../utils/jsxgraph";

export default function FundamentalTheoremOfCalculs() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1, 10, 9, -2],
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        // f(t) = 0.1 t^3 + 1
        const f = (t: number) => 0.1 * t ** 3 + 1;

        // Antiderivative 
        const F = (x: number) => 0.025 * x ** 4 + x;

        // Explicit inverse of f (valid since f is strictly increasing here)
        const fInverse = (y: number) => Math.cbrt(10 * (y - 1));

        const px = createGlider(board, [2, 0, board.defaultAxes.x], { name: "x" }, COLORS.green);
        const pxh = createGlider(board, [3.5, 0, board.defaultAxes.x], { name: "x+h" }, COLORS.purple);

        // interval as [xL, xR] with xL <= xR
        const xL = () => Math.min(px.X(), pxh.X());
        const xR = () => Math.max(px.X(), pxh.X());
        const width = () => xR() - xL();

        const graphf = createFunctionGraph(
          board,
          f,
          [-2, 10],
          {
            name: "f(t)",
            withLabel: true,
            label: { position: "rt", color: COLORS.blue },
          },
          COLORS.blue
        );

        createFunctionGraph(board, F, [-2, 10], {}, COLORS.red);

        // Blue area: F(x) = ∫_0^x f(t) dt  
        createIntegral(board, [-2, () => px.X()], graphf, {}, COLORS.blue);

        // Orange slice: always ∫_{xL}^{xR} f(t) dt
        createIntegral(board, [xL, xR], graphf, {}, COLORS.orange);

        const meanValue = () => {
          return (F(xR()) - F(xL())) / width();
        };

        const xi = () => fInverse(meanValue());

        const xiVisible = () => Number.isFinite(xi()) && Number.isFinite(meanValue());

        const xiPoint = createPoint(
          board,
          [xi, meanValue],
          {
            name: "f(ξₕ)",
            fixed: true,
            visible: xiVisible,
            label: { offset: [0, 12], color: COLORS.green },
          },
          COLORS.green
        );

        createDashedSegment(
          board,
          [xiPoint, [xi, 0]],
          {
            dash: 2,
            visible: xiVisible,
          },
          COLORS.green
        );

        createPoint(
          board,
          [xi, 0],
          {
            name: "ξₕ",
            visible: xiVisible,
            label: { offset: [0, -10], color: COLORS.green },
          },
          COLORS.green
        );

        createPolygon(
          board,
          [
            [xL, 0],
            [xR, 0],
            [xR, meanValue],
            [xL, meanValue],
          ],
          {
            fillOpacity: 0.15,
            borders: { dash: 1, strokeWidth: 1 },
            vertices: { visible: false },
            visible: () => width() >= 1e-6 && Number.isFinite(meanValue()),
          },
          COLORS.green
        );

        const Fx = createPoint(
          board,
          [() => px.X(), () => F(px.X())],
          {
            name: "F(x)",
            size: 3,
            fixed: true,
            label: { offset: [6, 6], color: COLORS.red },
          },
          COLORS.red
        );

        const Fxh = createPoint(
          board,
          [() => pxh.X(), () => F(pxh.X())],
          {
            name: "F(x+h)",
            size: 3,
            fixed: true,
            label: { offset: [6, 6], color: COLORS.red },
          },
          COLORS.red
        );

        const hSigned = () => pxh.X() - px.X();

        board.create("line", [Fx, Fxh], {
          strokeColor: () => (Math.abs(hSigned()) < 0.1 ? COLORS.purple : COLORS.red),
          strokeWidth: () => (Math.abs(hSigned()) < 0.1 ? 3 : 1),
        });
      }}
    />
  );
}