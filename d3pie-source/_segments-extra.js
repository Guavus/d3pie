// --------- segments-extra.js -----------
var testObj = {
    //@satish: this function allow user to selecting multiple segment or single.
    pieObject:d3pie,
//    pieSegmentMouseDownHandler: function(event,pie)
//    {
//        this.pieObject = pie;
//        if (event.metaKey || event.ctrlKey)
//        {
//            pie.allowMultipleSelection = isMultipleSelectionAllowed;
//        }
//        else
//        {
//            pie.allowMultipleSelection = false;
//        }
//    },

    /**
     * all the segments open even if we request them in the middle of an event after click callback
     * */
    currentSegmentsOpen: {},

    /**
     * pieSegmentClickHandler
     * @param event
     * @param g
     * @param pie
     * this function actually open/close the segment while clicking on it and make it selected or de-selected
     */
    pieSegmentClickHandler: function(event,g,pie)

    {

        if(event.label === "Others" || (event.__data__ !== undefined && event.__data__.label === "Others"))
        {
            return;
        }
        var currentEl;

        currentEl = d3.select(g);

        var segment;

        // mouseover works on both the segments AND the segment labels, hence the following
        if(currentEl.attr("class") === pie.cssPrefix + "arc")
        {
            segment = currentEl.select("path");
        }
        else if (currentEl.attr("class").indexOf("legendRow") > -1) {
            index = currentEl.attr("data-index");
            segment = d3.select("#" + pie.cssPrefix + "segment" + index);
            pie.isOpeningSegment = false;
        }
        else
        {
            var index = currentEl.attr("data-index");
            if(!index)
            {
                var selectedLegend = d3.select(g);
                var indexValue = selectedLegend.attr("index_value");
                if(indexValue !== null)
                    index = indexValue.split(/-/)[1];
                else
                    index = currentIndex;
            }

            segment = d3.select("#" + pie.cssPrefix + "segment" + index);
        }

        var isExpanded = segment.attr("class") === pie.cssPrefix + "expanded";

        segments.onSegmentEvent(pie, pie.options.callbacks.onClickSegment, segment, isExpanded);

        var arr = pie.getAllOpenSegments()[0];

        var isMatchedSegment = false;

        var ctrlOrMetaD3 = d3.event && (d3.event.metaKey || d3.event.ctrlKey);
        var ctrlOrMeta = event && (event.metaKey || event.ctrlKey);

        if(ctrlOrMetaD3)
        {
            if (isExpanded)  {
                segments.closeSegment(pie, segment.node());
            } else {
                segments.openSegment(pie, segment.node());
            }
        }
        else if (ctrlOrMeta)
        {
            if (isExpanded)  {
                segments.closeSegment(pie, segment.node());
            } else {
                segments.openSegment(pie, segment.node());
            }
        }
        else
        {
            var i;
            if(arr.length > 1)
            {
                for (i = 0 ; i < arr.length ; i++)
                {
                    if(arr[i] === segment.node())
                    {
                        isMatchedSegment = true;
                    }
                    else
                    {
                        segments.closeSegment(pie, arr[i]);
                    }
                }

                if(isMatchedSegment === false)
                    segments.openSegment(pie, segment.node());
            }
            else
            {
                if(arr.length > 0)
                {
                    for (i = 0 ; i < arr.length ; i++)
                    {
                        segments.closeSegment(pie, arr[i]);
                    }
                }

                if (isExpanded)  {
                    segments.closeSegment(pie, segment.node());
                } else {
                    segments.openSegment(pie, segment.node());
                }
            }
        }

        segments.onSegmentEvent(pie, pie.options.callbacks.onClickSegmentAfter, segment, isExpanded, ctrlOrMetaD3);
    },

    /**
     * pieSegmentMouseUpHandler
     * @param pie
     * this function updates center label depending on the selection of pie segments
     */
    pieSegmentMouseUpHandler: function(pie)
    {
        var arr = pie.getAllOpenSegments()[0];
        var isAllSelected = true;
        var labelStr = [];
        var total = 0;

        for(var i = 0; i < arr.length; i++)
        {
            isAllSelected = false;
            var obj = arr[i];
            labelStr.push(obj.__data__.label);
            total = total+obj.__data__.value;
        }

        if (!pie.options.header.customTitleUpdate.enabled)
        {
            if(isAllSelected)
            {
                pie.updateProp("header.title.text", pie.defaultHeaderVal); //@bipin: reset the value to default header title
                pie.updateProp("header.subtitle.text",pie.totalSize);
            }
            else
            {
                pie.updateProp("header.title.text",labelStr.toString());
                pie.updateProp("header.subtitle.text",total);
            }
        }
    }
};

function getTruncatedString(str,charLen)
{
    var tStr = str;
    var strLen  = tStr.length;
    var txt;
    if(strLen>charLen)
    {
        txt =   tStr.substring(0, charLen) + "...";
    }
    else
    {
        txt = tStr;
    }
    return txt;
}
