import JXG from "jsxgraph";
import JSXGraphBoard from "../JSXGraphBoard";
import { COLORS, DEFAULT_POINT_ATTRIBUTES } from "../../utils/jsxgraph";

type ExampleKey = "discontinuousAtMax" | "openInterval";

interface Example {
  name: string;
  interval: [number, number];
  isOpen: boolean;
  render: (board: JXG.Board, a: number, b: number) => JXG.GeometryElement[];
}

const examples: Record<ExampleKey, Example> = {
  discontinuousAtMax: {
    name: "Discontinuous max",
    interval: [0, 4],
    isOpen: false,
    render: (board, a, b) => {
      const objs: JXG.GeometryElement[] = [];
      const f = (x: number) => -x * x + 4 * x - 1;

      objs.push(
        board.create("functiongraph", [f, a, 1.999], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
          fixed: true,
        }),
        board.create("functiongraph", [f, 2.001, b], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
          fixed: true,
        }),
        board.create("point", [2, 3], {
          ...DEFAULT_POINT_ATTRIBUTES,
          size: 4,
          fillColor: COLORS.white,
          strokeColor: COLORS.pink,
          strokeWidth: 2,
          fixed: true,
        })
      );

      return objs;
    },
  },

  openInterval: {
    name: "Open interval",
    interval: [1, 3],
    isOpen: true,
    render: (board, a, b) => {
      const objs: JXG.GeometryElement[] = [];
      const f = (x: number) => x;

      objs.push(
        board.create("functiongraph", [f, a, b], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
          fixed: true,
        }),
        board.create("point", [a, f(a)], {
          ...DEFAULT_POINT_ATTRIBUTES,
          size: 4,
          fillColor: COLORS.white,
          strokeColor: COLORS.pink,
          strokeWidth: 2,
          fixed: true,
        }),
        board.create("point", [b, f(b)], {
          ...DEFAULT_POINT_ATTRIBUTES,
          size: 4,
          fillColor: COLORS.white,
          strokeColor: COLORS.pink,
          strokeWidth: 2,
          fixed: true,
        })
      );

      return objs;
    },
  },
};

export default function EVTApplet() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1, 4, 5, -2.5],
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        let currentExample: ExampleKey = "discontinuousAtMax";
        let activeObjects: JXG.GeometryElement[] = [];

        const btnStyle =
          "padding:6px 10px;border-radius:4px;cursor:pointer;user-select:none;";

        function clearActive() {
          activeObjects.forEach((o) => {
            try {
              board.removeObject(o);
            } catch {}
          });
          activeObjects = [];
        }

        function drawExample(key: ExampleKey) {
          clearActive();

          const ex = examples[key];
          const [a, b] = ex.interval;

          activeObjects.push(...ex.render(board, a, b));

          // interval endpoints
          const A = board.create("point", [a, 0], {
            ...DEFAULT_POINT_ATTRIBUTES,
            name: ex.isOpen ? "(" : "[",
            size: 4,
            fillColor: ex.isOpen ? COLORS.white : COLORS.green,
            strokeColor: COLORS.green,
            strokeWidth: ex.isOpen ? 2 : 1,
            fixed: true,
            label: { offset: [-15, -15], fontSize: 16 },
          });

          const B = board.create("point", [b, 0], {
            ...DEFAULT_POINT_ATTRIBUTES,
            name: ex.isOpen ? ")" : "]",
            size: 4,
            fillColor: ex.isOpen ? COLORS.white : COLORS.red,
            strokeColor: COLORS.red,
            strokeWidth: ex.isOpen ? 2 : 1,
            fixed: true,
            label: { offset: [10, -15], fontSize: 16 },
          });

          const seg = board.create("segment", [A, B], {
            strokeColor: COLORS.orange,
            strokeWidth: 4,
            fixed: true,
          });

          activeObjects.push(A, B, seg);
        }

        // -------------------------
        // BUTTONS (bottom-right)
        // -------------------------
        board.create(
          "button",
          [
            1.0,
            -2.1,
            "Discontinuous max",
            () => {
              currentExample = "discontinuousAtMax";
              drawExample(currentExample);
            },
          ],
          {
            fixed: true,
            cssStyle: `${btnStyle} background:#e3f2fd;color:#0d47a1;`,
          }
        );

        board.create(
          "button",
          [
            3.0,
            -2.1,
            "Open interval",
            () => {
              currentExample = "openInterval";
              drawExample(currentExample);
            },
          ],
          {
            fixed: true,
            cssStyle: `${btnStyle} background:#f3e5f5;color:#4a148c;`,
          }
        );

        // initial render
        drawExample(currentExample);
      }}
    />
  );
}