import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES, DEFAULT_POINT_ATTRIBUTES } from "../../utils/jsxgraph";

export default function IntegralMeanValueTheorem() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1, 5, 8, -3],
        axis: true,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {

        const f = (x: number) => Math.sin(x) + 0.5 * Math.sin(2 * x) + 1.5;

        const F = (x: number) => -Math.cos(x) - 0.25 * Math.cos(2 * x) + 1.5 * x;

        // JSXGraph typing fix
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Numerics = JXG.Math.Numerics as any;

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

        const B = board.create("glider", [5, 0, xAxis], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "b",
          color: COLORS.blue,
        });

        const interval = () => {
          const a = A.X();
          const b = B.X();
          return { a: Math.min(a, b), b: Math.max(a, b) };
        };


        const meanValue = () => {
          const { a, b } = interval();
          return (F(b) - F(a)) / (b - a);
        };

        board.create("integral", [[() => interval().a, () => interval().b], curve], {
          color: COLORS.blue,
          fillOpacity: 0.1,
          label: { visible: false },
        });

        const extrema = () => {
          const { a, b } = interval();
          let min = Infinity;
          let max = -Infinity;
          const steps = 150;

          for (let i = 0; i <= steps; i++) {
            const x = a + (b - a) * (i / steps);
            const y = f(x);
            min = Math.min(min, y);
            max = Math.max(max, y);
          }

          return { min, max };
        };

        // horizontal lines
        board.create("line",
          [[() => interval().a, () => extrema().min],
           [() => interval().b, () => extrema().min]],
   { strokeColor: "gray", dash: 2, strokeWidth: 0.5 }        );

        board.create("line",
          [[() => interval().a, () => extrema().max],
           [() => interval().b, () => extrema().max]],
          { strokeColor: "gray", dash: 2, strokeWidth: 0.5 }
        );

        // labeled points m and M
        board.create("point", [
          () => interval().a,
          () => extrema().min,
        ], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "m",
          color: "gray",
          fixed: true,
          label: { offset: [-10, -10], color: "gray" },
        });

        board.create("point", [
          () => interval().a,
          () => extrema().max,
        ], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "M",
          color: "gray",
          fixed: true,
          label: { offset: [-10, 10], color: "gray" },
        });


        board.create("polygon", [
          [() => interval().a, 0],
          [() => interval().b, 0],
          [() => interval().b, meanValue],
          [() => interval().a, meanValue],
        ], {
          fillColor: COLORS.red,
          fillOpacity: 0.2,
          borders: { strokeWidth: 2, strokeColor: COLORS.red },
          vertices: { visible: false }, 
        });

        const xi = () => {
          const target = meanValue();
          const { a, b } = interval();
          const guess = (a + b) / 2;

          return Numerics.root(
            (x: number) => f(x) - target,
            guess
          );
        };

        const xiPoint = board.create("point", [
          xi,
          meanValue,
        ], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "f(ξ)",
          color: COLORS.blue,
          fixed: true,
          label: { offset: [0, 10], fontSize: 14, color: COLORS.blue },
        });

        board.create("segment", [
          xiPoint,
          [() => xiPoint.X(), 0],
        ], {
          strokeColor: COLORS.blue,
          dash: 2,
          strokeWidth: 1,
        });

      }}
    />
  );
}
