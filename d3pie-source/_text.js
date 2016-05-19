// --------- text.js -----------
var text = {
	offscreenCoord: -10000,

	addTitle: function(pie) {
		
		var textWidth = pie.options.size.pieInnerRadius - 2;
		var title = pie.svg.selectAll("." + pie.cssPrefix + "title")
			.data([pie.options.header.title])
			.enter()
			.append("text")
			.text(function(d) { return d.text; })
			.each(function(d) {
				d.width = this.getBoundingClientRect().width;
			})
			.attr({
        id: pie.cssPrefix + "title",
        class: pie.cssPrefix + "title",
        x: text.offscreenCoord,
        y: text.offscreenCoord
      })
			.attr("text-anchor", function() {
				var location;
				if (pie.options.header.location === "top-center" || pie.options.header.location === "pie-center") {
					location = "middle";
				} else {
					location = "left";
				}
				return location;
			})
			.text(function(d) {  if(this.getBoundingClientRect().width > textWidth){return getTruncatedString(d.text,10);} else {return d.text;} }) //added by @Bipin
			.attr("fill", function(d) { return d.color; })
			.style("font-size", function(d) { return d.fontSize + "px"; })
			.style("font-family", function(d) { return d.font; })
			.style("cursor","pointer")
			.style("cursor","hand")
			// @satish: added tooltip on center label.
			.on('mouseover', function(d) {
				var tip = d3.select('#'+pie.element.id+'_tooltip')[0];
				var t1 = tip[0];
				var txtLen = d.text.length;
				t1.innerHTML = d.text;
				t1.style.display= 'block';
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
			})
			.on('mousemove', function(d) {
				var tip = d3.select('#'+pie.element.id+'_tooltip')[0];
				var t1 = tip[0];
				var mouseCoords = d3.mouse(pie.element.parentNode);
				var x, y;
				if (pie.options.tooltips.customPositioning) {
					x = mouseCoords[0] - t1.clientWidth;
					y = mouseCoords[1] + 25;
				}
				else {
					x = d3.event.pageX + 10;
					y = d3.event.pageY - (7 * pie.options.tooltips.styles.padding);
				}
				t1.style.left= x + 'px';
				t1.style.top= y + 'px';
			})
			.on('mouseout', function(d) {
				var tip = d3.select('#'+pie.element.id+'_tooltip')[0];
				var t1 = tip[0];
				var txt = this.__data__;
				t1.innerHTML = txt.label;
				t1.style.display= 'none';
			})
			.on('click', function(d){
				var arr1 = d3.selectAll("." + pie.cssPrefix + "expanded")[0];

				for(var i1 = 0; i1 < arr1.length; i1++)
				{
					//segments.closeSegment(pie,arr1[i1]);
					segments.closeSegmentNew(pie,arr1[i1]);
				}

				segments.onSegmentEventNew(pie, pie.options.callbacks.onCloseSegmentNew, undefined, false);
				segments.onSegmentEventNew(pie, pie.options.callbacks.onCloseAllSegments, undefined, false);
			});
	},

	positionTitle: function(pie) {
		var textComponents = pie.textComponents;
		var headerLocation = pie.options.header.location;
		var canvasPadding = pie.options.misc.canvasPadding;
		var canvasWidth = pie.options.size.canvasWidth;
		var titleSubtitlePadding = pie.options.header.titleSubtitlePadding;

		var x;
		if (headerLocation === "top-left") {
			x = canvasPadding.left;
		} else {
			x = ((canvasWidth - canvasPadding.right) / 2) + canvasPadding.left;
		}

    // add whatever offset has been added by user
    x += pie.options.misc.pieCenterOffset.x;

		var y = canvasPadding.top + textComponents.title.h;

		if (headerLocation === "pie-center") {
			y = pie.pieCenter.y;

			// still not fully correct
			if (textComponents.subtitle.exists) {
				var totalTitleHeight = textComponents.title.h + titleSubtitlePadding + textComponents.subtitle.h;
				y = y - (totalTitleHeight / 2) + textComponents.title.h;
			} else {
				y += (textComponents.title.h / 4);
			}
		}

		pie.svg.select("#" + pie.cssPrefix + "title")
			.attr("x", x)
			.attr("y", y);
	},

	addSubtitle: function(pie) {
		var headerLocation = pie.options.header.location;

		pie.svg.selectAll("." + pie.cssPrefix + "subtitle")
			.data([pie.options.header.subtitle])
			.enter()
			.append("text")
			.attr("cursor","default")
			.text(function(d) { return d.text; })
			.attr("x", text.offscreenCoord)
			.attr("y", text.offscreenCoord)
			.attr("id", pie.cssPrefix + "subtitle")
			.attr("class", pie.cssPrefix + "subtitle")
			.attr("text-anchor", function() {
				var location;
				if (headerLocation === "top-center" || headerLocation === "pie-center") {
					location = "middle";
				} else {
					location = "left";
				}
				return location;
			})
			.attr("fill", function(d) { return d.color; })
			.style("font-size", function(d) { return d.fontSize + "px"; })
			.style("font-family", function(d) { return d.font; })
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
				segments.onSegmentEventNew(pie, pie.options.callbacks.onCloseAllSegments, undefined, false);
			});
	},

	positionSubtitle: function(pie) {
		var canvasPadding = pie.options.misc.canvasPadding;
		var canvasWidth = pie.options.size.canvasWidth;

		var x;
		if (pie.options.header.location === "top-left") {
			x = canvasPadding.left;
		} else {
			x = ((canvasWidth - canvasPadding.right) / 2) + canvasPadding.left;
		}

    // add whatever offset has been added by user
    x += pie.options.misc.pieCenterOffset.x;

		var y = text.getHeaderHeight(pie);
		pie.svg.select("#" + pie.cssPrefix + "subtitle")
			.attr("x", x)
			.attr("y", y);
	},

	addFooter: function(pie) {
		pie.svg.selectAll("." + pie.cssPrefix + "footer")
			.data([pie.options.footer])
			.enter()
			.append("text")
			.text(function(d) { return d.text; })
			.attr("x", text.offscreenCoord)
			.attr("y", text.offscreenCoord)
			.attr("id", pie.cssPrefix + "footer")
			.attr("class", pie.cssPrefix + "footer")
			.attr("text-anchor", function() {
				var location = "left";
				if (pie.options.footer.location === "bottom-center") {
					location = "middle";
				} else if (pie.options.footer.location === "bottom-right") {
					location = "left"; // on purpose. We have to change the x-coord to make it properly right-aligned
				}
				return location;
			})
			.attr("fill", function(d) { return d.color; })
			.style("font-size", function(d) { return d.fontSize + "px"; })
			.style("font-family", function(d) { return d.font; });
	},

	positionFooter: function(pie) {
		var footerLocation = pie.options.footer.location;
		var footerWidth = pie.textComponents.footer.w;
		var canvasWidth = pie.options.size.canvasWidth;
		var canvasHeight = pie.options.size.canvasHeight;
		var canvasPadding = pie.options.misc.canvasPadding;

		var x;
		if (footerLocation === "bottom-left") {
			x = canvasPadding.left;
		} else if (footerLocation === "bottom-right") {
			x = canvasWidth - footerWidth - canvasPadding.right;
		} else {
			x = canvasWidth / 2; // TODO - shouldn't this also take into account padding?
		}

		pie.svg.select("#" + pie.cssPrefix + "footer")
			.attr("x", x)
			.attr("y", canvasHeight - canvasPadding.bottom);
	},

	getHeaderHeight: function(pie) {
		var h;
		if (pie.textComponents.title.exists) {

			// if the subtitle isn't defined, it'll be set to 0
			var totalTitleHeight = pie.textComponents.title.h + pie.options.header.titleSubtitlePadding + pie.textComponents.subtitle.h;
			if (pie.options.header.location === "pie-center") {
				h = pie.pieCenter.y - (totalTitleHeight / 2) + totalTitleHeight;
			} else {
				h = totalTitleHeight + pie.options.misc.canvasPadding.top;
			}
		} else {
			if (pie.options.header.location === "pie-center") {
				var footerPlusPadding = pie.options.misc.canvasPadding.bottom + pie.textComponents.footer.h;
				h = ((pie.options.size.canvasHeight - footerPlusPadding) / 2) + pie.options.misc.canvasPadding.top + (pie.textComponents.subtitle.h / 2);
			} else {
				h = pie.options.misc.canvasPadding.top + pie.textComponents.subtitle.h;
			}
		}
		return h;
	}
};
