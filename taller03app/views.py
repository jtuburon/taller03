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
	response = HttpResponse(dumps(computed_tweets))
	response['content_type'] = 'application/json; charset=utf-8'
	return response


