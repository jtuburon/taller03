var timeout= 5 * 60 * 1000;

function run_queries(){
	qty = $("#quantity").val();
	city_id = $("#city").val();
	candidate_id = $("#candidate").val();

	$.ajax({
	    type: "POST",
	    url: "sentimental_tweets",
	    data: { 
	    	city_id: city_id,
	    	candidate_id: candidate_id,
	    	qty: qty
	    },
	    dataType: "json",
	    timeout: timeout, // in milliseconds
	    success: function (tweets_data) {
	    	draw_tweets(tweets_data);
	    },
	    error: function (request, status, err) {
	    }
	});

	$.ajax({
	    type: "POST",
	    url: "get_followers_stats",
	    data: { 
	    	city_id: city_id,
	    	candidate_id: candidate_id,
	    	qty: qty
	    },
	    dataType: "json",
	    timeout:  timeout, // in milliseconds
	    success: function (tweets_data) {
	    	draw_folllowers_plot(tweets_data)
	    },
	    error: function (request, status, err) {
	    }
	});

	$.ajax({
	    type: "POST",
	    url: "get_trending_topics",
	    data: { 
	    	city_id: city_id,
	    	candidate_id: candidate_id,
	    	qty: qty
	    },
	    dataType: "json",
	    timeout:  timeout, // in milliseconds
	    success: function (tags_data) {
	    	initTagsCloud(tags_data)
	    },
	    error: function (request, status, err) {
	    }
	});
	

	$.ajax({
	    type: "POST",
	    url: "list_geo_tweets",
	    data: { 
	    	city_id: city_id,
	    	candidate_id: candidate_id,
	    	qty: qty
	    },
	    dataType: "json",
	    timeout:  timeout, // in milliseconds
	    success: function (geoData) {
			draw_tweets_layer(geoData);
	    },
	    error: function (request, status, err) {
	    }
	});
}

function draw_folllowers_plot(data){
	$("#chart").html('');
	$("#timeline").html('');
	$("#preview").html('');
	$("#legend").html('');

	var palette = new Rickshaw.Color.Palette( { scheme: 'classic9' } );
	for (var i = 0; i < data.length; i++) {
		data[i].color= palette.color();
	}

	var graph = new Rickshaw.Graph( {
		element: document.getElementById("chart"),
		width: 750,
		height: 500,
		renderer: 'area',
		stroke: true,
		preserve: true,
		series: data
	} );

	graph.render();

	var preview = new Rickshaw.Graph.RangeSlider( {
		graph: graph,
		element: document.getElementById('preview'),
	} );

	var hoverDetail = new Rickshaw.Graph.HoverDetail( {
		graph: graph,
		xFormatter: function(x) {
			return new Date(x * 1000).toString();
		}
	} );

	var annotator = new Rickshaw.Graph.Annotate( {
		graph: graph,
		element: document.getElementById('timeline')
	} );

	var legend = new Rickshaw.Graph.Legend( {
		graph: graph,
		element: document.getElementById('legend')

	} );

	var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
		graph: graph,
		legend: legend
	} );

	var order = new Rickshaw.Graph.Behavior.Series.Order( {
		graph: graph,
		legend: legend
	} );

	var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
		graph: graph,
		legend: legend
	} );

	var smoother = new Rickshaw.Graph.Smoother( {
		graph: graph,
		element: document.querySelector('#smoother')
	} );

	var ticksTreatment = 'glow';

	var xAxis = new Rickshaw.Graph.Axis.Time( {
		graph: graph
	} );

	xAxis.render();

	var yAxis = new Rickshaw.Graph.Axis.Y( {
		graph: graph,
		tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
		ticksTreatment: ticksTreatment
	} );

	yAxis.render();


	var controls = new RenderControls( {
		element: document.querySelector('#side_panel'),
		graph: graph
	} );

	// add some data every so often

	var messages = [
		"Changed home page welcome message",
		"Minified JS and CSS",
		"Changed button color from blue to green",
		"Refactored SQL query to use indexed columns",
		"Added additional logging for debugging",
		"Fixed typo",
		"Rewrite conditional logic for clarity",
		"Added documentation for new methods"
	];

	addAnnotation(true);

	var previewXAxis = new Rickshaw.Graph.Axis.Time({
		graph: preview.previews[0],
		timeFixture: new Rickshaw.Fixtures.Time.Local(),
		ticksTreatment: ticksTreatment
	});

	previewXAxis.render();

	function addAnnotation(force) {
		if (messages.length > 0 && (force || Math.random() >= 0.95)) {
			annotator.add(data[2][data[2].length-1].x, messages.shift());
			annotator.update();
		}
	}
	
}


function initTagsCloud(tags_data){
	var fill = d3.scale.category20();
	var data = tags_data.map(function(d) {
		return d;
	});
	d3.layout.cloud().size([500, 500])

	.words(data)
	.rotate(function() { return ~~(Math.random() * 2) * 90; })
	.font("Impact")
	.fontSize(function(d) { return d.size; })
	.on("end", draw)
	.start();

	function draw(words) {
		$("#cloud-div").html('')
		d3.select("#cloud-div").append("svg")
		.attr("width", "700")
		.attr("height", "500")
		.append("g")
		.attr("transform", "translate(350,250)")
		.selectAll("text")
		.data(words)
		.enter().append("text")
		.style("font-size", function(d) { return d.size + "px"; })
		.style("font-family", "Impact")
		.style("fill", function(d, i) { return fill(i); })
		.attr("text-anchor", "middle")
		.attr("transform", function(d) {
			return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
		})
		.text(function(d) { return d.text; });
	}
}

var map = 0;
function initMap(){
	map = L.map('tweets_map').setView([4.60062, -74.12528], 13);
	var googleLayer = new L.Google('ROADMAP');
    map.addLayer(googleLayer);    
}



function draw_tweets_layer(geoData){

	var markers = L.markerClusterGroup();
	function onEachFeature(feature, layer) {
		var popupContent = "<span><b>" + feature.user_screen_name+ "</b><br>"
		popupContent += "<p>" + feature.text+ "</p>"
		popupContent += "<b>" + feature.created_at+ "</b></span>"
		layer.bindPopup(popupContent, {maxWidth:800});
	}

	var layer = L.geoJson(geoData, 
	{
		onEachFeature: onEachFeature
	});

	markers.addLayer(layer);
	map.addLayer(markers);

	
	
}

$(document).ready( function() {
	initGUI();
	initMap();

	$( "#city").change(function() {
		city_id= $( this ).val();
		$.ajax({
			type: "POST",
			url: "list_candidates",
			data: { city_id: city_id},
			dataType: "json",
			timeout:  5 * 60 * 1000, // in milliseconds
			success: function (candidates_data){
				$("#candidate").empty()
				$('#candidate').append(new Option("Todos", 0));
				if(candidates_data.length>0){
					for (i=0; i< candidates_data.length; i++) {
						c= candidates_data[i];
						$('#candidate').append(new Option(c.name,c.candidate_id) );
					};
					$("#candidate").prop('disabled', false);
				}
			},
			error: function (request, status, err) {
			}
		});
	});
});