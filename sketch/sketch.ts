// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
const gallery = new (Gallery as any)();

function setup() {
    const canvas = createCanvas(1024, 576);
    canvas.parent('app');

    // Add the visualisation objects here.
    gallery.addVisual(new (TechDiversityRace as any)());
    gallery.addVisual(new (TechDiversityGender as any)());
    gallery.addVisual(new (PayGapByJob2017 as any)());
    gallery.addVisual(new (PayGapTimeSeries as any)());
    gallery.addVisual(new (ClimateChange as any)());
}

function draw() {
	background(255);
	if (gallery.selectedVisual != null) {
		gallery.selectedVisual.draw();
	}
}
