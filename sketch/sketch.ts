// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery = new Gallery();

function setup() {
    const canvas = createCanvas(1024, 576);
    canvas.parent('app');

    // Add the visualisation objects here.
    gallery.addVisual(new TechDiversityRace());
    gallery.addVisual(new TechDiversityGender());
    gallery.addVisual(new PayGapByJob2017());
    gallery.addVisual(new PayGapTimeSeries());
    gallery.addVisual(new ClimateChange());
}

function draw() {
	background(255);
	if (gallery.selectedVisual != null) {
		gallery.selectedVisual.draw();
	}
}
