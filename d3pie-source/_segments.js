// --------- segments.js -----------
var segments = {

	/**
	 * Creates the pie chart segments and displays them according to the desired load effect.
	 * @private
	 */
	create: function(pie) {
		var pieCenter = pie.pieCenter;
		var colors = pie.options.colors;
		var loadEffects = pie.options.effects.load;
		var segmentStroke = pie.options.misc.colors.segmentStroke;

		testObj.currentSegmentsOpen[pie.element.id] = [];

		//added outer circle to pie component
		var outerCircle =  pie.svg.insert("circle", "#" + pie.cssPrefix + "title")
			.attr("cx", pie.pieCenter.x)
			.attr("cy", pie.pieCenter.y)
			.attr("r", pie.outerRadius+pie.outerRadiusOffset)
			.attr("fill", "#f1f1ec")
			.style("cursor","pointer")
			.style("cursor","hand")
			.on('click', function(d){
				var arr1 = d3.selectAll("." + pie.cssPrefix + "expanded")[0];

				for(var i1 = 0; i1 < arr1.length; i1++)
				{
					//segments.closeSegment(pie,arr1[i1]);
					segments.closeSegmentNew(pie,arr1[i1]);
				}

				segments.onSegmentEventNew(pie, pie.options.callbacks.onCloseSegmentNew, undefined, false);
			});

		// we insert the pie chart BEFORE the title, to ensure the title overlaps the pie
		var pieChartElement = pie.svg.insert("g", "#" + pie.cssPrefix + "title")
			.attr("transform", function() { return math.getPieTranslateCenter(pieCenter); })
			.attr("class", pie.cssPrefix + "pieChart");

		var arc = d3.svg.arc()
			.innerRadius(pie.innerRadius)
			.outerRadius(pie.outerRadius)
			.startAngle(0)
			.endAngle(function(d) {
				return (d.value / pie.totalSize) * 2 * Math.PI;
			});

		var g = pieChartElement.selectAll("." + pie.cssPrefix + "arc")
			.data(pie.options.data.content)
			.enter()
			.append("g")
			.attr("class", pie.cssPrefix + "arc");

		// if we're not fading in the pie, just set the load speed to 0
		var loadSpeed = loadEffects.speed;
		if (loadEffects.effect === "none") {
			loadSpeed = 0;
		}

		g.append("path")
			.attr("id", function(d, i) { return pie.cssPrefix + "segment" + i; })
			.attr("fill", function(d, i) {
				var color;
				if(d.hasOwnProperty("label") && d.label==="Others")
				{
					color = colors[colors.length-1];
				}
				else
				{
					color = colors[i];
				}

				if (pie.options.misc.gradient.enabled) {
					color = "url(#" + pie.cssPrefix + "grad" + i + ")";
				}
				return color;
			})
			.style("stroke", segmentStroke)
			.style("stroke-width", 1)
			.transition()
			.ease("cubic-in-out")
			.duration(loadSpeed)
			.attr("data-index", function(d, i) { return i; })
			.attrTween("d", function(b) {
				var i = d3.interpolate({ value: 0 }, b);
				return function(t) {
					return pie.arc(i(t));
				};
			});

		pie.svg.selectAll("g." + pie.cssPrefix + "arc")
			.attr("transform",
			function(d, i) {
				var angle = 0;
				if (i > 0) {
					angle = segments.getSegmentAngle(i-1, pie.options.data.content, pie.totalSize);
				}
				return "rotate(" + angle + ")";
			}
		);
		pie.arc = arc;
	},

	addGradients: function(pie) {
		var grads = pie.svg.append("defs")
			.selectAll("radialGradient")
			.data(pie.options.data.content)
			.enter().append("radialGradient")
			.attr("gradientUnits", "userSpaceOnUse")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", "120%")
			.attr("id", function(d, i) { return pie.cssPrefix + "grad" + i; });

		grads.append("stop").attr("offset", "0%").style("stop-color", function(d, i) { return pie.options.colors[i]; });
		grads.append("stop").attr("offset", pie.options.misc.gradient.percentage + "%").style("stop-color", pie.options.misc.gradient.color);
	},

	addSegmentEventHandlers: function(pie) {
		var arc = d3.selectAll("." + pie.cssPrefix + "arc,." + pie.cssPrefix + "labelGroup-inner,." + pie.cssPrefix + "labelGroup-outer");
		//arc.on("click", testObj.pieSegmentClickHandler(event,pie));
		arc.on("click", function (event) {
			testObj.pieSegmentClickHandler(event,this,pie);
		}, false);
		//arc.on("click", onPieSegmentClickHandler_bk);//@satish: added click handler here for actually open/close the segment while clicking on it and make it selected or de-selected.

//        arc.on("mousedown", function () {
//            testObj.pieSegmentMouseDownHandler(d3.event, pie)
//        });

		arc.on("mouseover", function() {
			var currentEl = d3.select(this);
			var segment, index;

			if (currentEl.attr("class") === pie.cssPrefix + "arc") {
				segment = currentEl.select("path");
			} else {
				index = currentEl.attr("data-index");
				segment = d3.select("#" + pie.cssPrefix + "segment" + index);
			}

			if (pie.options.effects.highlightSegmentOnMouseover) {
				index = segment.attr("data-index");
				var segColor = pie.options.colors[index];
				segment.style("fill", helpers.getColorShade(segColor, pie.options.effects.highlightLuminosity));
			}

			if (pie.options.tooltips.enabled) {
				index = segment.attr("data-index");
				//var currEl = d3.select(pie);
				var tip = d3.select('#'+pie.element.id+'_tooltip')[0];
				var t1 = tip[0];
				var txt = this.__data__;
				var caption = pie.options.tooltips.string;
				if (pie.options.tooltips.type === "caption") {
					caption = d.caption;
				}
				var tipStr = tt.replacePlaceholders(pie, caption,0, {
					label: txt.label,
					value: txt.value,
					percentage: segments.getPercentage(pie, index, pie.options.labels.percentage.decimalPlaces)
				});

				t1.innerHTML = pie.options.tooltips.renderer ? pie.options.tooltips.renderer({
					label: txt.label,
					value: txt.value,
					percentage: segments.getPercentage(pie, index, pie.options.labels.percentage.decimalPlaces)
				}) : tipStr; //txt.label;

				t1.style.display= 'block';
				//tt.showTooltip(pie, index);
				var txtLen = txt.label.length;
				if(txtLen>pie.options.tooltips.styles.wordWrapLength)
				{
					t1.style.width= "150px";
					t1.style['word-wrap'] =  "break-word";
				}
				else
				{
					t1.style['word-wrap'] =  "normal";
					t1.style.width= null;
				}
			}

			segment.style("cursor", "pointer");
			segment.style("cursor", "hand");

			var isExpanded = segment.attr("class") === pie.cssPrefix + "expanded";
			segments.onSegmentEvent(pie, pie.options.callbacks.onMouseoverSegment, segment, isExpanded);
		});

		arc.on("mousemove", function() {

			var tip = d3.select('#'+pie.element.id+'_tooltip')[0];
			var t1 = tip[0];

			var x, y;
			if (pie.options.tooltips.customPositioning) {
				x = mouseCoords[0] - t1.clientWidth;
				y = mouseCoords[1] + 25;
			}
			else {
				x = d3.event.pageX + 10;
				y = d3.event.pageY - (7 * pie.options.tooltips.styles.padding);
			}
			var mouseCoords = d3.mouse(pie.element.parentNode);
			t1.style.left= x + 'px';
			t1.style.top= y + 'px';
		});

		arc.on("mouseout", function() {
			var currentEl = d3.select(this);
			var segment, index;

			if (currentEl.attr("class") === pie.cssPrefix + "arc") {
				segment = currentEl.select("path");
			} else {
				index = currentEl.attr("data-index");
				segment = d3.select("#" + pie.cssPrefix + "segment" + index);
			}

			if (pie.options.effects.highlightSegmentOnMouseover) {
				index = segment.attr("data-index");
				var color = pie.options.colors[index];
				if (pie.options.misc.gradient.enabled) {
					color = "url(#" + pie.cssPrefix + "grad" + index + ")";
				}
				segment.style("fill", color);
			}

			if (pie.options.tooltips.enabled) {
				index = segment.attr("data-index");
				//tt.hideTooltip(pie, index);
				var tip = d3.select('#'+pie.element.id+'_tooltip')[0];
				var t1 = tip[0];
				var txt = this.__data__;
				t1.innerHTML = txt.label;
				t1.style.display= 'none';
			}

			segment.style("cursor", "default");

			var isExpanded = segment.attr("class") === pie.cssPrefix + "expanded";
			segments.onSegmentEvent(pie, pie.options.callbacks.onMouseoutSegment, segment, isExpanded);
		});
	},

	// helper function used to call the click, mouseover, mouseout segment callback functions
	onSegmentEventPieWedgeCalled: function(pie, func, cIndex, segment, isExpanded) {
		if (!helpers.isFunction(func)) {
			return;
		}
		func({
			segment: cIndex,
			index: cIndex,
			expanded: isExpanded,
			data: cIndex
		});
	},
	onSegmentEventNew: function(pie, func, segment, isExpanded, manualTrigger) {
		if (!helpers.isFunction(func)) {
			return;
		}
		if (segment === undefined) {
			func({
				closeAll: true
			});
		} else {
			var index = segment.__data__.id;
			func({
				index: (index - 1),
				manualTrigger: manualTrigger
			});
		}
	},

	onSegmentEvent: function(pie, func, segment, isExpanded, ctrlOrMeta) {
		if (!helpers.isFunction(func)) {
			return;
		}
		var index = parseInt(segment.attr("data-index"), 10);
		func({
			segment: segment.node(),
			index: index,
			expanded: isExpanded,
			data: pie.options.data.content[index],
			ctrlOrMeta: ctrlOrMeta
		});
	},

	openSegment: function(pie, segment) {
		testObj.currentSegmentsOpen[pie.element.id].push(segment);

		if (pie.isOpeningSegment) {
			return;
		}

		pie.isOpeningSegment = true;

		var arr1 = d3.selectAll("." + pie.cssPrefix + "expanded")[0];
		// close any open segments
		if (!pie.allowMultipleSelection)
		{
			var i1 = 0;
			for(i1 = 0; i1 < arr1.length; i1++)
			{
				var seg = arr1[i1];
				segments.closeSegment(pie,seg);
			}
		}

		d3.select(segment).transition()
			.duration(100)
			.each("end", function(d, i) {
				d3.select(this).transition().attr("d", pie.arc.innerRadius(pie.innerRadius).outerRadius(pie.outerRadius+pie.outerRadiusOffset));
				// d3.select(this).attr("d", pie.arc.innerRadius(pie.innerRadius).outerRadius(pie.outerRadius+pie.outerRadiusOffset));
				pie.currentlyOpenSegment = segment;
				pie.isOpeningSegment = false;
				d3.select(this).attr("class", pie.cssPrefix + "expanded");
				testObj.pieSegmentMouseUpHandler(pie);
			});
	},

	openPieSegments: function(pie, segment) {
		testObj.currentSegmentsOpen[pie.element.id].push(segment);

		var arr1 = d3.selectAll("." + pie.cssPrefix + "expanded")[0];
		// close any open segments
		if (!pie.allowMultipleSelection)
		{
			var i1 = 0;
			for(i1 = 0; i1 < arr1.length; i1++)
			{
				var seg = arr1[i1];
				segments.closeSegment(pie,seg);
			}
		}

		d3.select(segment).transition()
			.duration(100)
			.each("end", function(d, i) {
				d3.select(this).transition().attr("d", pie.arc.innerRadius(pie.innerRadius).outerRadius(pie.outerRadius+pie.outerRadiusOffset));
				pie.currentlyOpenSegment = segment;
				d3.select(this).attr("class", pie.cssPrefix + "expanded");
				testObj.pieSegmentMouseUpHandler(pie);
			});
	},

	closeSegment: function(pie, segment, manualTrigger) {
		var currentSegmentsOpenPie = testObj.currentSegmentsOpen[pie.element.id];
		if (currentSegmentsOpenPie) {
			var myArr = [];
			for (var i = 0; i < currentSegmentsOpenPie.length; ++i) {
				if (currentSegmentsOpenPie[i].id != segment.id) {
					myArr.push(currentSegmentsOpenPie[i]);
				}
			}
			testObj.currentSegmentsOpen[pie.element.id] = myArr;
		}

		d3.select(segment).transition()
			.duration(100)
			.each("end", function(d, i) {
				d3.select(this).transition().attr("d", pie.arc.innerRadius(pie.innerRadius).outerRadius(pie.outerRadius));
				d3.select(this).attr("class", "");
				pie.currentlyOpenSegment = null;
				testObj.pieSegmentMouseUpHandler(pie);
			});

		//var isExpanded = segment.attr("class") === pie.cssPrefix + "expanded";
		segments.onSegmentEventNew(pie, pie.options.callbacks.onCloseSegment, segment, false, manualTrigger);
	},

	closeSegmentNew: function(pie, segment) {

		testObj.currentSegmentsOpen[pie.element.id] = [];

		d3.select(segment).transition()
			.duration(100)
			.each("end", function(d, i) {
				d3.select(this).transition().attr("d", pie.arc.innerRadius(pie.innerRadius).outerRadius(pie.outerRadius));
				d3.select(this).attr("class", "");
				pie.currentlyOpenSegment = null;
				//testObj.pieSegmentMouseUpHandler(pie);
			});

		segments.onSegmentEventNew(pie, pie.options.callbacks.onCloseSegmentNew, undefined, false);
	},

	/**
	 * getCentroid.
	 * @param el
	 * @return x,y
	 */
	getCentroid: function(el) {
		var bbox = el.getBoundingClientRect();
		return {
			x: bbox.x + bbox.width / 2,
			y: bbox.y + bbox.height / 2
		};
	},

	/**
	 * General helper function to return a segment's angle, in various different ways.
	 * @param index
	 * @param opts optional object for fine-tuning exactly what you want.
	 */
	getSegmentAngle: function(index, data, totalSize, opts) {
		var options = extend({
			// if true, this returns the full angle from the origin. Otherwise it returns the single segment angle
			compounded: true,

			// optionally returns the midpoint of the angle instead of the full angle
			midpoint: false
		}, opts);

		var currValue = data[index].value;
		var fullValue;
		if (options.compounded) {
			fullValue = 0;

			// get all values up to and including the specified index
			for (var i=0; i<=index; i++) {
				fullValue += data[i].value;
			}
		}

		if (typeof fullValue === 'undefined') {
			fullValue = currValue;
		}

		// now convert the full value to an angle
		var angle = (fullValue / totalSize) * 360;

		// lastly, if we want the midpoint, factor that sucker in
		if (options.midpoint) {
			var currAngle = (currValue / totalSize) * 360;
			angle -= (currAngle / 2);
		}

		return angle;
	},

	/**
	 * getPercentage .
	 * @param pie
	 * @param index
	 * @param decimalPlaces
	 * @return percentage value
	 * Get percentage corresponding to the value
	 */
	getPercentage: function(pie, index, decimalPlaces) {
		var relativeAmount = pie.options.data.content[index].value / pie.totalSize;
		if (decimalPlaces <= 0) {
			return Math.round(relativeAmount * 100);
		} else {
			return (relativeAmount * 100).toFixed(decimalPlaces);
		}
	}

};
