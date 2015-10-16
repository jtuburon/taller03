function load_tweets_on_sentiment_tab(){
	$.ajax({
	    type: "POST",
	    url: "sentimental_tweets",
	    data: { last_tweets: 1000},
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