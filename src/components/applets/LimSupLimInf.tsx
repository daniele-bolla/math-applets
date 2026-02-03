import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
  COLORS,
  DEFAULT_GLIDER_ATTRIBUTES,
  DEFAULT_POINT_ATTRIBUTES,
  DEFAULT_SLIDER_ATTRIBUTES,
} from "../../utils/jsxgraph";

export default function LimSupLimInfApplet() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-15, 60, 90, -80],
        axis: true,
      }}
      setup={(board: JXG.Board) => {
        const MAX_K = 150;

        const SLIDER_MIN = 1;
        const SLIDER_MAX = 100;
        const SLIDER_INITIAL = 1;

        const SLIDER_X_START = 35;
        const SLIDER_X_END = 60;
        const SLIDER_Y = -55;

        const TRUE_SUP = 10;
        const TRUE_INF = -10;

        const seq = (n: number) => {
          const sign = Math.pow(-1, n);
          const numerator = 10 + 60 * Math.sin(n * 0.8);
          return sign * (10 + numerator / n);
        };

        const values: number[] = Array.from({ length: MAX_K }, (_, i) =>
          seq(i + 1),
        );

        // Optional: envelope curves (as in your original)
        board.create(
          "functiongraph",
          [(x: number) => 10 + 70 / x, 1, MAX_K],
          {
            strokeColor: COLORS.pink,
            strokeWidth: 1,
            dash: 2,
            opacity: 0.1,
          },
        );
        board.create(
          "functiongraph",
          [(x: number) => -10 - 70 / x, 1, MAX_K],
          {
            strokeColor: COLORS.blue,
            strokeWidth: 1,
            dash: 2,
            opacity: 0.1,
          },
        );

        // LIMIT LINES ---
        board.create("line", [[0, TRUE_SUP], [1, TRUE_SUP]], {
          strokeColor: COLORS.pink,
          strokeWidth: 2,
          dash: 2,
          opacity: 0.6,
          fixed: true,
        });

        board.create("line", [[0, TRUE_INF], [1, TRUE_INF]], {
          strokeColor: COLORS.blue,
          strokeWidth: 2,
          dash: 2,
          opacity: 0.6,
          fixed: true,
        });

        // k slider
        const kSlider = board.create(
          "slider",
          [
            [SLIDER_X_START, SLIDER_Y],
            [SLIDER_X_END, SLIDER_Y],
            [SLIDER_MIN, SLIDER_INITIAL, SLIDER_MAX],
          ],
          {
            ...DEFAULT_SLIDER_ATTRIBUTES,
            name: "k",
            snapWidth: 1,
            precision: 0,

          },
        ) as JXG.Slider;

        // --- SINGLE EPSILON SLIDER (used for both limsup and liminf) ---
        const EPS_MIN = 0.5;
        const EPS_MAX = 20;
        const EPS_INITIAL = 5;

        const epsSlider = board.create(
          "slider",
          [
            [SLIDER_X_START, SLIDER_Y - 10],
            [SLIDER_X_END, SLIDER_Y - 10],
            [EPS_MIN, EPS_INITIAL, EPS_MAX],
          ],
          {
            ...DEFAULT_SLIDER_ATTRIBUTES,
            name: "ε",
            snapWidth: 0.1,
            precision: 1,

          },
        ) as JXG.Slider;

        const getEps = () => epsSlider.Value();

        //  NEIGHBORHOOD VISUALIZATION (same ε for both) ---
        board.create("line", [[0, () => TRUE_SUP + getEps()], [1, () => TRUE_SUP + getEps()]], {
          strokeColor: COLORS.pink,
          strokeWidth: 2,
          dash: 3,
        });
        board.create("line", [[0, () => TRUE_SUP - getEps()], [1, () => TRUE_SUP - getEps()]], {
          strokeColor: COLORS.pink,
          strokeWidth: 2,
          dash: 3,
        });

        board.create("line", [[0, () => TRUE_INF + getEps()], [1, () => TRUE_INF + getEps()]], {
          strokeColor: COLORS.blue,
          strokeWidth: 2,
          dash: 3,
        });
        board.create("line", [[0, () => TRUE_INF - getEps()], [1, () => TRUE_INF - getEps()]], {
          strokeColor: COLORS.blue,
          strokeWidth: 2,
          dash: 3,
        });

        const getSupData = () => {
          const k_curr = Math.floor(kSlider.Value());
          let maxVal = -Infinity;
          let maxIndex = k_curr;
          for (let n = k_curr; n <= MAX_K; n++) {
            const val = values[n - 1];
            if (val >= maxVal) {
              maxVal = val;
              maxIndex = n;
            }
          }
          return { index: maxIndex, val: maxVal };
        };

        const getInfData = () => {
          const k_curr = Math.floor(kSlider.Value());
          let minVal = Infinity;
          let minIndex = k_curr;
          for (let n = k_curr; n <= MAX_K; n++) {
            const val = values[n - 1];
            if (val <= minVal) {
              minVal = val;
              minIndex = n;
            }
          }
          return { index: minIndex, val: minVal };
        };

        // Sequence points + coloring
        for (let n = 1; n <= MAX_K; n++) {
          board.create("point", [n, values[n - 1]], {
            ...DEFAULT_POINT_ATTRIBUTES,
            name: "",
            size: 1,
            strokeColor: COLORS.black,
            strokeWidth: 1,
            fixed: true,
            fillColor: () => {
              const k = kSlider.Value();
              const val = values[n - 1];

              if (n < k) return COLORS.lightGray;

              const eps = getEps();

              // "Almost all n are < Sup + eps" -> Exception if > Sup + eps
              if (val > TRUE_SUP + eps) return COLORS.orange;
              // "Almost all n are > Inf - eps" -> Exception if < Inf - eps
              if (val < TRUE_INF - eps) return COLORS.orange;

              // "Infinitely many n > Sup - eps" -> Witness if inside Sup tube
              if (val > TRUE_SUP - eps) return COLORS.pink;

              // "Infinitely many n < Inf + eps" -> Witness if inside Inf tube
              if (val < TRUE_INF + eps) return COLORS.blue;

              return COLORS.black;
            },
            strokeOpacity: () => (n < kSlider.Value() ? 0.3 : 1),
          });
        }

        // Vertical line at k
        board.create("line", [[() => kSlider.Value(), -200], [() => kSlider.Value(), 200]], {
          strokeColor: COLORS.darkGray,
          strokeWidth: 1,
          dash: 2,
        });

        // Highlight current tail sup and inf (computed up to MAX_K)
        board.create("point", [() => getSupData().index, () => getSupData().val], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "",
          size: 6,
          fillColor: "transparent",
          strokeColor: COLORS.pink,
          strokeWidth: 3,
          fixed: true,
        });

        board.create("point", [() => getInfData().index, () => getInfData().val], {
          ...DEFAULT_POINT_ATTRIBUTES,
          name: "",
          size: 6,
          fillColor: "transparent",
          strokeColor: COLORS.blue,
          strokeWidth: 3,
          fixed: true,
        });
      }}
    />
  );
}