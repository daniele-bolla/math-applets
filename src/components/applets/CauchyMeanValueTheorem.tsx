import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
  COLORS,
  DEFAULT_GLIDER_ATTRIBUTES,
  createLine,
  createGlider,
  createFunctionGraph,
  createPoint,
} from "../../utils/jsxgraph";

/**
 * CMVT (Math.SE interpretation):
 * r = (f(b)-f(a)) / (g(b)-g(a)), compare f with r·g.
 * h(x)=f(x)-r g(x) has h(a)=h(b) -> Rolle -> ∃ ξ with h'(ξ)=0
 * i.e. f'(ξ)=r g'(ξ).
 */
export default function CauchyMVTApplet() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-3, 14, 8, -12],
        axis: true,
      }}
      setup={(board: JXG.Board) => {
        board.suspendUpdate();

        // ---------------------------
        // 1) f and g (with g'(x) != 0)
        // ---------------------------
        const f = (x: number) => 0.4 * x * x + 6;
        const df = (x: number) => 0.8 * x;

        const g = (x: number) => 0.1 * x * x * x + x - 8;
        const dg = (x: number) => 0.3 * x * x + 1; // > 0 always

        // ---------------------------
        // 2) Endpoints a,b on a hidden axis
        // ---------------------------
        const xAxis = createLine(board, [[0, 0], [1, 0]], { visible: false });

        const aGlider = createGlider(
          board,
          [-1, 0, xAxis],
          { ...DEFAULT_GLIDER_ATTRIBUTES, name: "a", label: { offset: [0, -20], color: COLORS.blue } },
          COLORS.blue
        );

        const bGlider = createGlider(
          board,
          [3, 0, xAxis],
          { ...DEFAULT_GLIDER_ATTRIBUTES, name: "b", label: { offset: [0, -20], color: COLORS.blue } },
          COLORS.blue
        );

        const getA = () => Math.min(aGlider.X(), bGlider.X());
        const getB = () => Math.max(aGlider.X(), bGlider.X());

        // ---------------------------
        // 3) r, r·g, h = f - r g
        // ---------------------------
        const getR = () => {
          const a = getA();
          const b = getB();
          const denom = g(b) - g(a);
          if (Math.abs(denom) < 1e-10) return NaN;
          return (f(b) - f(a)) / denom;
        };

        const rg = (x: number) => getR() * g(x);
        const h = (x: number) => f(x) - rg(x);
        const dh = (x: number) => df(x) - getR() * dg(x); // h'(x)

        // ---------------------------
        // 4) Find ξ in (a,b) such that h'(ξ)=0  (Rolle)
        // ---------------------------
        const findXi = () => {
          const a = getA();
          const b = getB();
          if (Math.abs(b - a) < 1e-4) return 0.5 * (a + b);

          const steps = 140;
          let xPrev = a;
          let vPrev = dh(xPrev);

          for (let i = 1; i <= steps; i++) {
            const x = a + (b - a) * (i / steps);
            const v = dh(x);

            if (!Number.isFinite(vPrev) || !Number.isFinite(v)) {
              xPrev = x;
              vPrev = v;
              continue;
            }

            if (vPrev === 0) return xPrev;
            if (v === 0) return x;

            if (vPrev * v < 0) {
              const w = Math.abs(vPrev) / (Math.abs(vPrev) + Math.abs(v));
              return xPrev + (x - xPrev) * w;
            }

            xPrev = x;
            vPrev = v;
          }

          return 0.5 * (a + b);
        };

        const getXi = () => findXi();

        // ---------------------------
        // 5) TOP: f and r·g + secants + tangents (infinite lines)
        // ---------------------------
        createFunctionGraph(
          board,
          f,
          [-10, 10],
          { strokeWidth: 3, name: "f(x)", withLabel: true, label: { color: COLORS.green } },
          COLORS.green
        );

        createFunctionGraph(
          board,
          rg,
          [-10, 10],
          { strokeWidth: 3, name: "r·g(x)", withLabel: true, label: { color: COLORS.orange } },
          COLORS.orange
        );

        // Points on f at a,b
        const Fa = createPoint(board, [getA, () => f(getA())], { name: "", size: 3, fixed: true }, COLORS.green);
        const Fb = createPoint(board, [getB, () => f(getB())], { name: "", size: 3, fixed: true }, COLORS.green);

        // Points on r·g at a,b
        const rGa = createPoint(board, [getA, () => rg(getA())], { name: "", size: 3, fixed: true }, COLORS.orange);
        const rGb = createPoint(board, [getB, () => rg(getB())], { name: "", size: 3, fixed: true }, COLORS.orange);

        // Labels like (a,f(a)) and (a, r g(a)), etc.  (use raw JSXGraph text)
        // board.create("text", [() => getA() + 0.1, () => f(getA()) + 0.6, "(a, f(a))"], {
        //   fontSize: 12,
        //   color: COLORS.green,
        // });
        // board.create("text", [() => getA() + 0.1, () => rg(getA()) + 0.6, "(a, r·g(a))"], {
        //   fontSize: 12,
        //   color: COLORS.orange,
        // });

        // board.create("text", [() => getB() + 0.1, () => f(getB()) + 0.6, "(b, f(b))"], {
        //   fontSize: 12,
        //   color: COLORS.green,
        // });
        // board.create("text", [() => getB() + 0.1, () => rg(getB()) + 0.6, "(b, r·g(b))"], {
        //   fontSize: 12,
        //   color: COLORS.orange,
        // });

        // // Secants (infinite lines)
        // board.create("line", [Fa, Fb], {
        //   strokeColor: COLORS.green,
        //   strokeWidth: 2,
        //   dash: 2,
        //   straightFirst: true,
        //   straightLast: true,
        // });

        // board.create("line", [rGa, rGb], {
        //   strokeColor: COLORS.orange,
        //   strokeWidth: 2,
        //   dash: 2,
        //   straightFirst: true,
        //   straightLast: true,
        // });

        const Fxi = createPoint(board, [getXi, () => f(getXi())], { name: "", size: 4, fixed: true }, COLORS.purple);
        const rGxi = createPoint(board, [getXi, () => rg(getXi())], { name: "", size: 4, fixed: true }, COLORS.purple);

        // Labels f(ξ), g(ξ) (here g-curve shown is r·g)
        board.create("text", [() => getXi() + 0.1, () => f(getXi()) + 0.6, "f(ξ)"], {
          fontSize: 12,
          color: COLORS.purple,
        });
        board.create("text", [() => getXi() + 0.1, () => rg(getXi()) + 0.6, "r·g(ξ)"], {
          fontSize: 12,
          color: COLORS.purple,
        });

        // Tangents at ξ as infinite lines
        const mF = () => df(getXi());
        const mRG = () => getR() * dg(getXi());

        board.create(
          "line",
          [
            () => [getXi(), f(getXi())],
            () => [getXi() + 1, f(getXi()) + mF()],
          ],
          { strokeColor: COLORS.green, strokeWidth: 2, straightFirst: true, straightLast: true }
        );

        board.create(
          "line",
          [
            () => [getXi(), rg(getXi())],
            () => [getXi() + 1, rg(getXi()) + mRG()],
          ],
          { strokeColor: COLORS.orange, strokeWidth: 2, straightFirst: true, straightLast: true }
        );

        // ---------------------------
        // 6) BOTTOM: h(x)=f(x)-r g(x) (Rolle picture)
        //    remove secant of h (no segment between h(a), h(b))
        // ---------------------------
        const H_OFFSET = -8.5;
        const H_SCALE = 0.9;
        const hVis = (x: number) => H_OFFSET + H_SCALE * h(x);

        createFunctionGraph(
          board,
          hVis,
          [-10, 10],
          { strokeWidth: 3, name: "h(x)=f(x)-r g(x)", withLabel: true, label: { color: COLORS.purple } },
          COLORS.purple
        );

        // points h(a), h(b) (same height, but no connecting secant/segment)
        createPoint(board, [getA, () => hVis(getA())], { name: "", size: 3, fixed: true }, COLORS.purple);
        createPoint(board, [getB, () => hVis(getB())], { name: "", size: 3, fixed: true }, COLORS.purple);

        // point h(ξ) and label
        const Hxi = createPoint(board, [getXi, () => hVis(getXi())], { name: "", size: 4, fixed: true }, COLORS.purple);

        board.create("text", [() => getXi() + 0.1, () => hVis(getXi()) + 0.6, "h(ξ)"], {
          fontSize: 12,
          color: COLORS.purple,
        });

        // horizontal tangent to h at ξ (infinite line)
        board.create(
          "line",
          [
            () => [getXi(), hVis(getXi())],
            () => [getXi() + 1, hVis(getXi()) + H_SCALE * dh(getXi())],
          ],
          { strokeColor: COLORS.purple, strokeWidth: 3, straightFirst: true, straightLast: true }
        );

        board.unsuspendUpdate();
      }}
    />
  );
}