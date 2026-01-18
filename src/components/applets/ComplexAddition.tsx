import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
    COLORS,
    createText,
    createPoint,
    createArrow,
    DEFAULT_GLIDER_ATTRIBUTES
} from "../../utils/jsxgraph";

export default function ComplexAdditionApplet() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1.2, 3.4, 3.8, -1.8],
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {

        createText(board, [3.15, 0.2], "Re(z)", {
        });

        createText(board, [-0.15, 3.15], "Im(z)", {
        });

        const O = createPoint(board, [0, 0], {
          name: "",
        });

        // z1
        const z1 = createPoint(board, [1, 2], {
          name: "",
          fixed: false,
          ...DEFAULT_GLIDER_ATTRIBUTES
        }, COLORS.blue);

        // z2
        const z2 = createPoint(board, [2, 0.5], {
          name: "",
          fixed: false,
          ...DEFAULT_GLIDER_ATTRIBUTES
        }, COLORS.blue);

        const z3 = createPoint(board,
          [() => z1.X() + z2.X(), () => z1.Y() + z2.Y()],
          {name: "" },
          COLORS.red
        );

        createArrow(board, [O, z1], {
        }, COLORS.blue);

        createText(board,
          [() => z1.X() + 0.12, () => z1.Y() + 0.12],
          "z₁",
          {
            fontSize: 18,
            fixed: false
          },
          COLORS.blue
        );

        createArrow(board, [O, z2], {
        }, COLORS.blue);

        createText(board,
          [() => z2.X() + 0.12, () => z2.Y() + 0.12],
          "z₂",
          {
          },
          COLORS.blue
        );

        createArrow(board, [O, z3], {
        }, COLORS.red);

        createText(board,
          [() => z3.X() + 0.12, () => z3.Y() + 0.12],
          "z₁ + z₂",
          {
          },
          COLORS.red
        );

        // ============================================================
        // - from z2 to z1+z2 is a translated copy of z1  (label it z1)
        // - from z1 to z1+z2 is a translated copy of z2  (label it z2)
        // ============================================================

        // z2 -> z3 equals z1 (translated)
        createArrow(board, [z2, z3], {
          dash: 2,
          strokeOpacity: 0.95,
        }, COLORS.lightBlue);

        createText(board,
          [() => (z2.X() + z3.X()) / 2 + 0.08, () => (z2.Y() + z3.Y()) / 2 + 0.08],
          "z₁",
          {
          },
          COLORS.lightBlue
        );

        // z1 -> z3 equals z2 (translated)
        createArrow(board, [z1, z3], {
          dash: 2,
        }, COLORS.lightBlue); 

        createText(board,
          [() => (z1.X() + z3.X()) / 2 + 0.08, () => (z1.Y() + z3.Y()) / 2 + 0.08],
          "z₂",
          {
          },
          COLORS.lightBlue
        );

        board.on("move", () => board.update());
      }}
    />
  );
}