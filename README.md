# Math Applets

Visualization of some example in math (calculus one)

## Code 

The main code of each applets is in `components/applets`, using JSXGraph.
I used React and created a reusable component `JSXGraphBoard`:
All the example are like
```tsx
<JSXGraphBoard
            config={{ boundingbox: [-5, 5, 5, -5], axis: true }}
            setup={(board: JXG.Board) => {
                //main code
                ...
```
To reprduce it in simple javascript on can just copy the main code inside set up and initialize the board as follow:
```tsx
JSXGraph.initBoard("html id", {
            boundingbox: [-5, 5, 5, -5],
            axis: true,
            ...config,
});
        //main code
```
## Install and Run the project

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
