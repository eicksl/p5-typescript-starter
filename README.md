# Starter Template
## p5.js with TypeScript
This starter template will quickly get you started with working in both [p5.js](https://p5js.org/) and
[TypeScript](https://www.typescriptlang.org). If you have chosen to do the Data Visualiser project, the JS files from
the original template have already been converted to strict TypeScript for you here. The original JS files are available
in the `js-orig-template` directory for reference purposes.

## Getting Started

### Setup
* [Install Node.js](https://nodejs.org/en/download)
* Install TypeScript and TSLint by running `npm install -g typescript tslint` in a terminal
* [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* Download the project: `git clone https://github.com/eicksl/p5-typescript-starter.git`
* Move into the project directory: `cd p5-typescript-starter`
* Run `npm install`

From now on, you can just run `npm start` from the project's root directory.

### Usage
```
npm test
```
This does one or more things. First it will compile all .ts files in the `sketch` directory. If there are no compilation
errors, it will convert everything to a single, readable JS file called `build.js` within the `build` directory (all
code comments will be preserved). If everything was successful, it will then run TSLint to check for linting errors.

```
npm start
```
This will compile and run the project locally. You can access it at http://localhost:3000 As you make changes to TypeScript files,
the code will automatically recompile and the changes will update in the browser.

## Global and Instanced mode
P5 is able to run in either global or instanced mode.
https://github.com/processing/p5.js/wiki/Global-and-instance-mode

This starter project now uses **Global mode** to bring it inline with most of the online resources provided by the project.

As stated on the P5 wiki:
> While this is convenient (and friendlier) it's important to note that this can lead to problems and confusion down the road when mixing other JS libraries or trying to embed multiple p5 sketches on the same page. A safer, more advanced methodology is to create a p5 sketch as an object "instance".

The following examples are both functionally the same.

### Global Mode
``` typescript
let x = 100;
let y = 100;

function setup() {
  createCanvas(windowWidth,windowHeight);
}

function draw() {
  background(0);
  fill(255);
  rect(x,y,50,50);
}
```

### Instanced Mode
``` typescript
var sketch = (p: p5) => {
    this.x = 100;
    this.y = 100;
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
    }

    p.draw = () => {
        p.background(0);
        p.fill(255);
        p.rect(this.x,this.y,50,50);
    }
}

new p5(sketch);
```


This starter project will work with either mode, feel free to experiment with both.