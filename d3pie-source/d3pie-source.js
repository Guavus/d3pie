/*!
 * d3pie
 * @author Ben Keen
 * @version 0.1.9
 * @date June 17th, 2015
 * @repo http://github.com/benkeen/d3pie
 */

// UMD pattern from https://github.com/umdjs/umd/blob/master/returnExports.js
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports,
    // like Node
    module.exports = factory();
  } else {
    // browser globals (root is window)
    root.d3pie = factory(root);
  }
}(this, function() {

	var _scriptName = "d3pie";
	var _version = "0.1.6";

	// used to uniquely generate IDs and classes, ensuring no conflict between multiple pies on the same page
	var _uniqueIDCounter = 0;


	// this section includes all helper libs on the d3pie object. They're populated via grunt-template. Note: to keep
	// the syntax highlighting from getting all messed up, I commented out each line. That REQUIRES each of the files
	// to have an empty first line. Crumby, yes, but acceptable.
	//<%=_defaultSettings%>
	//<%=_validate%>
	//<%=_helpers%>
	//<%=_math%>
	//<%=_labels%>
	//<%=_segments%>
	//<%=_segmentsExtra%>
	//<%=_text%>
    //<%=_tooltips%>

	// --------------------------------------------------------------------------------------------

	var isMultipleSelectionAllowed = null;

	/**
	 * PieChart Component.
	 * @constructor
	 * @param {string} element - The id of the div on which PieChart will be created.
	 * @param {object} options - The configuration required to the Pie Chart
	 * @return d3pie
	 */
	var d3pie = function(element, options) {

		// element can be an ID or DOM element
		if(options !== undefined && options.data.content && options.data.content.length > 0)
		{
			this.element = element;

			this.defaultHeaderVal = options.header.title.text;
			isMultipleSelectionAllowed = options.data.allowMultipleSelection;

			if (typeof element === "string") {
				var el = element.replace(/^#/, ""); // replace any jQuery-like ID hash char
				this.element = document.getElementById(el);
			}
			if(this.element.children.length>0)
			{
				this.element.innerHTML = '';
			}
			var allowMultipleSelection;

			var opts = {};
			extend(true, opts, defaultSettings, options);
			this.options = opts;

			// if the user specified a custom CSS element prefix (ID, class), use it
			if (this.options.misc.cssPrefix !== null) {
				this.cssPrefix = this.options.misc.cssPrefix;
			} else {
				this.cssPrefix = "p" + _uniqueIDCounter + "_";
				_uniqueIDCounter++;
			}


			// now run some validation on the user-defined info
			if (!validate.initialCheck(this)) {
				return;
			}

			// add a data-role to the DOM node to let anyone know that it contains a d3pie instance, and the d3pie version
			d3.select(this.element)
				.attr(_scriptName, _version);

			// things that are done once
			this.options.data.content = math.sortPieData(this);
			if (this.options.data.smallSegmentGrouping.enabled) {
				this.options.data.content = helpers.applySmallSegmentGrouping(this.options.data.content, this.options.data.smallSegmentGrouping);
			}
			this.options.colors = helpers.initSegmentColors(this);
			this.totalSize      = math.getTotalPieSize(this.options.data.content);
			this.allowMultipleSelection = this.options.data.allowMultipleSelection; //@Satish: added allowMultipleSelection property for making it single or multiple section.
			this.selectedSegments = []; //Satish: added array for storing selected items.
			_init.call(this);
		}

	};

	/**
	 * recreate PieChart woth new data .
	 * @return {Array} Array containing series data .
	 */

	d3pie.prototype.recreate = function() {
		// now run some validation on the user-defined info
		if (!validate.initialCheck(this)) {
			return;
		}
		this.options.data.content = math.sortPieData(this);
		if (this.options.data.smallSegmentGrouping.enabled) {
			this.options.data.content = helpers.applySmallSegmentGrouping(this.options.data.content, this.options.data.smallSegmentGrouping);
		}
		this.options.colors = helpers.initSegmentColors(this);
		this.totalSize      = math.getTotalPieSize(this.options.data.content);

		_init.call(this);
	};

	/**
	 * redraw .
	 * Called to reset the inner HTML and call init again
	 */
	d3pie.prototype.redraw = function() {
		this.element.innerHTML = "";
		_init.call(this);
	};

	/**
	 * destroy .
	 * Called to destroy the pie instance
	 */

	d3pie.prototype.destroy = function() {
		this.element.innerHTML = ""; // clear out the SVG
		d3.select(this.element).attr(_scriptName, null); // remove the data attr
	};

	/**
	 * Returns all pertinent info about the current open info. Returns null if nothing's open, or if one is, an object of
	 * the following form:
	 * 	{
	 * 	  element: DOM NODE,
	 * 	  index: N,
	 * 	  data: {}
	 * 	}
	 */
	d3pie.prototype.getOpenSegment = function() {
		var segment = this.currentlyOpenSegment;
		if (segment !== null && typeof segment !== "undefined") {
			var index = parseInt(d3.select(segment).attr("data-index"), 10);
			return {
				element: segment,
				index: index,
				data: this.options.data.content[index]
			};
		} else {
			return null;
		}
	};

	/**
	 * segmentClick .
	 * @param event
	 * @param _pieInstance
	 * expose this Item click function for using it from the outside. like for legend item click and pie item interaction.
	 */
	// @Satish: expose this Item click function for using it from the outside. like for legend item click and pie item interaction.
	d3pie.prototype.segmentClick = function (event, _pieInstance)
	{
		testObj.pieSegmentClickHandler(event,event,_pieInstance);
	};

	d3pie.prototype.segmentHtmlClick = function (event, elem, _pieInstance)
	{
		testObj.pieSegmentClickHandler(event, elem, _pieInstance);
	};

	//NOTE: this method is based on dom - dont return the right segments in a middle of an event after click
	/**
	 * getAllOpenSegments .
	 * @returns
	 * expose this function for getting all selected Pie Items. this can be access from the outside.
	 */

	d3pie.prototype.getAllOpenSegments = function() {
		this.selectedSegments = d3.selectAll("." + this.cssPrefix + "expanded");
		return this.selectedSegments;
	};

	/**
	 * getLiveAllOpenSegments .
	 * @returns
	 * getting all selected Pie Items By id even in a middle of an event after click - NOT based on DOM
	 */
	d3pie.prototype.getLiveAllOpenSegmentsById = function(id_) {
		if(!testObj.currentSegmentsOpen[id_])
		{
			return [];
		}
		return testObj.currentSegmentsOpen[id_];
	};

	/**
	 * openSegment .
	 * @param index
	 * open the segment based on index
	 */
	d3pie.prototype.openSegment = function(index) {
		index = parseInt(index, 10);
		if (index < 0 || index > this.options.data.content.length-1) {
			return;
		}
		segments.openSegment(this, d3.select("#" + this.cssPrefix + "segment" + index).node());
	};

	d3pie.prototype.openPieSegments = function(index) {
		index = parseInt(index, 10);
		if (index < 0 || index > this.options.data.content.length-1) {
			return;
		}

		var segment = d3.select("#" + this.cssPrefix + "segment" + index);

		segments.openPieSegments(this, segment.node());

		var isExpanded = segment.attr("class") === this.cssPrefix + "expanded";

		segments.onSegmentEventPieWedgeCalled(this, this.options.callbacks.onClickSegmentAfterPieWedgeCalled,index, segment, isExpanded);
	};


	/**
	 * closeSegment .
	 * @param index
	 * close segment based
	 */
	d3pie.prototype.closeSegment = function(index, manualTrigger) {
		var segment = this.currentlyOpenSegment;
		var index1 = parseInt(index, 10);
		segment = d3.select("#" + this.cssPrefix + "segment" + index1);
		var isExpanded = segment.attr("class") === this.cssPrefix + "expanded";

		if (segment && isExpanded) {
			segments.closeSegment(this, segment.node(), manualTrigger);
		}
	};

	/**
	 * closeAllSegments .
	 * closes all the expanded segments
	 */
	d3pie.prototype.closeAllSegments = function()
	{
		var arr1 = d3.selectAll("." + this.cssPrefix + "expanded")[0];
		var i1 = 0;
		for(i1 = 0; i1 < arr1.length; i1++)
		{
			var seg = arr1[i1];
			segments.closeSegmentNew(this,seg);
		}
	};

	/**
	 * updateProp .
	 * this let's the user dynamically update aspects of the pie chart without causing a complete redraw. It
	 * intelligently re-renders only the part of the pie that the user specifies. Some things cause a repaint, others
	 * just redraw the single element
	 */

	d3pie.prototype.updateProp = function(propKey, value) {
		switch (propKey) {
			case "header.title.text":
				var oldVal = helpers.processObj(this.options, propKey);
				helpers.processObj(this.options, propKey, value);
				var titletext = document.getElementById(this.cssPrefix + "title");  // @Satish
				titletext.textContent=getTruncatedString(value,10);  // @Satish
				//d3.select("#" + this.cssPrefix + "title").html(value);  // @Satish // this line not works with safari and IE.
				if ((oldVal === "" && value !== "") || (oldVal !== "" && value === "")) {
					this.redraw();
				}
				break;

			case "header.subtitle.text":
				var oldValue = helpers.processObj(this.options, propKey);
				helpers.processObj(this.options, propKey, value);
				//d3.select("#" + this.cssPrefix + "subtitle").html(value);  // @Satish // this line not works with safari and IE.
				var subTitletext = document.getElementById(this.cssPrefix + "subtitle");  // @Satish
				if(subTitletext) {
					subTitletext.textContent = this.options.measureLabelFunction ? this.options.measureLabelFunction("value",value) : value; //@Arpit
				}
				if ((oldValue === "" && value !== "") || (oldValue !== "" && value === "")) {
					this.redraw();
				}
				break;

			case "callbacks.onload":
			case "callbacks.onMouseoverSegment":
			case "callbacks.onMouseoutSegment":
			case "callbacks.onClickSegment":
			case "callbacks.onClickSegmentAfter":
			case "onClickSegmentAfterPieWedgeCalled":
			case "callbacks.onCloseSegment":
			case "callbacks.onCloseSegmentNew":
			case "callbacks.onCloseAllSegments":
			case "effects.pullOutSegmentOnClick.effect":
			case "effects.pullOutSegmentOnClick.speed":
			case "effects.pullOutSegmentOnClick.size":
			case "effects.highlightSegmentOnMouseover":
			case "effects.highlightLuminosity":
			case "data.allowMultipleSelection":
				helpers.processObj(this.options, propKey, value);
				break;

			// everything else, attempt to update it & do a repaint
			default:
				helpers.processObj(this.options, propKey, value);

				this.destroy();
				this.recreate();
				break;
		}
	};

	// ------------------------------------------------------------------------------------------------

	/**
	 * _init .
	 * Set up initial svg space
	 * store info about the main text components as part of the d3pie object instance
	 * adds header
	 * adds sub title
	 * adds footer if required
	 */
	var _init = function() {

		// prep-work
		this.svg = helpers.addSVGSpace(this);

		// store info about the main text components as part of the d3pie object instance
		this.textComponents = {
			headerHeight: 0,
			title: {
				exists: this.options.header.title.text !== "",
				h: 0,
				w: 0
			},
			subtitle: {
				exists: this.options.header.subtitle.text !== "",
				h: 0,
				w: 0
			},
			footer: {
				exists: this.options.footer.text !== "",
				h: 0,
				w: 0
			}
		};

		this.outerLabelGroupData = [];

		// add the key text components offscreen (title, subtitle, footer). We need to know their widths/heights for later computation
		if (this.textComponents.title.exists) {
			text.addTitle(this);
		}
		if (this.textComponents.subtitle.exists) {
			text.addSubtitle(this);
		}
		//text.addFooter(this);//@satish no need to add footer as we dont required it.

		// the footer never moves. Put it in place now
		var self = this;
		helpers.whenIdExists(this.cssPrefix + "footer", function() {
			text.positionFooter(self);
			var d3 = helpers.getDimensions(self.cssPrefix + "footer");
			self.textComponents.footer.h = d3.h;
			self.textComponents.footer.w = d3.w;
		});

		// now create the pie chart and position everything accordingly
		var reqEls = [];
		if (this.textComponents.title.exists)    { reqEls.push(this.cssPrefix + "title"); }
		if (this.textComponents.subtitle.exists) { reqEls.push(this.cssPrefix + "subtitle"); }
		if (this.textComponents.footer.exists)   { reqEls.push(this.cssPrefix + "footer"); }

		helpers.whenElementsExist(reqEls, function() {
			if (self.textComponents.title.exists) {
				var d1 = helpers.getDimensions(self.cssPrefix + "title");
				self.textComponents.title.h = d1.h;
				self.textComponents.title.w = d1.w;
			}
			if (self.textComponents.subtitle.exists) {
				var d2 = helpers.getDimensions(self.cssPrefix + "subtitle");
				self.textComponents.subtitle.h = d2.h;
				self.textComponents.subtitle.w = d2.w;
			}
			// now compute the full header height
			if (self.textComponents.title.exists || self.textComponents.subtitle.exists) {
				var headerHeight = 0;
				if (self.textComponents.title.exists) {
					headerHeight += self.textComponents.title.h;
					if (self.textComponents.subtitle.exists) {
						headerHeight += self.options.header.titleSubtitlePadding;
					}
				}
				if (self.textComponents.subtitle.exists) {
					headerHeight += self.textComponents.subtitle.h;
				}
				self.textComponents.headerHeight = headerHeight;
			}

			// at this point, all main text component dimensions have been calculated
			math.computePieRadius(self);

			// this value is used all over the place for placing things and calculating locations. We figure it out ONCE
			// and store it as part of the object
			math.calculatePieCenter(self);

			// position the title and subtitle
			text.positionTitle(self);
			text.positionSubtitle(self);

			// now create the pie chart segments, and gradients if the user desired
			if (self.options.misc.gradient.enabled) {
				segments.addGradients(self);
			}
			segments.create(self); // also creates this.arc
			labels.add(self, "inner", self.options.labels.inner.format);
			labels.add(self, "outer", self.options.labels.outer.format);

			// position the label elements relatively within their individual group (label, percentage, value)
			labels.positionLabelElements(self, "inner", self.options.labels.inner.format);
			labels.positionLabelElements(self, "outer", self.options.labels.outer.format);
			labels.computeOuterLabelCoords(self);

			// this is (and should be) dumb. It just places the outer groups at their calculated, collision-free positions
			labels.positionLabelGroups(self, "outer");

			// we use the label line positions for many other calculations, so ALWAYS compute them
			labels.computeLabelLinePositions(self);

			// only add them if they're actually enabled
			if (self.options.labels.lines.enabled && self.options.labels.outer.format !== "none") {
				labels.addLabelLines(self);
			}

			labels.positionLabelGroups(self, "inner");

			labels.fadeInLabelsAndLines(self);

			/**
			 * add pie tooltip area
			 * position the tooltips
			 */

			if (self.options.tooltips.enabled) {

				var tooltip = d3.select(self.element)
					.append('div')                               //@Satish: added div over the center lable for showing tooltip.
					.attr('class', 'wm-d3pie-tooltip ' + self.element.id+'_'+'tooltip')
					.attr('id', self.element.id+'_'+'tooltip');
				tooltip.append('div')
					.attr('class', 'label');
				// tt.addTooltips(self); // @satish: default tooltip was having overlapping issue. so I am not using it.
			}

			/**
			 * addSegmentEventHandlers .
			 * attached mousedown handler
			 */
      segments.addSegmentEventHandlers(self);

		});
	};

  return d3pie;
}));
