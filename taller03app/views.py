from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from pymongo import MongoClient 

from bson.json_util import dumps

# Create your views here.

def index(request):
	context= {}

	client = MongoClient('localhost', 27017)
	tweets_db = client['tweets']
	
	cities= tweets_db.cities.find();
	cities_list=[]
	for c in cities: 
		cities_list.append(c)
	context['cities']= cities_list
	return render(request, 'taller03app/index.html', context)

@csrf_exempt
def load_sentiment_computed_tweets(request):
	city_id= int(request.POST.get('city_id', '1000'))
	candidate_id= int(request.POST.get('candidate_id', '1000'))
	count= int(request.POST.get('last_tweets', '1000'))
	filter_p= {}
	if not city_id==0:
		filter_p['city_id']=city_id
	if not candidate_id==0:
		filter_p['candidate_id']=candidate_id
	client = MongoClient('localhost', 27017)
	tweets_db = client['tweets']
	computed_tweets= tweets_db.computed_tweets.find(filter_p).sort([('_id', -1)]).limit(count);
	tws=[]
	for c_t in computed_tweets:
		tweet = tweets_db.tweets.find_one({'_id': c_t['tweet_id']});
		c_t['text']= tweet['text']
 		c_t['created_at']=tweet['created_at']
		tws.append(c_t)
	response = HttpResponse(dumps(tws))
	response['content_type'] = 'application/json; charset=utf-8'
	return response


@csrf_exempt
def list_candidates(request):
	city_id= int(request.POST.get('city_id', '1'))
	client = MongoClient('localhost', 27017)
	tweets_db = client['tweets']
	candidates= tweets_db.candidates.find({'city_id': city_id})
	candidates_list=[]
	for c in candidates:
		candidates_list.append(c)
	response = HttpResponse(dumps(candidates_list))
	response['content_type'] = 'application/json; charset=utf-8'
	return response