from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from pymongo import MongoClient 

from bson.json_util import dumps

# Create your views here.

def index(request):
	context= {}
	return render(request, 'taller03app/index.html', context)

@csrf_exempt
def load_sentiment_computed_tweets(request):
	count= int(request.POST.get('last_tweets', '1000'))
	client = MongoClient('localhost', 27017)
	tweets_db = client['tweets']
	computed_tweets= tweets_db.computed_tweets.find({}).sort([('_id', -1)]).limit(count);
	tws=[]
	for c_t in computed_tweets:
		tweet = tweets_db.tweets.find_one({'_id': c_t['tweet_id']});
		c_t['text']= tweet['text']
 		c_t['created_at']=tweet['created_at']
		tws.append(c_t)
	response = HttpResponse(dumps(tws))
	response['content_type'] = 'application/json; charset=utf-8'
	return response


