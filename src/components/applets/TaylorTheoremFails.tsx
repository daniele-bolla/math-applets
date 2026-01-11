import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
  COLORS,
  createFunctionGraph,
  createGlider,
  createSlider,
  createSegment,
} from "../../utils/jsxgraph";


const factorial = (n: number) => {
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
};

// falling factorial: n*(n-1)*...*(n-k+1)
const fallingFactorial = (n: number, k: number) => {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r *= (n - i);
  return r;
};

// --------------------
// Failure example: g(x) = x^5 |x| = sign(x)*x^6
// g is 5x differentiable at 0 but NOT 6x differentiable at 0
// --------------------
const g = (x: number) => Math.pow(x, 5) * Math.abs(x);

// k-th derivative of g at x0 
const gDerivAt = (k: number, x0: number) => {
  const EPS0 = 1e-8;

  // At x0 = 0: derivatives exist for k<=5 (and are 0); for k>=6 they do not exist.
  if (Math.abs(x0) < EPS0) {
    if (k <= 5) return 0;
    return NaN;
  }

  const s = Math.sign(x0); // ±1
  if (k > 6) return 0;
  return s * fallingFactorial(6, k) * Math.pow(x0, 6 - k);
};

export default function TaylorTheoremFailure() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-5, 8, 8, -5] }}
      setup={(board: JXG.Board) => {
        const gGraph = createFunctionGraph(
          board,
          g,
          [-10, 10],
          {
            name: "g(x)",
            withLabel: true,
          },
          COLORS.blue
        );

        const P = createGlider(
          board,
          [0, g(0), gGraph],
          {
            name: "x₀",
          },
          COLORS.blue
        );

        const nSlider = createSlider(
          board,
          [-4, -4],
          [3, -4],
          [0, 5, 6], 
          {
            name: "n",
            snapWidth: 1,
            precision: 0,
          }
        ) as JXG.Slider;

        const Q = createGlider(
          board,
          [1, g(1), gGraph],
          {
            name: "x",
          },
          COLORS.orange
        );

        const getX0 = () => P.X();
        const getN = () => Math.round(nSlider.Value());
        const getX = () => Q.X();

        const EPS = 0.5;

        const taylorIsDefined = () => {
          const x0 = getX0();
          const n = getN();
          return !(Math.abs(x0) < EPS && n >= 6);
        };

        const T = (x: number) => {
          if (!taylorIsDefined()) return NaN;

          const x0 = getX0();
          const n = getN();
          const dx = x - x0;

          let s = 0;
          for (let k = 0; k <= n; k++) {
            const dk = gDerivAt(k, x0);
            if (!Number.isFinite(dk)) return NaN;
            s += (dk / factorial(k)) * Math.pow(dx, k);
          }
          return s;
        };

        const tGraph = createFunctionGraph(
          board,
          T,
          [-10, 10],
          {
            name: "Tₙ(x)",
            withLabel: true,

          },
          COLORS.pink
        );

        const rSeg = createSegment(
          board,
          [
            [() => getX(), () => g(getX())],
            [() => getX(), () => T(getX())],
          ],
          {
            dash: 2,
            strokeWidth: 4,
            name: "Rₙ(x)",
            withLabel: true,
            label: { color: COLORS.green, offset: [10, 0], fontSize: 12 },
          },
          COLORS.green
        );

        const updateVisibility = () => {
          const v = taylorIsDefined();
          tGraph.setAttribute({ visible: v });
          rSeg.setAttribute({ visible: v });
          gGraph.setAttribute({ strokeColor: v ? COLORS.blue : COLORS.red });
        };

        board.on("update", updateVisibility);
        updateVisibility();
      }}
    />
  );
}