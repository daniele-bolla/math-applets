import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS } from "../../utils/jsxgraph";

export default function MVTIntegralClean() {
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
                const den = (x: number)=> x*(x - 2)*(x - 4)
                const f = (x: number) => 1 / den(x)
                
                board.create('functiongraph', [f, -10, 10], {
                    strokeColor: COLORS.blue, strokeWidth: 3, name: 'f(x)',
                    withLabel: true, label: { position: 'rt', offset: [-10, 10], color: COLORS.blue }
                });
            }}
        />
    );
}