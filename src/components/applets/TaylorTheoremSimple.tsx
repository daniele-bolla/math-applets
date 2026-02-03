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

// f(x) = sin(x)
const f = (x: number) => Math.sin(x);

// k-th derivative of sin at x:  f^(k)(x) = sin(x + k*pi/2)
const fDerivAt = (k: number, x: number) => Math.sin(x + (k * Math.PI) / 2);

export default function TaylorTheorem() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-5, 2.2, 8, -2.2],
      }}
      setup={(board: JXG.Board) => {
        // f graph
        const fGraph = createFunctionGraph(
          board,
          f,
          [-10, 10],
          {
            name: "f(x)",
            withLabel: true,
          },
          COLORS.blue
        );

        // Expansion point x0 as glider on f
        const P = createGlider(
          board,
          [0, f(0), fGraph],
          { name: "x₀" },
          COLORS.blue
        );

        // Degree slider n
        const nSlider = createSlider(
          board,
          [-4, -5],
          [3, -5],
          [0, 3, 12], // min, initial, max
          {
            name: "n",
            snapWidth: 1,
            precision: 0,
          }
        ) as JXG.Slider;

        // point x
        const Q = createGlider(
          board,
          [1, f(1), fGraph],
          { name: "x" },
          COLORS.orange
        );

        const getX0 = () => P.X();
        const getN = () => Math.round(nSlider.Value());
        const getX = () => Q.X();

        // Taylor polynomial T_n(x) around x0
        const T = (x: number) => {
          const x0 = getX0();
          const n = getN();
          const dx = x - x0;

          let s = 0;
          for (let k = 0; k <= n; k++) {
            s += (fDerivAt(k, x0) / factorial(k)) * Math.pow(dx, k);
          }
          return s;
        };

        // Graph of T_n
        createFunctionGraph(
          board,
          T,
          [-10, 10],
          {
            name: "Tₙ(x)",
            withLabel: true,
          },
          COLORS.pink
        );

        // R_n(x) as a vertical segment at x = Q.X()
        createSegment(
          board,
          [
            [() => getX(), () => f(getX())],
            [() => getX(), () => T(getX())],
          ],
          {
            dash: 2,
            strokeWidth: 4,
            name: "Rₙ(x)",
            withLabel: true,
          },
          COLORS.green
        );
      }}
    />
  );
}