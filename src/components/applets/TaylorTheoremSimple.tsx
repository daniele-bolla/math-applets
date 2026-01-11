import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
  COLORS,
  DEFAULT_GLIDER_ATTRIBUTES,
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

//f(x) = e^x, all derivatives are e^x
const f = (x: number) => Math.exp(x);
const fDerivAt = (k: number, x: number) => Math.exp(x); // k-th derivative at x

export default function TaylorTheorem() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-5, 8, 8, -5] }}
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
          {
            name: "x₀",
          },
          COLORS.blue
        );

        // Degree slider n
        const nSlider = createSlider(
          board,
          [-4, -4],
          [3, -4],
          [0, 0, 10], // min, initial, max
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
          { 
            name: "x",
          },
          COLORS.orange
        );

        const getX0 = () => P.X();
        const getN = () => nSlider.Value();
        const getX = () => Q.X();

        // Taylor polynomial T_n(x) around 
        const T = (x: number) => {
          const x0 = getX0();
          const n = getN();
          let s = 0;
          const dx = x - x0;

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