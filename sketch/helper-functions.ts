// --------------------------------------------------------------------
// Data processing helper functions.
// --------------------------------------------------------------------
function sum(data: any[]) {
    let total = 0;

    // Ensure that data contains numbers and not strings.
    data = stringsToNumbers(data);

    for (let i = 0; i < data.length; i++) {
        total = total + data[i];
    }

    return total;
}

function mean(data: any[]) {
    const total = sum(data);

    return total / data.length;
}

function sliceRowNumbers(row: { arr: any[]; getNum: (arg0: number) => any; }, start = 0, end: number) {
    const rowData = [];

    if (!end) {
        // Parse all values until the end of the row.
        end = row.arr.length;
    }

    for (let i = start; i < end; i++) {
        rowData.push(row.getNum(i));
    }

    return rowData;
}

function stringsToNumbers(array: any[]) {
    return array.map(Number);
}

// --------------------------------------------------------------------
// Plotting helper functions
// --------------------------------------------------------------------

function drawAxis(
		layout: { leftMargin: number; bottomMargin: number; rightMargin: number; topMargin: number; }, colour = 0) {

    stroke(color(colour));

    // x-axis
    line(
        layout.leftMargin,
        layout.bottomMargin,
        layout.rightMargin,
        layout.bottomMargin
    );

    // y-axis
    line(
        layout.leftMargin,
        layout.topMargin,
        layout.leftMargin,
        layout.bottomMargin
    );
}

function drawAxisLabels(
		xLabel: string, yLabel: string, layout: { plotWidth: () => number; leftMargin: number;
		bottomMargin: number; marginSize: number; }) {

	fill(0);
	noStroke();
	textAlign('center', 'center');

	// Draw x-axis label.
	text(xLabel,
		(layout.plotWidth() / 2) + layout.leftMargin,
		layout.bottomMargin + (layout.marginSize * 1.5)
	);

	// Draw y-axis label.
	push();
	translate(
		layout.leftMargin - (layout.marginSize * 1.5),
		layout.bottomMargin / 2
	);
	rotate(- PI / 2);
	text(yLabel, 0, 0);
	pop();
}

function drawYAxisTickLabels(
		min: number, max: number, layout: { numYTickLabels: number; leftMargin: number; pad: number; grid: any;
		rightMargin: number; }, mapFunction: (arg0: number) => any, decimalPlaces: number | undefined
	) {
	// Map function must be passed with .bind(this).
	const range = max - min;
	const yTickStep = range / layout.numYTickLabels;

	fill(0);
	noStroke();
	textAlign('right', 'center');

	// Draw all axis tick labels and grid lines.
	for (let i = 0; i <= layout.numYTickLabels; i++) {
		const value = min + (i * yTickStep);
		const y = mapFunction(value);

		// Add tick label.
		text(
			value.toFixed(decimalPlaces),
			layout.leftMargin - layout.pad, y
		);

		if (layout.grid) {
			// Add grid line.
			stroke(200);
			line(layout.leftMargin, y, layout.rightMargin, y);
		}
	}
}

function drawXAxisTickLabel(
		value: string | number, layout: { bottomMargin: number; marginSize: number; grid: any;
		topMargin: number; }, mapFunction: (arg0: any) => any) {

	// Map function must be passed with .bind(this).
	const x = mapFunction(value);

	fill(0);
	noStroke();
	textAlign('center', 'center');

	// Add tick label.
	text(
		value, x,
		layout.bottomMargin + layout.marginSize / 2
	);

	if (layout.grid) {
		// Add grid line.
		stroke(220);
		line(
			x, layout.topMargin,
			x, layout.bottomMargin
		);
	}
}
