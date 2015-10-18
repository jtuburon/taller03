function load_tweets_on_sentiment_tab(){
	qty = $("#quantity").val();
	$.ajax({
	    type: "POST",
	    url: "sentimental_tweets",
	    data: { last_tweets: qty},
	    dataType: "json",
	    timeout:  5 * 60 * 1000, // in milliseconds
	    success: function (tweets_data) {
	    	draw_tweets(tweets_data);
	    },
	    error: function (request, status, err) {
	        if (status == "timeout") {
	            $("#filter").prop('disabled', true);
	        }
	    }
	});
}