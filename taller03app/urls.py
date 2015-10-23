from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^sentimental_tweets$', views.load_sentiment_computed_tweets, name='load_sentiment_computed_tweets'),
    url(r'^list_candidates$', views.list_candidates, name='list_candidates'),
    url(r'^followers_stats$', views.load_followers_stats, name='load_followers_stats'),
    url(r'^get_followers_stats$', views.list_followers_stats, name='list_followers_stats'),
    url(r'^get_trending_topics$', views.list_trending_topics_tags, name='list_trending_topics_tags'),
]