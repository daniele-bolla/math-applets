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
        axis: true,
        showNavigation: false,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {

        // f(t) = 0.1 t^3 + 1
        const f = (t: number) => 0.1 * t ** 3 + 1;

        // Antiderivative (used only for graph & quotient)
        const F = (x: number) => 0.025 * x ** 4 + x;

        // Explicit inverse of f
        const fInverse = (y: number) => Math.cbrt(10 * (y - 1));


        const px = createGlider(board, [2, 0, board.defaultAxes.x], {
          name: "x",
        }, COLORS.green);

        const pxh = createGlider(board, [3.5, 0, board.defaultAxes.x], {
          name: "x+h",
        }, COLORS.purple);

        const h = () => Math.abs(pxh.X() - px.X());


        const graphf = createFunctionGraph(board, f, [-2, 10], {
          name: "f(t)",
          withLabel: true,
          label: { position: "rt", color: COLORS.blue },
        }, COLORS.blue);

        createFunctionGraph(board, F, [-2, 10], {
          name: "F(x)",
          withLabel: true,
          label: { position: "rt", color: COLORS.red },
        }, COLORS.red);


        // Blue area: F(x) = ∫₀ˣ f(t) dt
        createIntegral(board, [0, () => px.X()], graphf, {}, COLORS.blue);

        // Orange slice: ∫ₓ^{x+h} f(t) dt
        createIntegral(board, [() => px.X(), () => pxh.X()], graphf, {}, COLORS.orange);


        const averageValue = () => {
          if (Math.abs(h()) < 1e-6) return f(px.X());
          return (F(pxh.X()) - F(px.X())) / h();
        };


        const xi = () => fInverse(averageValue());

        const xiPoint = createPoint(board, [xi, averageValue], {
          name: "f(ξₕ)",
          fixed: true,
          label: { offset: [0, 12], color: COLORS.green },
        }, COLORS.green);

        createDashedSegment(board, [xiPoint, [xi, 0]], {
          dash: 2,
        }, COLORS.green);

        createPoint(board, [xi, 0], {
          name: "ξₕ",
          label: { offset: [0, -10], color: COLORS.green },
        }, COLORS.green);


        createPolygon(board, [
          [() => px.X(), 0],
          [() => pxh.X(), 0],
          [() => pxh.X(), averageValue],
          [() => px.X(), averageValue],
        ], {
          fillOpacity: 0.15,
          borders: { dash: 1, strokeWidth: 1 },
          vertices: { visible: false },
        }, COLORS.green);

        const Fx = createPoint(board, [
          () => px.X(),
          () => F(px.X()),
        ], {
          name: "F(x)",
          size: 3,
          fixed: true,
          label: { offset: [6, 6], color: COLORS.red },
        }, COLORS.red);

        const Fxh = createPoint(board, [
          () => pxh.X(),
          () => F(pxh.X()),
        ], {
          name: "F(x+h)",
          size: 3,
          fixed: true,
          label: { offset: [6, 6], color: COLORS.red },
        }, COLORS.red);

        board.create("line", [Fx, Fxh], {
            strokeColor:()=> h() < 0.1 ? COLORS.purple : COLORS.red,
            dash:  h() < 0.1 ? 2 : 0,
            strokeOpacity: 0.6,
            strokeWidth:()=> h() < 0.1 ? 3 : 1,
        });
      }}
    />
  );
}
