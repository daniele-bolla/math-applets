import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES, DEFAULT_POINT_ATTRIBUTES } from "../../utils/jsxgraph";

export default function IntegralMeanValueTheorem() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1, 5, 8, -3],
        axis: true,
        showNavigation: false,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        
        // f(x) = 0.1 * x^3 + 1
        const f = (x: number) => 0.1 * Math.pow(x, 3) + 1;

        // Antiderivative: F(x) = 0.025 * x^4 + x
        const F = (x: number) => 0.025 * Math.pow(x, 4) + x;

        // Inverse Function: f^-1(y) = cbrt(10 * (y - 1))
        const fInverse = (y: number) => Math.cbrt(10 * (y - 1));

        const curve = board.create("functiongraph", [f, -10, 10], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
          name: "f(x)",
          withLabel: true,
          label: { position: "rt", offset: [-10, 10], color: COLORS.blue },
        });

        const xAxis = board.create("line", [[0, 0], [1, 0]], { visible: false });

        const A = board.create("glider", [1, 0, xAxis], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "a",
          color: COLORS.blue,
        });

        const B = board.create("glider", [4, 0, xAxis], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "b",
          color: COLORS.blue,
        });

        const interval = () => {
          const a = A.X();
          const b = B.X();
          return { start: Math.min(a, b), end: Math.max(a, b) };
        };

        const meanValue = () => {
          const { start, end } = interval();
          if (Math.abs(end - start) < 1e-6) return f(start);
          return (F(end) - F(start)) / (end - start);
        };

        const extrema = () => {
          const { start, end } = interval();
          return { 
            min: f(start), 
            max: f(end) 
          };
        };

        board.create("integral", [[() => interval().start, () => interval().end], curve], {
          color: COLORS.blue,
          fillOpacity: 0.1,
          label: { visible: false },
        });
        // labeled points m and M
        board.create("point", [
          () => interval().start,
          () => extrema().min,
        ], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "m",
          color: "gray",
          fixed: true,
          label: { offset: [-10, -10], color: "gray" },
        });

        board.create("point", [
          () => interval().end,
          () => extrema().max,
        ], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "M",
          color: "gray",
          fixed: true,
          label: { offset: [-10, 10], color: "gray" },
        });
        // Horizontal Min/Max Lines
        board.create("line",
          [[() => interval().start, () => extrema().min], [() => interval().end, () => extrema().min]],
          { strokeColor: "gray", dash: 2, strokeWidth: 0.5 }
        );
        board.create("line",
          [[() => interval().start, () => extrema().max], [() => interval().end, () => extrema().max]],
          { strokeColor: "gray", dash: 2, strokeWidth: 0.5 }
        );

        // Mean Value Rectangle
        board.create("polygon", [
          [() => interval().start, 0],
          [() => interval().end, 0],
          [() => interval().end, meanValue],
          [() => interval().start, meanValue],
        ], {
          fillColor: COLORS.red,
          fillOpacity: 0.2,
          borders: { strokeWidth: 2, strokeColor: COLORS.red },
          vertices: { visible: false },
        });

        // --- 3. ZERO Numerical Methods ---
        // We find Xi using the analytical inverse function!
        const getXi = () => fInverse(meanValue());

        const xiPoint = board.create("point", [getXi, meanValue], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "f(ξ)",
          color: COLORS.green,
          fixed: true,
          label: { offset: [0, 10], fontSize: 14, color: COLORS.green },
        });

        board.create("segment", [xiPoint, [() => xiPoint.X(), 0]], {
          strokeColor: COLORS.green,
          dash: 2,
          strokeWidth: 1,
        });
      }}
    />
  );
}