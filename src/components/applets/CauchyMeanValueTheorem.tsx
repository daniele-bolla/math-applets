import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function CauchyMVTApplet() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-11, 16, 11, -16], 
      }}
      setup={(board: JXG.Board) => {


        // ---------------------------
        // 1) f and g (tuned for clarity)
        // ---------------------------
        const f = (x: number) => 0.15 * (x - 1) * (x - 1) + 4.5;
        const df = (x: number) => 0.3 * (x - 1);

        // monotone increasing g: g'(x) >= 0.6 for all x
        const g = (x: number) => 0.02 * x * x * x + 0.6 * x;
        const dg = (x: number) => 0.06 * x * x + 0.6;

        // ---------------------------
        //  Endpoints a,b constrained to [-10,10] on a segment
        // ---------------------------
        const xAxisSeg = board.create("segment", [[-10, 0], [10, 0]], {
          visible: false,
          fixed: true,
          straightFirst: false,
          straightLast: false,
        });

        const aGlider = board.create("glider", [-4, 0, xAxisSeg], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "a",
          strokeColor: COLORS.blue,
          fillColor: COLORS.blue,
          label: { offset: [0, -20], color: COLORS.blue },
        });

        const bGlider = board.create("glider", [4, 0, xAxisSeg], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "b",
          strokeColor: COLORS.blue,
          fillColor: COLORS.blue,
          label: { offset: [0, -20], color: COLORS.blue },
        });

        const getA = () => Math.min(aGlider.X(), bGlider.X());
        const getB = () => Math.max(aGlider.X(), bGlider.X());

        // ---------------------------
        //r, r·g, h = f - r g
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

        // h'(x) = f'(x) - r g'(x)
        const dh = (x: number) => df(x) - getR() * dg(x);

        // ---------------------------
        // 4) Student ξ glider on [a,b]
        // ---------------------------
        const xiTrack = board.create(
          "segment",
          [
            () => [getA(), 0],
            () => [getB(), 0],
          ],
          { visible: false, straightFirst: false, straightLast: false }
        );

        const xiGlider = board.create("glider", [0, 0, xiTrack], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "ξ",
          strokeColor: COLORS.purple,
          fillColor: COLORS.purple,
          label: { offset: [0, 18], color: COLORS.purple },
        });

        const getXi = () => xiGlider.X();

        // condition check
        const TOL = 0.05;
        const isGood = () => Math.abs(dh(getXi())) < TOL;

        xiGlider.setAttribute({
          fillColor: () => (isGood() ? COLORS.green : COLORS.purple),
          strokeColor: () => (isGood() ? COLORS.green : COLORS.purple),
          label: {
            offset: [0, 18],
            color: () => (isGood() ? COLORS.green : COLORS.purple),
          },
        });
        // ---------------------------
        // 5) Graphs
        // ---------------------------
        const fGraph = board.create("functiongraph", [f, -10, 10], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
        });

        const rgGraph = board.create("functiongraph", [rg, -10, 10], {
          strokeColor: COLORS.orange,
          strokeWidth: 3,
        });

        // lower panel position/scale (more separation)
        const H_OFFSET = -11.5;
        const H_SCALE = 0.8;
        const hVis = (x: number) => H_OFFSET + H_SCALE * h(x);

        const hGraph = board.create("functiongraph", [hVis, -10, 10], {
          strokeColor: COLORS.red,
          strokeWidth: 3,
        });

        // ---------------------------
        // vertical line x = ξ and intersections with graphs
        // ---------------------------
        const vP1 = board.create("point", [() => getXi(), 0], { visible: false, fixed: true });
        const vP2 = board.create("point", [() => getXi(), 1], { visible: false, fixed: true });

        const vXi = board.create("line", [vP1, vP2], {
          visible: false,
          fixed: true,
          straightFirst: true,
          straightLast: true,
        });

        const pF = board.create("intersection", [vXi, fGraph, 0], {
          name: "",
          size: 4,
          fixed: true,
          strokeColor: () => (isGood() ? COLORS.green : COLORS.purple),
          fillColor: () => (isGood() ? COLORS.green : COLORS.purple),
        });

        const pRG = board.create("intersection", [vXi, rgGraph, 0], {
          name: "",
          size: 4,
          fixed: true,
          strokeColor: () => (isGood() ? COLORS.green : COLORS.purple),
          fillColor: () => (isGood() ? COLORS.green : COLORS.purple),
        });

        const pH = board.create("intersection", [vXi, hGraph, 0], {
          name: "",
          size: 4,
          fixed: true,
          strokeColor: () => (isGood() ? COLORS.green : COLORS.purple),
          fillColor: () => (isGood() ? COLORS.green : COLORS.purple),
        });

        // ---------------------------
        // Tangents 
        // ---------------------------
        board.create("tangent", [pF, fGraph], {
          strokeColor: () => (isGood() ? COLORS.green : COLORS.purple),
          strokeWidth: 3,
          highlight: false,
        });

        board.create("tangent", [pRG, rgGraph], {
          strokeColor: () => (isGood() ? COLORS.green : COLORS.purple),
          strokeWidth: 3,
          highlight: false,
        });

        board.create("tangent", [pH, hGraph], {
          strokeColor: () => (isGood() ? COLORS.green : COLORS.purple),
          strokeWidth: 3,
          highlight: false,
        });

        // ---------------------------
        // Labels 
        // ---------------------------
        board.create("text", [() => pF.X() + 0.2, () => pF.Y() + 0.7, "f(ξ)"], {
          fontSize: 12,
          color: () => (isGood() ? COLORS.green : COLORS.purple),
        });

        board.create("text", [() => pRG.X() + 0.2, () => pRG.Y() + 0.7, "r·g(ξ)"], {
          fontSize: 12,
          color: () => (isGood() ? COLORS.green : COLORS.purple),
        });

        board.create("text", [() => pH.X() + 0.2, () => pH.Y() + 0.7, "h(ξ)"], {
          fontSize: 12,
          color: COLORS.red,
        });

      }}
    />
  );
}