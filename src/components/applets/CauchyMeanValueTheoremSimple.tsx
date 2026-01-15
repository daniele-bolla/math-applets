import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
  COLORS,
  DEFAULT_GLIDER_ATTRIBUTES,
  createFunctionGraph,
  createGlider,
  createLine,
  createPoint,
  createSegment,
} from "../../utils/jsxgraph";

export default function CauchyMVTStretchGApplet() {
  return (
    <JSXGraphBoard
      config={{
        // top: f and r g, bottom: h
        boundingbox: [-1, 8, 6, -8],
        axis: true,
        showNavigation: false,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        board.suspendUpdate();

        // -----------------------
        // 1) Choose f and g (with g'(x) != 0 on the interval)
        // -----------------------
        const f = (x: number) => 0.2 * x * x * x - 0.5 * x * x + 2;
        const df = (x: number) => 0.6 * x * x - x;

        const g = (x: number) => Math.exp(0.35 * x);      // g'(x) > 0 always
        const dg = (x: number) => 0.35 * Math.exp(0.35 * x);

        // -----------------------
        // 2) a, b as gliders on x-axis
        // -----------------------
        const xAxis = board.defaultAxes.x;

        const aGlider = createGlider(
          board,
          [1, 0, xAxis],
          { ...DEFAULT_GLIDER_ATTRIBUTES, name: "a", label: { offset: [0, -18] } },
          COLORS.green
        );

        const bGlider = createGlider(
          board,
          [5, 0, xAxis],
          { ...DEFAULT_GLIDER_ATTRIBUTES, name: "b", label: { offset: [0, -18] } },
          COLORS.red
        );

        const getA = () => Math.min(aGlider.X(), bGlider.X());
        const getB = () => Math.max(aGlider.X(), bGlider.X());

        // -----------------------
        // 3) Scaling factor r and functions r g and h = f - r g
        // -----------------------
        const getR = () => {
          const a = getA();
          const b = getB();
          const denom = g(b) - g(a);
          if (Math.abs(denom) < 1e-10) return NaN;
          return (f(b) - f(a)) / denom;
        };

        const rg = (x: number) => getR() * g(x);
        const h = (x: number) => f(x) - rg(x);

        // -----------------------
        // 4) Find c in (a,b) such that h'(c)=0  <=>  f'(c) = r g'(c)
        // -----------------------
        const hPrime = (x: number) => df(x) - getR() * dg(x);

        const findC = () => {
          const a = getA();
          const b = getB();
          if (Math.abs(b - a) < 1e-4) return 0.5 * (a + b);

          const steps = 120;
          let xPrev = a;
          let vPrev = hPrime(xPrev);

          for (let i = 1; i <= steps; i++) {
            const x = a + (b - a) * (i / steps);
            const v = hPrime(x);

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

        const getC = () => findC();

        // -----------------------
        // 5) Top panel: f and r g
        // -----------------------
        createFunctionGraph(board, f, [-10, 10], { strokeWidth: 3, name: "f(x)", withLabel: true }, COLORS.green);
        createFunctionGraph(board, rg, [-10, 10], { strokeWidth: 3, name: "r·g(x)", withLabel: true }, COLORS.orange);

        // Points on f at a,b
        const Fa = createPoint(board, [getA, () => f(getA())], { name: "", size: 3, fixed: true }, COLORS.green);
        const Fb = createPoint(board, [getB, () => f(getB())], { name: "", size: 3, fixed: true }, COLORS.green);

        // Points on r g at a,b
        const Ga = createPoint(board, [getA, () => rg(getA())], { name: "", size: 3, fixed: true }, COLORS.orange);
        const Gb = createPoint(board, [getB, () => rg(getB())], { name: "", size: 3, fixed: true }, COLORS.orange);

        // Secant lines (parallel by construction)
        board.create("line", [Fa, Fb], { strokeColor: COLORS.green, strokeWidth: 2, dash: 2 });
        board.create("line", [Ga, Gb], { strokeColor: COLORS.orange, strokeWidth: 2, dash: 2 });

        // Vertical “difference” segments at a and b (show h(a)=h(b))
        createSegment(board, [Ga, Fa], { strokeWidth: 5 }, COLORS.purple);
        createSegment(board, [Gb, Fb], { strokeWidth: 5 }, COLORS.purple);

        // c on x-axis + points on both curves at c
        const cOnAxis = createPoint(board, [getC, 0], { name: "c", size: 3, fixed: true }, COLORS.purple);

        const Fc = createPoint(board, [getC, () => f(getC())], { name: "", size: 4, fixed: true }, COLORS.purple);
        const Gc = createPoint(board, [getC, () => rg(getC())], { name: "", size: 4, fixed: true }, COLORS.purple);

        // Tangents at c: slopes match because f'(c) = r g'(c)
        const mF = () => df(getC());
        const mG = () => getR() * dg(getC());

        const tangentF = (x: number) => f(getC()) + mF() * (x - getC());
        const tangentG = (x: number) => rg(getC()) + mG() * (x - getC());

        createFunctionGraph(board, tangentF, [-10, 10], { strokeWidth: 2 }, COLORS.green);
        createFunctionGraph(board, tangentG, [-10, 10], { strokeWidth: 2 }, COLORS.orange);

        // -----------------------
        // 6) Bottom panel: h(x)=f(x)-r g(x) (shifted down)
        // -----------------------
        const H_OFFSET = -5.5;   // move h down
        const H_SCALE = 0.8;     // scale for visibility
        const hVis = (x: number) => H_OFFSET + H_SCALE * h(x);

        createFunctionGraph(
          board,
          hVis,
          [-10, 10],
          { strokeWidth: 3, name: "h(x)=f(x)-r g(x)", withLabel: true },
          COLORS.purple
        );

        const Ha = createPoint(board, [getA, () => hVis(getA())], { name: "", size: 3, fixed: true }, COLORS.purple);
        const Hb = createPoint(board, [getB, () => hVis(getB())], { name: "", size: 3, fixed: true }, COLORS.purple);

        // segment to emphasize h(a)=h(b) (they have same y-value)
        createSegment(board, [Ha, Hb], { dash: 2, strokeWidth: 2 }, COLORS.purple);

        // point at c on h and horizontal tangent (Rolle)
        const Hc = createPoint(board, [getC, () => hVis(getC())], { name: "", size: 4, fixed: true }, COLORS.purple);

        const hTangentVis = (x: number) => hVis(getC()) + H_SCALE * hPrime(getC()) * (x - getC());
        createFunctionGraph(board, hTangentVis, [-10, 10], { strokeWidth: 2 }, COLORS.purple);

        // Small labels (raw JSXGraph text; safe)
        board.create("text", [-0.8, 7.3, () => `r = (f(b)-f(a))/(g(b)-g(a)) ≈ ${getR().toFixed(3)}`], {
          fontSize: 12,
          color: COLORS.gray,
        });

        board.unsuspendUpdate();
      }}
    />
  );
}