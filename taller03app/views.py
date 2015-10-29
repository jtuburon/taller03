from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from bson.son import SON

from pymongo import MongoClient 

from bson.json_util import dumps
from datetime import datetime

MONGO_DB_USER= "bigdata7"
MONGO_DB_PASSWD= "bigdata7"

# LOCAL MONGO INSTANCE PARAMS
MONGO_DB_HOST= "127.0.0.1"
MONGO_DB_PORT= 27017
MONGO_DB_NAME= "tweets"

# MONGO's CLUSTER INSTANCE PARAMS
# MONGO_DB_HOST= "172.24.99.96"
# MONGO_DB_PORT= 27017
# MONGO_DB_NAME= "Grupo07"


# Create your views here.

def index(request):
	context= {}

	client = MongoClient(MONGO_DB_HOST, MONGO_DB_PORT)
	tweets_db = client[MONGO_DB_NAME]
	
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
	client = MongoClient(MONGO_DB_HOST, MONGO_DB_PORT)
	tweets_db = client[MONGO_DB_NAME]
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
	client = MongoClient(MONGO_DB_HOST, MONGO_DB_PORT)
	tweets_db = client[MONGO_DB_NAME]
	candidates= tweets_db.candidates.find({'city_id': city_id})
	candidates_list=[]
	for c in candidates:
		candidates_list.append(c)
	response = HttpResponse(dumps(candidates_list))
	response['content_type'] = 'application/json; charset=utf-8'
	return response

@csrf_exempt
def load_followers_stats(request):
	client = MongoClient(MONGO_DB_HOST, MONGO_DB_PORT)
	tweets_db = client[MONGO_DB_NAME]
	
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
	city_id= int(request.POST.get('city_id', '1000'))
	candidate_id= int(request.POST.get('candidate_id', '1000'))
	count= int(request.POST.get('last_tweets', '1000'))

	filter_p= {}
	if not city_id==0:
		filter_p['city_id']=city_id
	if not candidate_id==0:
		filter_p['candidate_id']=candidate_id

	epoch = datetime.utcfromtimestamp(0)
	client = MongoClient(MONGO_DB_HOST, MONGO_DB_PORT)
	tweets_db = client[MONGO_DB_NAME]
	stats_list = []
	candidates={}

	
	for c in tweets_db.candidates.find(filter_p):
		candidates[c['candidate_id']]= c['account']
		stats = tweets_db.followers_history.find({'candidate_id': c['candidate_id']}).sort([('history_id', 1)])
		data=[]
		for s in stats:
			timestamp= s['timestamp']
			date_object = datetime.strptime(s['timestamp'], '%Y-%m-%d %H:%M:%S.%f')
			ms= int((date_object - epoch).total_seconds() * 1)+ 5* 3600
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

@csrf_exempt
def list_trending_topics_tags(request):
	city_id= int(request.POST.get('city_id', '0'))
	candidate_id= int(request.POST.get('candidate_id', '0'))
	count= int(request.POST.get('qty', '1000'))

	filter_p= {}
	if not city_id==0:
		filter_p['city_id']=city_id
	if not candidate_id==0:
		filter_p['candidate_id']=candidate_id

	topics_list=[]
	client = MongoClient(MONGO_DB_HOST, MONGO_DB_PORT)
	tweets_db = client[MONGO_DB_NAME]
	topics = tweets_db.trending_topics.find(filter_p).sort([('qty', -1)]).limit(count)
	for topic in topics:
		tag ={"text": topic['tag'], "size": 10 + topic['qty']/1000}
		topics_list.append(tag)
	response = HttpResponse(dumps(topics_list))
	response['content_type'] = 'application/json; charset=utf-8'
	return response


@csrf_exempt
def list_geo_tweets(request):
	city_id= int(request.POST.get('city_id', '0'))
	candidate_id= int(request.POST.get('candidate_id', '0'))
	count= int(request.POST.get('qty', '1000'))

	filter_p= {"coordinates": {"$not":{"$eq": None}}}
	if not city_id==0:
		filter_p['city_id']=city_id
	if not candidate_id==0:
		filter_p['candidate_id']=candidate_id

	geo_tweets_list=[]
	client = MongoClient(MONGO_DB_HOST, MONGO_DB_PORT)
	tweets_db = client[MONGO_DB_NAME]
	
	tweets = tweets_db.tweets.find(filter_p)#.limit(1)
	
	for t in tweets:
		g_t= t['coordinates']
		g_t['text']= t['text']
 		g_t['created_at']=t['created_at']
 		g_t['user_screen_name']=t['user']['screen_name']
		geo_tweets_list.append(g_t)
	response = HttpResponse(dumps(geo_tweets_list))
	response['content_type'] = 'application/json; charset=utf-8'
	return response
