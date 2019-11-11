"use strict";
function ClimateChange() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Climate Change';
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'climate-change';
    // Names for each axis.
    this.xAxisLabel = 'year';
    this.yAxisLabel = '℃';
    var marginSize = 35;
    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        marginSize: marginSize,
        // Locations of margin positions. Left and bottom have double margin
        // size due to axis and tick labels.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,
        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },
        plotHeight: function () {
            return this.bottomMargin - this.topMargin;
        },
        // Boolean to enable/disable background grid.
        grid: false,
        // Number of axis tick labels to draw so that they are not drawn on
        // top of one another.
        numXTickLabels: 8,
        numYTickLabels: 8
    };
    // Property to represent whether data has been loaded.
    this.loaded = false;
    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
        // @ts-ignore
        './data/surface-temperature/surface-temperature.csv', 'csv', 'header', 
        // Callback function to set the value
        // this.loaded to true.
        function (table) {
            self.loaded = true;
        });
    };
    this.setup = function () {
        // Font defaults.
        textSize(16);
        textAlign('center', 'center');
        // Set min and max years: assumes data is sorted by year.
        this.minYear = this.data.getNum(0, 'year');
        this.maxYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
        // Find min and max temperature for mapping to canvas height.
        this.minTemperature = min(this.data.getColumn('temperature'));
        this.maxTemperature = max(this.data.getColumn('temperature'));
        // Find mean temperature to plot average marker.
        this.meanTemperature = mean(this.data.getColumn('temperature'));
        // Count the number of frames drawn since the visualisation
        // started so that we can animate the plot.
        this.frameCount = 0;
        // Create sliders to control start and end years. Default to
        // visualise full range.
        this.startSlider = createSlider(this.minYear, this.maxYear - 1, this.minYear, 1);
        this.startSlider.position(400, 10);
        this.endSlider = createSlider(this.minYear + 1, this.maxYear, this.maxYear, 1);
        this.endSlider.position(600, 10);
    };
    this.destroy = function () {
        this.startSlider.remove();
        this.endSlider.remove();
    };
    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // Prevent slider ranges overlapping.
        if (this.startSlider.value() >= this.endSlider.value()) {
            this.startSlider.value(this.endSlider.value() - 1);
        }
        this.startYear = this.startSlider.value();
        this.endYear = this.endSlider.value();
        // Draw all y-axis tick labels.
        drawYAxisTickLabels(this.minTemperature, this.maxTemperature, this.layout, this.mapTemperatureToHeight.bind(this), 1);
        // Draw x and y axis.
        drawAxis(this.layout);
        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
        // Plot average line.
        stroke(200);
        strokeWeight(1);
        line(this.layout.leftMargin, this.mapTemperatureToHeight(this.meanTemperature), this.layout.rightMargin, this.mapTemperatureToHeight(this.meanTemperature));
        // Plot all temperatures between startYear and endYear using the
        // width of the canvas minus margins.
        var previous;
        var numYears = this.endYear - this.startYear;
        var segmentWidth = this.layout.plotWidth() / numYears;
        // Count the number of years plotted each frame to create
        // animation effect.
        var yearCount = 0;
        // Loop over all rows but only plot those in range.
        for (var i = 0; i < this.data.getRowCount(); i++) {
            // Create an object to store data for the current year.
            var current = {
                // Convert strings to numbers.
                'year': this.data.getNum(i, 'year'),
                'temperature': this.data.getNum(i, 'temperature')
            };
            if (previous != null
                && current.year > this.startYear
                && current.year <= this.endYear) {
                // Draw background gradient to represent colour temperature of
                // the current year.
                noStroke();
                fill(this.mapTemperatureToColour(current.temperature));
                rect(this.mapYearToWidth(previous.year), this.layout.topMargin, segmentWidth, this.layout.plotHeight());
                // Draw line segment connecting previous year to current
                // year temperature.
                stroke(0);
                line(this.mapYearToWidth(previous.year), this.mapTemperatureToHeight(previous.temperature), this.mapYearToWidth(current.year), this.mapTemperatureToHeight(current.temperature));
                // The number of x-axis labels to skip so that only
                // numXTickLabels are drawn.
                var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);
                // Draw the tick label marking the start of the previous year.
                if (yearCount % xLabelSkip == 0) {
                    drawXAxisTickLabel(previous.year, this.layout, this.mapYearToWidth.bind(this));
                }
                // When six or fewer years are displayed also draw the final
                // year x tick label.
                if ((numYears <= 6
                    && yearCount == numYears - 1)) {
                    drawXAxisTickLabel(current.year, this.layout, this.mapYearToWidth.bind(this));
                }
                yearCount++;
            }
            // Stop drawing this frame when the number of years drawn is
            // equal to the frame count. This creates the animated effect
            // over successive frames.
            if (yearCount >= this.frameCount) {
                break;
            }
            // Assign current year to previous year so that it is available
            // during the next iteration of this loop to give us the start
            // position of the next line segment.
            previous = current;
        }
        // Count the number of frames since this visualisation
        // started. This is used in creating the animation effect and to
        // stop the main p5 draw loop when all years have been drawn.
        this.frameCount++;
        // Stop animation when all years have been drawn.
        if (this.frameCount >= numYears) {
            //noLoop();
        }
    };
    this.mapYearToWidth = function (value) {
        return map(value, this.startYear, this.endYear, this.layout.leftMargin, // Draw left-to-right from margin.
        this.layout.rightMargin);
    };
    this.mapTemperatureToHeight = function (value) {
        return map(value, this.minTemperature, this.maxTemperature, this.layout.bottomMargin, // Lower temperature at bottom.
        this.layout.topMargin // Higher temperature at top.
        );
    };
    this.mapTemperatureToColour = function (value) {
        var red = map(value, this.minTemperature, this.maxTemperature, 0, 255);
        var blue = 255 - red;
        return color(red, 0, blue, 100);
    };
}
function Gallery() {
    this.visuals = [];
    this.selectedVisual = null;
    var self = this;
    // Add a new visualisation to the navigation bar.
    this.addVisual = function (vis) {
        // Check that the vis object has an id and name.
        if (!vis.hasOwnProperty('id')
            && !vis.hasOwnProperty('name')) {
            alert('Make sure your visualisation has an id and name!');
        }
        // Check that the vis object has a unique id.
        if (this.findVisIndex(vis.id) != null) {
            alert("Vis '" + vis.name + "' has a duplicate id: '" + vis.id + "'");
        }
        this.visuals.push(vis);
        // Create menu item.
        var menuItem = createElement('li', vis.name);
        menuItem.addClass('menu-item');
        menuItem.id(vis.id);
        menuItem.mouseOver(function (e) {
            var el = select('#' + e.srcElement.id);
            el.addClass("hover");
        });
        menuItem.mouseOut(function (e) {
            var el = select('#' + e.srcElement.id);
            el.removeClass("hover");
        });
        menuItem.mouseClicked(function (e) {
            //remove selected class from any other menu-items
            var menuItems = selectAll('.menu-item');
            for (var i = 0; i < menuItems.length; i++) {
                menuItems[i].removeClass('selected');
            }
            var el = select('#' + e.srcElement.id);
            el.addClass('selected');
            self.selectVisual(e.srcElement.id);
        });
        var visMenu = select('#visuals-menu');
        visMenu.child(menuItem);
        // Preload data if necessary.
        if (vis.hasOwnProperty('preload')) {
            vis.preload();
        }
    };
    this.findVisIndex = function (visId) {
        // Search through the visualisations looking for one with the id
        // matching visId.
        for (var i = 0; i < this.visuals.length; i++) {
            if (this.visuals[i].id == visId) {
                return i;
            }
        }
        // Visualisation not found.
        return null;
    };
    this.selectVisual = function (visId) {
        var visIndex = this.findVisIndex(visId);
        if (visIndex != null) {
            // If the current visualisation has a deselect method run it.
            if (this.selectedVisual != null
                && this.selectedVisual.hasOwnProperty('destroy')) {
                this.selectedVisual.destroy();
            }
            // Select the visualisation in the gallery.
            this.selectedVisual = this.visuals[visIndex];
            // Initialise visualisation if necessary.
            if (this.selectedVisual.hasOwnProperty('setup')) {
                this.selectedVisual.setup();
            }
            // Enable animation in case it has been paused by the current
            // visualisation.
            loop();
        }
    };
}
// --------------------------------------------------------------------
// Data processing helper functions.
// --------------------------------------------------------------------
function sum(data) {
    var total = 0;
    // Ensure that data contains numbers and not strings.
    data = stringsToNumbers(data);
    for (var i = 0; i < data.length; i++) {
        total = total + data[i];
    }
    return total;
}
function mean(data) {
    var total = sum(data);
    return total / data.length;
}
function sliceRowNumbers(row, start, end) {
    if (start === void 0) { start = 0; }
    var rowData = [];
    if (!end) {
        // Parse all values until the end of the row.
        end = row.arr.length;
    }
    for (var i = start; i < end; i++) {
        rowData.push(row.getNum(i));
    }
    return rowData;
}
function stringsToNumbers(array) {
    return array.map(Number);
}
// --------------------------------------------------------------------
// Plotting helper functions
// --------------------------------------------------------------------
function drawAxis(layout, colour) {
    if (colour === void 0) { colour = 0; }
    stroke(color(colour));
    // x-axis
    line(layout.leftMargin, layout.bottomMargin, layout.rightMargin, layout.bottomMargin);
    // y-axis
    line(layout.leftMargin, layout.topMargin, layout.leftMargin, layout.bottomMargin);
}
function drawAxisLabels(xLabel, yLabel, layout) {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    // Draw x-axis label.
    text(xLabel, (layout.plotWidth() / 2) + layout.leftMargin, layout.bottomMargin + (layout.marginSize * 1.5));
    // Draw y-axis label.
    push();
    translate(layout.leftMargin - (layout.marginSize * 1.5), layout.bottomMargin / 2);
    rotate(-PI / 2);
    text(yLabel, 0, 0);
    pop();
}
function drawYAxisTickLabels(min, max, layout, mapFunction, decimalPlaces) {
    // Map function must be passed with .bind(this).
    var range = max - min;
    var yTickStep = range / layout.numYTickLabels;
    fill(0);
    noStroke();
    textAlign('right', 'center');
    // Draw all axis tick labels and grid lines.
    for (var i = 0; i <= layout.numYTickLabels; i++) {
        var value = min + (i * yTickStep);
        var y = mapFunction(value);
        // Add tick label.
        text(value.toFixed(decimalPlaces), layout.leftMargin - layout.pad, y);
        if (layout.grid) {
            // Add grid line.
            stroke(200);
            line(layout.leftMargin, y, layout.rightMargin, y);
        }
    }
}
function drawXAxisTickLabel(value, layout, mapFunction) {
    // Map function must be passed with .bind(this).
    var x = mapFunction(value);
    fill(0);
    noStroke();
    textAlign('center', 'center');
    // Add tick label.
    text(value, x, layout.bottomMargin + layout.marginSize / 2);
    if (layout.grid) {
        // Add grid line.
        stroke(220);
        line(x, layout.topMargin, x, layout.bottomMargin);
    }
}
function PayGapTimeSeries() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Pay gap: 1997-2017';
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'pay-gap-timeseries';
    // Title to display above the plot.
    this.title = 'Gender Pay Gap: Average difference between male and female pay.';
    // Names for each axis.
    this.xAxisLabel = 'year';
    this.yAxisLabel = '%';
    var marginSize = 35;
    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        marginSize: marginSize,
        // Locations of margin positions. Left and bottom have double margin
        // size due to axis and tick labels.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,
        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },
        plotHeight: function () {
            return this.bottomMargin - this.topMargin;
        },
        // Boolean to enable/disable background grid.
        grid: true,
        // Number of axis tick labels to draw so that they are not drawn on
        // top of one another.
        numXTickLabels: 10,
        numYTickLabels: 8,
    };
    // Property to represent whether data has been loaded.
    this.loaded = false;
    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
        // @ts-ignore
        './data/pay-gap/all-employees-hourly-pay-by-gender-1997-2017.csv', 'csv', 'header', 
        // Callback function to set the value this.loaded to true.
        function (table) {
            self.loaded = true;
        });
    };
    this.setup = function () {
        // Font defaults.
        textSize(16);
        // Set min and max years: assumes data is sorted by date.
        this.startYear = this.data.getNum(0, 'year');
        this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
        // Find min and max pay gap for mapping to canvas height.
        this.minPayGap = 0; // Pay equality (zero pay gap).
        this.maxPayGap = max(this.data.getColumn('pay_gap'));
    };
    this.destroy = function () {
    };
    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // Draw the title above the plot.
        this.drawTitle();
        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minPayGap, this.maxPayGap, this.layout, this.mapPayGapToHeight.bind(this), 0);
        // Draw x and y axis.
        drawAxis(this.layout);
        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
        // Plot all pay gaps between startYear and endYear using the width
        // of the canvas minus margins.
        var previous;
        var numYears = this.endYear - this.startYear;
        // Loop over all rows and draw a line from the previous value to
        // the current.
        for (var i = 0; i < this.data.getRowCount(); i++) {
            // Create an object to store data for the current year.
            var current = {
                // Convert strings to numbers.
                'year': this.data.getNum(i, 'year'),
                'payGap': this.data.getNum(i, 'pay_gap')
            };
            if (previous != null) {
                // Draw line segment connecting previous year to current
                // year pay gap.
                stroke(0);
                line(this.mapYearToWidth(previous.year), this.mapPayGapToHeight(previous.payGap), this.mapYearToWidth(current.year), this.mapPayGapToHeight(current.payGap));
                // The number of x-axis labels to skip so that only
                // numXTickLabels are drawn.
                var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);
                // Draw the tick label marking the start of the previous year.
                if (i % xLabelSkip == 0) {
                    drawXAxisTickLabel(previous.year, this.layout, this.mapYearToWidth.bind(this));
                }
            }
            // Assign current year to previous year so that it is available
            // during the next iteration of this loop to give us the start
            // position of the next line segment.
            previous = current;
        }
    };
    this.drawTitle = function () {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2));
    };
    this.mapYearToWidth = function (value) {
        return map(value, this.startYear, this.endYear, this.layout.leftMargin, // Draw left-to-right from margin.
        this.layout.rightMargin);
    };
    this.mapPayGapToHeight = function (value) {
        return map(value, this.minPayGap, this.maxPayGap, this.layout.bottomMargin, // Smaller pay gap at bottom.
        this.layout.topMargin); // Bigger pay gap at top.
    };
}
function PayGapByJob2017() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Pay gap by job: 2017';
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'pay-gap-by-job-2017';
    // Property to represent whether data has been loaded.
    this.loaded = false;
    // Graph properties.
    this.pad = 20;
    this.dotSizeMin = 15;
    this.dotSizeMax = 40;
    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
        // @ts-ignore
        './data/pay-gap/occupation-hourly-pay-by-gender-2017.csv', 'csv', 'header', 
        // Callback function to set the value
        // this.loaded to true.
        function (table) {
            self.loaded = true;
        });
    };
    this.setup = function () {
    };
    this.destroy = function () {
    };
    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // Draw the axes.
        this.addAxes();
        // Get data from the table object.
        var jobs = this.data.getColumn('job_subtype');
        var propFemale = this.data.getColumn('proportion_female');
        var payGap = this.data.getColumn('pay_gap');
        var numJobs = this.data.getColumn('num_jobs');
        // Convert numerical data from strings to numbers.
        propFemale = stringsToNumbers(propFemale);
        payGap = stringsToNumbers(payGap);
        numJobs = stringsToNumbers(numJobs);
        // Set ranges for axes.
        //
        // Use full 100% for x-axis (proportion of women in roles).
        var propFemaleMin = 0;
        var propFemaleMax = 100;
        // For y-axis (pay gap) use a symmetrical axis equal to the
        // largest gap direction so that equal pay (0% pay gap) is in the
        // centre of the canvas. Above the line means men are paid
        // more. Below the line means women are paid more.
        var payGapMin = -20;
        var payGapMax = 20;
        // Find smallest and largest numbers of people across all
        // categories to scale the size of the dots.
        var numJobsMin = min(numJobs);
        var numJobsMax = max(numJobs);
        fill(255);
        stroke(0);
        strokeWeight(1);
        for (var i = 0; i < this.data.getRowCount(); i++) {
            // Draw an ellipse for each point.
            // x = propFemale
            // y = payGap
            // size = numJobs
            ellipse(map(propFemale[i], propFemaleMin, propFemaleMax, this.pad, width - this.pad), map(payGap[i], payGapMin, payGapMax, height - this.pad, this.pad), map(numJobs[i], numJobsMin, numJobsMax, this.dotSizeMin, this.dotSizeMax));
        }
    };
    this.addAxes = function () {
        stroke(200);
        // Add vertical line.
        line(width / 2, 0 + this.pad, width / 2, height - this.pad);
        // Add horizontal line.
        line(0 + this.pad, height / 2, width - this.pad, height / 2);
    };
}
function PieChart(x, y, diameter) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.labelSpace = 30;
    this.get_radians = function (data) {
        var total = sum(data);
        var radians = [];
        for (var i = 0; i < data.length; i++) {
            radians.push((data[i] / total) * TWO_PI);
        }
        return radians;
    };
    this.draw = function (data, labels, colours, title) {
        console.log(labels);
        console.log(colours);
        // Test that data is not empty and that each input array is the
        // same length.
        if (data.length == 0) {
            alert('Data has length zero!');
        }
        else if (![labels, colours].every(function (array) { return array.length == data.length; })) {
            alert("Data (length: " + data.length + ")\n\t\t\t\tLabels (length: " + labels.length + ")\n\t\t\t\tColours (length: " + colours.length + ")\n\t\t\t\tArrays must be the same length!");
        }
        // https://p5js.org/examples/form-pie-chart.html
        var angles = this.get_radians(data);
        var lastAngle = 0;
        var colour;
        for (var i = 0; i < data.length; i++) {
            if (colours) {
                colour = colours[i];
            }
            else {
                colour = map(i, 0, data.length, 0, 255);
            }
            fill(colour);
            stroke(0);
            strokeWeight(1);
            arc(this.x, this.y, this.diameter, this.diameter, lastAngle, lastAngle + angles[i] + 0.001 // Hack for 0!
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
    this.makeLegendItem = function (label, i, colour) {
        var x = this.x + 50 + this.diameter / 2;
        var y = this.y + (this.labelSpace * i) - this.diameter / 3;
        var boxWidth = this.labelSpace / 2;
        var boxHeight = this.labelSpace / 2;
        fill(colour);
        rect(x, y, boxWidth, boxHeight);
        fill('black');
        noStroke();
        textAlign('left', 'center');
        textSize(12);
        text(label, x + boxWidth + 10, y + boxWidth / 2);
    };
}
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery = new Gallery();
function setup() {
    var canvas = createCanvas(1024, 576);
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
function TechDiversityGender() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Tech Diversity: Gender';
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'tech-diversity-gender';
    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        // Locations of margin positions. Left and bottom have double margin
        // size due to axis and tick labels.
        leftMargin: 130,
        rightMargin: width,
        topMargin: 30,
        bottomMargin: height,
        pad: 5,
        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },
        // Boolean to enable/disable background grid.
        grid: true,
        // Number of axis tick labels to draw so that they are not drawn on
        // top of one another.
        numXTickLabels: 10,
        numYTickLabels: 8,
    };
    // Middle of the plot: for 50% line.
    this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;
    // Default visualisation colours.
    this.femaleColour = color(255, 0, 0);
    this.maleColour = color(0, 255, 0);
    // Property to represent whether data has been loaded.
    this.loaded = false;
    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
        // @ts-ignore
        './data/tech-diversity/gender-2018.csv', 'csv', 'header', 
        // Callback function to set the value
        // this.loaded to true.
        function (table) {
            self.loaded = true;
        });
    };
    this.setup = function () {
        // Font defaults.
        textSize(16);
    };
    this.destroy = function () {
    };
    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // Draw Female/Male labels at the top of the plot.
        this.drawCategoryLabels();
        var lineHeight = (height - this.layout.topMargin) /
            this.data.getRowCount();
        for (var i = 0; i < this.data.getRowCount(); i++) {
            // Calculate the y position for each company.
            var lineY = (lineHeight * i) + this.layout.topMargin;
            // Create an object that stores data from the current row.
            var company = {
                // Convert strings to numbers.
                'name': this.data.getString(i, 'company'),
                'female': this.data.getNum(i, 'female'),
                'male': this.data.getNum(i, 'male'),
            };
            // Draw the company name in the left margin.
            fill(0);
            noStroke();
            textAlign('right', 'top');
            text(company.name, this.layout.leftMargin - this.layout.pad, lineY);
            // Draw female employees rectangle.
            fill(this.femaleColour);
            rect(this.layout.leftMargin, lineY, this.mapPercentToWidth(company.female), lineHeight - this.layout.pad);
            // Draw male employees rectangle.
            fill(this.maleColour);
            rect(this.layout.leftMargin + this.mapPercentToWidth(company.female), lineY, this.mapPercentToWidth(company.male), lineHeight - this.layout.pad);
        }
        // Draw 50% line
        stroke(150);
        strokeWeight(1);
        line(this.midX, this.layout.topMargin, this.midX, this.layout.bottomMargin);
    };
    this.drawCategoryLabels = function () {
        fill(0);
        noStroke();
        textAlign('left', 'top');
        text('Female', this.layout.leftMargin, this.layout.pad);
        textAlign('center', 'top');
        text('50%', this.midX, this.layout.pad);
        textAlign('right', 'top');
        text('Male', this.layout.rightMargin, this.layout.pad);
    };
    this.mapPercentToWidth = function (percent) {
        return map(percent, 0, 100, 0, this.layout.plotWidth());
    };
}
function TechDiversityRace() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Tech Diversity: Race';
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'tech-diversity-race';
    // Property to represent whether data has been loaded.
    this.loaded = false;
    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
        // @ts-ignore
        './data/tech-diversity/race-2018.csv', 'csv', 'header', 
        // Callback function to set the value
        // this.loaded to true.
        function (table) {
            self.loaded = true;
        });
    };
    this.setup = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // Create a select DOM element.
        this.select = createSelect();
        this.select.position(350, 40);
        // Fill the options with all company names.
        var companies = this.data.columns;
        // First entry is empty.
        for (var i = 1; i < companies.length; i++) {
            this.select.option(companies[i]);
        }
    };
    this.destroy = function () {
        this.select.remove();
    };
    // Create a new pie chart object.
    this.pie = new PieChart(width / 2, height / 2, width * 0.4);
    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // Get the value of the company we're interested in from the
        // select item.
        var companyName = this.select.value();
        // Get the column of raw data for companyName.
        var col = this.data.getColumn(companyName);
        // Convert all data strings to numbers.
        col = stringsToNumbers(col);
        // Copy the row labels from the table (the first item of each row).
        var labels = this.data.getColumn(0);
        // Colour to use for each category.
        var colours = ['blue', 'red', 'green', 'pink', 'purple', 'yellow'];
        // Make a title.
        var title = 'Employee diversity at ' + companyName;
        // Draw the pie chart!
        this.pie.draw(col, labels, colours, title);
    };
}
//# sourceMappingURL=build.js.map