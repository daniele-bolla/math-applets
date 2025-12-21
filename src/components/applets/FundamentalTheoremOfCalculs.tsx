import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
  COLORS,
  DEFAULT_GLIDER_ATTRIBUTES,
  DEFAULT_POINT_ATTRIBUTES,
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


        const px = board.create("glider", [2, 0, board.defaultAxes.x], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "x",
          color: COLORS.green,
        });

        const pxh = board.create("glider", [3.5, 0, board.defaultAxes.x], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "x+h",
          color: COLORS.purple,
        });

        const h = () => Math.abs(pxh.X() - px.X());


        const graphf = board.create("functiongraph", [f, -2, 10], {
          strokeColor: COLORS.blue,
          strokeWidth: 2,
          name: "f(t)",
          withLabel: true,
          label: { position: "rt", color: COLORS.blue },
        });

        board.create("functiongraph", [F, -2, 10], {
          strokeColor: COLORS.red,
          strokeWidth: 3,
          name: "F(x)",
          withLabel: true,
          label: { position: "rt", color: COLORS.red },
        });


        // Blue area: F(x) = ∫₀ˣ f(t) dt
        board.create("integral", [[0, () => px.X()], graphf], {
          color: COLORS.blue,
          fillOpacity: 0.2,
          label: { visible: false },
        });

        // Orange slice: ∫ₓ^{x+h} f(t) dt
        board.create("integral", [[() => px.X(), () => pxh.X()], graphf], {
          color: COLORS.orange,
          fillOpacity: 0.35,
          label: { visible: false },
        });


        const averageValue = () => {
          if (Math.abs(h()) < 1e-6) return f(px.X());
          return (F(pxh.X()) - F(px.X())) / h();
        };


        const xi = () => fInverse(averageValue());

        const xiPoint = board.create("point", [xi, averageValue], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "f(ξₕ)",
          color: COLORS.green,
          fixed: true,
          label: { offset: [0, 12], color: COLORS.green },
        });

        board.create("segment", [xiPoint, [xi, 0]], {
          strokeColor: COLORS.green,
          dash: 2,
          strokeWidth: 1,
        });

        board.create("point", [xi, 0], {
          name: "ξₕ",
          size: 0,
          label: { offset: [0, -10], color: COLORS.green },
        });


        board.create("polygon", [
          [() => px.X(), 0],
          [() => pxh.X(), 0],
          [() => pxh.X(), averageValue],
          [() => px.X(), averageValue],
        ], {
          fillColor: COLORS.green,
          fillOpacity: 0.15,
          borders: { dash: 2, strokeWidth: 2 },
          vertices: { visible: false },
        });

        const Fx = board.create("point", [
          () => px.X(),
          () => F(px.X()),
        ], {
          name: "F(x)",
          size: 3,
          color: COLORS.red,
          fixed: true,
          label: { offset: [6, 6], color: COLORS.red },
        });

        const Fxh = board.create("point", [
          () => pxh.X(),
          () => F(pxh.X()),
        ], {
          name: "F(x+h)",
          size: 3,
          color: COLORS.red,
          fixed: true,
          label: { offset: [6, 6], color: COLORS.red },
        });

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
