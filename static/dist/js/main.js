function load_tweets_on_sentiment_tab(){
	qty = $("#quantity").val();
	city_id = $("#city").val();
	candidate_id = $("#candidate").val();

	$.ajax({
	    type: "POST",
	    url: "sentimental_tweets",
	    data: { 
	    	city_id: city_id,
	    	candidate_id: candidate_id,
	    	last_tweets: qty
	    },
	    dataType: "json",
	    timeout:  5 * 60 * 1000, // in milliseconds
	    success: function (tweets_data) {
	    	draw_tweets(tweets_data);
	    },
	    error: function (request, status, err) {
	    }
	});
}


$(document).ready( function() {
	initGUI();
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