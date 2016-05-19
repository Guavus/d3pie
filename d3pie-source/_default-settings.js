// --------- _default-settings.js -----------/**
/**
 * Contains the out-the-box settings for the script. Any of these settings that aren't explicitly overridden for the
 * d3pie instance will inherit from these. This is also included on the main website for use in the generation script.
 */
var defaultSettings = {
	header: {
		title: {
			text:     "",
			color:    "#25373e",
			fontSize: 24,
			font:     "AllerLight"
		},
		subtitle: {
			text:     "",
			color:    "#25373e",
			fontSize: 16,
			font:     "AllerLight"
		},
		location: "pie-center",
		titleSubtitlePadding: 15,
		customTitleUpdate: {
			enabled: false,
			titleKey: ''
		}
	},
	footer: {
		text: 	  "",
		color:    "#666666",
		fontSize: 14,
		font:     "AllerLight",
		location: "left"
	},
	size: {
		canvasHeight: 350,
		canvasWidth: 350,
		pieInnerRadius: "98",
		pieOuterRadiusOffset:15,
		pieOuterRadius: null
	},
	data: {
		sortOrder: "none",
		allowMultipleSelection:null,
		ignoreSmallSegments: {
			enabled: false,
			valueType: "percentage",
			value: null
		},
		smallSegmentGrouping: {
			enabled: false,
			value: 1,
			valueType: "percentage",
			label: "Other",
			color: "#cccccc"
		},
		content: []
	},
	labels: {
		outer: {
			format: "label",
			hideWhenLessThanPercentage: 101,
			pieDistance: 0
		},
		inner: {
			format: "percentage",
			hideWhenLessThanPercentage: 101
		},
		mainLabel: {
			color: "#333333",
			font: "AllerLight",
			fontSize: 10
		},
		percentage: {
			color: "#dddddd",
			font: "AllerLight",
			fontSize: 10,
			decimalPlaces: 0
		},
		value: {
			color: "#cccc44",
			font: "AllerLight",
			fontSize: 10
		},
		lines: {
			enabled: false,
			style: "curved",
			color: "segment"
		},
		truncation: {
			enabled: false,
			truncateLength: 30
		},
		formatter: null
	},
	effects: {
		load: {
			effect: "default",
			speed: 1000
		},
		pullOutSegmentOnClick: {
			effect: "bounce",
			speed: 300,
			size: 10
		},
		highlightSegmentOnMouseover: true,
		highlightLuminosity: -0.2
	},
	tooltips: {
		customPositioning: false,
		enabled: true,
		renderer: null,
		type: "placeholder", // caption|placeholder
		string: "{label}: {value}",
		placeholderParser: null,
		styles: {
			wordWrapLength: 30,
			fadeInSpeed: 250,
			padding: 8
		}
	},
	misc: {
		colors: {
			background: null,
			segments:["#c0e31f", "#95d600", "#55e06a", "#00956d", "#35bdb2", "#0090a6", "#4ea3e2", "#96c0e6", "#1557bf", "#3d27a1","#999999"],
			segmentStroke: "#ffffff"
		},
		gradient: {
			enabled: false,
			percentage: 95,
			color: "#000000"
		},
		canvasPadding: {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		},
		pieCenterOffset: {
			x: 0,
			y: 0
		},
		cssPrefix: null
	},
	callbacks: {
		onload: null,
		onMouseoverSegment: null,
		onMouseoutSegment: null,
		onCloseSegment:null,
		onCloseSegmentNew:null,
		onCloseAllSegments: null,
		onClickSegment: null
	}
};
