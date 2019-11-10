//https://processing.org/examples/morph.html
var Morph = /** @class */ (function () {
    function Morph() {
    }
    // This boolean variable will control if we are morphing to a circle or square
    Morph.prototype.setup = function () {
        // Setup shapes array
        this.shapes = [];
        this.currentShape = 0;
        this.shapes.push({ points: Shapes.circle(100), color: color('#009CDF') });
        this.shapes.push({ points: Shapes.circle(150), color: color(255, 204, 0) });
        this.shapes.push({ points: Shapes.square(50), color: color(175, 100, 220) });
        // this.shapes.push({points: Shapes.star(p, 0, 0, 30, 70, 5), color: color('#E23838')});
        // setup morph array
        this.morph = new Array();
        var highestCount = 0;
        for (var i = 0; i < this.shapes.length; i++) {
            highestCount = Math.max(highestCount, this.shapes[i].points.length);
        }
        for (var i = 0; i < highestCount; i++) {
            this.morph.push(new p5.Vector());
        }
    };
    Morph.prototype.recalc = function () {
        // We will keep how far the vertices are from their target
        var totalDistance = 0;
        // Look at each vertex
        var points = this.shapes[this.currentShape].points;
        for (var i = 0; i < points.length; i++) {
            // Are we lerping to the circle or square?
            var v1 = points[i];
            // Get the vertex we will draw
            var v2 = this.morph[i];
            // Lerp to the target
            v2.lerp(v1, 0.1);
            // Check how far we are from target
            totalDistance += p5.Vector.dist(v1, v2);
        }
        // If all the vertices are close, switch shape
        if (totalDistance < 0.1) {
            this.currentShape++; //= !this.state;
            if (this.currentShape >= this.shapes.length) {
                this.currentShape = 0;
            }
        }
    };
    Morph.prototype.draw = function () {
        this.recalc();
        var color = this.shapes[this.currentShape].color;
        var points = this.shapes[this.currentShape].points;
        // Draw relative to center
        translate(width / 2, height / 2);
        strokeWeight(4);
        // Draw a polygon that makes up all the vertices
        beginShape();
        noFill();
        stroke(color);
        for (var i = 0; i < points.length; i++) {
            var v = this.morph[i];
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
    };
    return Morph;
}());
var Shapes = /** @class */ (function () {
    function Shapes() {
    }
    Shapes.circle = function (size) {
        // Create a circle using vectors pointing from center
        var points = new Array();
        for (var angle = 0; angle < 360; angle += 9) {
            // Note we are not starting from 0 in order to match the
            // path of a circle.  
            var v = p5.Vector.fromAngle(radians(angle - 135));
            v.mult(size);
            points.push(v);
        }
        return points;
    };
    Shapes.square = function (size) {
        var points = new Array();
        // A square is a bunch of vertices along straight lines
        // Top of square
        for (var x = -size; x < size; x += 10) {
            points.push(createVector(x, -size));
        }
        // Right side
        for (var y = -size; y < size; y += 10) {
            points.push(createVector(size, y));
        }
        // Bottom
        for (var x = size; x > -size; x -= 10) {
            points.push(createVector(x, size));
        }
        // Left side
        for (var y = size; y > -size; y -= 10) {
            points.push(createVector(-size, y));
        }
        return points;
    };
    // star(0, 0, 30, 70, 5); 
    Shapes.star = function (x, y, radius1, radius2, npoints) {
        var angle = TWO_PI / npoints;
        var halfAngle = angle / 2.0;
        var points = new Array();
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = x + cos(a) * radius2;
            var sy = y + sin(a) * radius2;
            points.push(createVector(sx, sy));
            sx = x + cos(a + halfAngle) * radius1;
            sy = y + sin(a + halfAngle) * radius1;
            points.push(createVector(sx, sy));
        }
        return points;
    };
    return Shapes;
}());
var morph;
function setup() {
    createCanvas(windowWidth, windowHeight);
    morph = new Morph();
    morph.setup();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    background(100);
    morph.draw();
}
//# sourceMappingURL=build.js.map