import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS, createText, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function CauchyMVTParametricCurve() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-4, 4.5, 6, -6.5],
        showNavigation: false,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        //  f,g with g'(x) != 0 
        const f = (x: number) => 0.3 * x * x * x - x;
        const df = (x: number) => 0.9 * x * x - 1;

        const g = (x: number) => x;
        const dg = (_x: number) => 1; // never 0

        const xmin = -2.8;
        const xmax = 2.8;

        // ---------------------------------------------------------
        //  (g,f)-plane: t ↦ (g(t), f(t))
        // ---------------------------------------------------------
        const curve = board.create(
          "curve",
          [(t: number) => g(t), (t: number) => f(t), xmin, xmax],
          { strokeColor: COLORS.blue, strokeWidth: 4 }
        ) as JXG.Curve;

        createText(board, [5, -0.6], "g(x)", {
          fixed: true,
          anchorX: "left",
        });
        createText(board, [-0.8, 4], "f(x)", {
          fixed: true,
          anchorX: "left",
        });


        const A = board.create("glider", [g(-1.2), f(-1.2), curve], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "",
          strokeColor: COLORS.green,
          fillColor: COLORS.green,
        }) as JXG.Point;

        const B = board.create("glider", [g(1.2), f(1.2), curve], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "",
          strokeColor: COLORS.red,
          fillColor: COLORS.red,
        }) as JXG.Point;

        // left/right endpoint coordinates in the (g,f)-plane
        const leftX = () => (A.X() <= B.X() ? A.X() : B.X());
        const leftY = () => (A.X() <= B.X() ? A.Y() : B.Y());
        const rightX = () => (A.X() <= B.X() ? B.X() : A.X());
        const rightY = () => (A.X() <= B.X() ? B.Y() : A.Y());

        board.create("text", [() => leftX() + 0.15, () => leftY() + 0.15, "(g(a), f(a))"], {
          fontSize: 12,
          color: COLORS.green,
        });
        board.create("text", [() => rightX() + 0.15, () => rightY() + 0.15, "(g(b), f(b))"], {
          fontSize: 12,
          color: COLORS.red,
        });

        // Secant line AB
        const secant = board.create("line", [A, B], {
          strokeColor: COLORS.orange,
          strokeWidth: 3,
        }) as JXG.Line;

        //    Since g(t)=t, the parameter is exactly the x-coordinate.
        const getAparam = () => leftX();
        const getBparam = () => rightX();

        // Find ξ in (a,b) such that h'(ξ)=0
        //    With g'(t)=1:
        //    h'(t) = dF - dG*(0.9 t^2 - 1)
        //                = (dF + dG) - 0.9 dG t^2
        //    => t^2 = (dF + dG) / (0.9 dG)
        const findXi = () => {
          const a = getAparam();
          const b = getBparam();

          if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(b - a) < 1e-6) {
            return 0.5 * (a + b);
          }

          const left = Math.min(a, b);
          const right = Math.max(a, b);

          const dF = f(right) - f(left);
          const dG = right - left;


          const t2 = (dF + dG) / (0.9 * dG);
          const mid = 0.5 * (left + right);

          if (t2 < 0 || Math.abs(dG) < 1e-12) return NaN;

          const s = Math.sqrt(t2);
          const candidates = [s, -s];
          const inside = candidates.filter((t) => t > left && t < right);

          if (inside.length === 1) return inside[0];
          if (inside.length === 2) {
            return Math.abs(inside[0] - mid) < Math.abs(inside[1] - mid) ? inside[0] : inside[1];
          }
          return NaN;
        };


        // ξ point on the parametric curve
        const Xi = board.create(
          "point",
          [() => g(findXi()), () => f(findXi())],
          { name: "", size: 5, fixed: true, strokeColor: COLORS.purple, fillColor: COLORS.purple }
        ) as JXG.Point;

        board.create("text", [() => Xi.X() + 0.15, () => Xi.Y() + 0.15, "(g(ξ), f(ξ))"], {
          fontSize: 12,
          color: COLORS.purple,
        });

        // Parallel through ξ to the secant
        board.create("parallel", [secant, Xi], {
          strokeColor: COLORS.purple,
          strokeWidth: 3,

        });

      }}
    />
  );
}