function PieChart(this: any, x: number, y: number, diameter: number) {
	this.x = x;
	this.y = y;
	this.diameter = diameter;
	this.labelSpace = 30;

	this.get_radians = (data: any[]) => {
		const total = sum(data);
		const radians = [];

		for (let i = 0; i < data.length; i++) {
			radians.push((data[i] / total) * TWO_PI);
		}

		return radians;
	};

	this.draw = function(data: any[], labels: string[], colours: string[], title: string) {

		console.log(labels);
		console.log(colours);

		// Test that data is not empty and that each input array is the
		// same length.
		if (data.length === 0) {
			alert('Data has length zero!');
		} else if (![labels, colours].every(array => array.length === data.length)) {
			alert(
				`Data (length: ${data.length})
				Labels (length: ${labels.length})
				Colours (length: ${colours.length})
				Arrays must be the same length!`
			);
		}

		// https://p5js.org/examples/form-pie-chart.html

		const angles = this.get_radians(data);
		let lastAngle = 0;
		let colour;

		for (let i = 0; i < data.length; i++) {
			if (colours) {
				colour = colours[i];
			} else {
				colour = map(i, 0, data.length, 0, 255);
			}

			// @ts-ignore
			fill(colour);
			stroke(0);
			strokeWeight(1);

			arc(
				this.x, this.y,
				this.diameter, this.diameter,
				lastAngle, lastAngle + angles[i] + 0.001  // Hack for 0!
			);

			if (labels) {
				this.makeLegendItem(labels[i], i, colour);
			}

			lastAngle += angles[i];
		}

		if (title) {
			noStroke();
			textAlign('center', 'center');
			textSize(24);
			text(title, this.x, this.y - this.diameter * 0.6);
		}
	};

	this.makeLegendItem = function(label: string, i: number, colour: string) {
		const x = this.x + 50 + this.diameter / 2;
		const y = this.y + (this.labelSpace * i) - this.diameter / 3;
		const boxWidth = this.labelSpace / 2;
		const boxHeight = this.labelSpace / 2;

		fill(colour);
		rect(x, y, boxWidth, boxHeight);

		fill('black');
		noStroke();
		textAlign('left', 'center');
		textSize(12);
		text(label, x + boxWidth + 10, y + boxWidth / 2);
	};
}
