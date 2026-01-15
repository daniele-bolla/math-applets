import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function CauchyMVTStandardApplet() {
  return (
    <JSXGraphBoard
      config={{
        // extra space at the bottom for the h(t) panel
        boundingbox: [-4, 4.5, 6, -6.5],
        axis: true,
        showNavigation: false,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        board.suspendUpdate();

        // ---------------------------------------------------------
        // 1) Pick f,g with g'(x) != 0 (g strictly increasing)
        // ---------------------------------------------------------
        const f = (x: number) => 0.3 * x * x * x - x;
        const df = (x: number) => 0.9 * x * x - 1;

        const g = (x: number) => x + 0.2 * x * x * x;
        const dg = (x: number) => 1 + 0.6 * x * x; // > 0 always

        const xmin = -2.8;
        const xmax = 2.8;

        // ---------------------------------------------------------
        // 2) Parametric curve in the (g,f)-plane: t ↦ (g(t), f(t))
        // ---------------------------------------------------------
        const curve = board.create(
          "curve",
          [(t: number) => g(t), (t: number) => f(t), xmin, xmax],
          { strokeColor: COLORS.blue, strokeWidth: 4 }
        ) as JXG.Curve;

        // Axis labels (use raw text to avoid [Object Object])
        board.create(
          "text",
          [
            () => board.getBoundingBox()[2] - 0.7,
            () => board.getBoundingBox()[3] + 0.3,
            "g(x)",
          ],
          { fontSize: 16, color: COLORS.gray, fixed: true }
        );
        board.create(
          "text",
          [
            () => board.getBoundingBox()[0] + 0.25,
            () => board.getBoundingBox()[1] - 0.5,
            "f(x)",
          ],
          { fontSize: 16, color: COLORS.gray, fixed: true }
        );

        // ---------------------------------------------------------
        // 3) A and B gliders on the curve
        // ---------------------------------------------------------
        const A = board.create(
          "glider",
          [g(-1.2), f(-1.2), curve],
          {
            ...DEFAULT_GLIDER_ATTRIBUTES,
            name: "",
            size: 8,
            strokeColor: COLORS.green,
            fillColor: COLORS.green,
          }
        ) as JXG.Point;

        const B = board.create(
          "glider",
          [g(1.2), f(1.2), curve],
          {
            ...DEFAULT_GLIDER_ATTRIBUTES,
            name: "",
            size: 8,
            strokeColor: COLORS.red,
            fillColor: COLORS.red,
          }
        ) as JXG.Point;

        // left/right endpoint coordinates in the (g,f)-plane
        const leftX = () => (A.X() <= B.X() ? A.X() : B.X());
        const leftY = () => (A.X() <= B.X() ? A.Y() : B.Y());
        const rightX = () => (A.X() <= B.X() ? B.X() : A.X());
        const rightY = () => (A.X() <= B.X() ? B.Y() : A.Y());

        board.create(
          "text",
          [() => leftX() + 0.15, () => leftY() + 0.15, "(g(a), f(a))"],
          { fontSize: 12, color: COLORS.green }
        );
        board.create(
          "text",
          [() => rightX() + 0.15, () => rightY() + 0.15, "(g(b), f(b))"],
          { fontSize: 12, color: COLORS.red }
        );

        // Secant line AB
        const secant = board.create("line", [A, B], {
          strokeColor: COLORS.orange,
          strokeWidth: 3,
        }) as JXG.Line;

        // ---------------------------------------------------------
        // 4) Recover parameters a,b by inverting g from x-coordinate (= g-value)
        // ---------------------------------------------------------
        const invertG = (u: number) => {
          let lo = xmin;
          let hi = xmax;

          const glo = g(lo);
          const ghi = g(hi);
          if (u <= glo) return lo;
          if (u >= ghi) return hi;

          for (let i = 0; i < 60; i++) {
            const mid = 0.5 * (lo + hi);
            if (g(mid) < u) lo = mid;
            else hi = mid;
          }
          return 0.5 * (lo + hi);
        };

        const getAparam = () => invertG(leftX());
        const getBparam = () => invertG(rightX());

        // ---------------------------------------------------------
        // 5) Proof function h(t) and its derivative h'(t)
        //    h(t) = (f(b)-f(a))g(t) - (g(b)-g(a))f(t)
        // ---------------------------------------------------------
        const rawH = (t: number) => {
          const a = getAparam();
          const b = getBparam();
          const dF = f(b) - f(a);
          const dG = g(b) - g(a);
          return dF * g(t) - dG * f(t);
        };

        // This is exactly the expression used in the proof after differentiating h:
        const rawHprime = (t: number) => {
          const a = getAparam();
          const b = getBparam();
          const dF = f(b) - f(a);
          const dG = g(b) - g(a);
          return dF * dg(t) - dG * df(t);
        };

        // ---------------------------------------------------------
        // 6) Find ξ in (a,b) such that h'(ξ)=0  (Rolle step)
        // ---------------------------------------------------------
        const findXi = () => {
          const a = getAparam();
          const b = getBparam();
          if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(b - a) < 1e-6) return 0.5 * (a + b);

          const left = Math.min(a, b);
          const right = Math.max(a, b);

          const steps = 160;
          let tPrev = left;
          let vPrev = rawHprime(tPrev);

          for (let i = 1; i <= steps; i++) {
            const t = left + (right - left) * (i / steps);
            const v = rawHprime(t);

            if (!Number.isFinite(vPrev) || !Number.isFinite(v)) {
              tPrev = t;
              vPrev = v;
              continue;
            }

            if (vPrev === 0) return tPrev;
            if (v === 0) return t;

            if (vPrev * v < 0) {
              const w = Math.abs(vPrev) / (Math.abs(vPrev) + Math.abs(v));
              return tPrev + (t - tPrev) * w;
            }

            tPrev = t;
            vPrev = v;
          }

          return 0.5 * (left + right);
        };

        const getXi = () => findXi();

        // ξ point on the parametric curve (computed)
        const Xi = board.create(
          "point",
          [() => g(getXi()), () => f(getXi())],
          { name: "", size: 5, fixed: true, strokeColor: COLORS.purple, fillColor: COLORS.purple }
        ) as JXG.Point;

        board.create(
          "text",
          [() => Xi.X() + 0.15, () => Xi.Y() + 0.15, "(g(ξ), f(ξ))"],
          { fontSize: 12, color: COLORS.purple }
        );

        // Tangent at ξ in (g,f)-plane: slope = f'(ξ)/g'(ξ)
        const slopeAtXi = () => df(getXi()) / dg(getXi());

        board.create(
          "line",
          [
            () => [Xi.X(), Xi.Y()],
            () => [Xi.X() + 1, Xi.Y() + slopeAtXi()],
          ],
          { strokeColor: COLORS.purple, strokeWidth: 3, straightFirst: true, straightLast: true }
        );

        // Parallel through ξ to the secant (visual check)
        board.create("parallel", [secant, Xi], {
          strokeColor: COLORS.purple,
          strokeWidth: 2,
          dash: 1,
          opacity: 0.35,
        });

        // ---------------------------------------------------------
        // 7) Rolle proof panel: plot h(t) (shifted so h(a)=h(b)=0)
        // ---------------------------------------------------------
        const PANEL_Y0 = -5.2;   // baseline of the panel
        const PANEL_SCALE = 0.04; // scale for visibility (tune if too flat/tall)

        // Shift so that h(a) becomes 0; then also h(b)=0 (by construction)
        const hShifted = (t: number) => rawH(t) - rawH(getAparam());
        const hVis = (t: number) => PANEL_Y0 + PANEL_SCALE * hShifted(t);

        // Panel baseline (represents 0)
        board.create(
          "line",
          [
            () => [xmin, PANEL_Y0],
            () => [xmax, PANEL_Y0],
          ],
          { straightFirst: false, straightLast: false, dash: 2, strokeWidth: 2, strokeColor: COLORS.gray }
        );

        board.create(
          "text",
          [xmin + 0.1, PANEL_Y0 + 0.35, "h(t) (shifted): h(a)=h(b)=0"],
          { fontSize: 12, color: COLORS.gray }
        );

        // Graph of h(t) in the panel (x-axis = parameter t)
        board.create(
          "functiongraph",
          [hVis, xmin, xmax],
          { strokeColor: "#D32F2F", strokeWidth: 2 }
        );

        // Mark a and b on the panel at height 0
        board.create(
          "point",
          [() => getAparam(), () => PANEL_Y0],
          { name: "a", size: 3, fixed: true, strokeColor: COLORS.green, fillColor: COLORS.green }
        );
        board.create(
          "point",
          [() => getBparam(), () => PANEL_Y0],
          { name: "b", size: 3, fixed: true, strokeColor: COLORS.red, fillColor: COLORS.red }
        );

        // Mark ξ on the panel and draw horizontal tangent (Rolle: h'(ξ)=0)
        const XiH = board.create(
          "point",
          [() => getXi(), () => hVis(getXi())],
          { name: "ξ", size: 4, fixed: true, strokeColor: COLORS.purple, fillColor: COLORS.purple }
        ) as JXG.Point;

        // Tangent to h at ξ in the panel: slope proportional to h'(ξ) (should be ~0)
        const hTangentVis = (t: number) => {
          const xi = getXi();
          return hVis(xi) + PANEL_SCALE * rawHprime(xi) * (t - xi);
        };

        board.create(
          "functiongraph",
          [hTangentVis, xmin, xmax],
          { strokeColor: COLORS.purple, strokeWidth: 3 }
        );

        board.unsuspendUpdate();
      }}
    />
  );
}