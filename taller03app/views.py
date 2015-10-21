from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from bson.son import SON

from pymongo import MongoClient 

from bson.json_util import dumps
from datetime import datetime

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
 		c_t['user_screen_name']=tweet['user']['screen_name']
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

@csrf_exempt
def load_followers_stats(request):
	client = MongoClient('localhost', 27017)
	tweets_db = client['tweets']
	
	stats_list = []
	data= tweets_db.followers_history.aggregate(
	[
	 {
	   "$group":
	     {
	       "_id": "$history_id",
	       "timestamp": {"$min": "$timestamp" },
	       "stats": { "$addToSet": {"candidate_id": "$candidate_id", "followers_count": "$followers_count"}} 
	     }
	 },
	     {"$sort": SON([("_id", 1)])}
	]);
	candidates={}
	for c in tweets_db.candidates.find():
		candidates[c['candidate_id']]= c['name']

	print candidates
	for d in data:
		obj= {
			"date": d['timestamp']
			#history_id": d['_id']
		}
		for s in d['stats']:
			obj[candidates[s['candidate_id']]]=s['followers_count']
		stats_list.append(obj)
	print stats_list
	response = HttpResponse(dumps(stats_list))
	response['content_type'] = 'application/json; charset=utf-8'
	return response


@csrf_exempt
def list_followers_stats(request):
	epoch = datetime.utcfromtimestamp(0)
	client = MongoClient('localhost', 27017)
	tweets_db = client['tweets']
	stats_list = []

	candidates={}
	for c in tweets_db.candidates.find():
		candidates[c['candidate_id']]= c['account']
		stats = tweets_db.followers_history.find({'candidate_id': c['candidate_id']}).sort([('history_id', 1)])#.limit(300)
		data=[]
		for s in stats:
			timestamp= s['timestamp']
			date_object = datetime.strptime(s['timestamp'], '%Y-%m-%d %H:%M:%S.%f')
			ms= int((date_object - epoch).total_seconds() * 1)+ 5* 3600
			print ms
			obj_d={
				"x": ms,
				"y": s['followers_count']
			}
			data.append(obj_d)

		obj={
			"name": c['account'],
			"data": data
		}
		stats_list.append(obj)
	response = HttpResponse(dumps(stats_list))
	response['content_type'] = 'application/json; charset=utf-8'
	return response	