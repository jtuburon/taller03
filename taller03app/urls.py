from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^sentimental_tweets$', views.load_sentiment_computed_tweets, name='load_sentiment_computed_tweets'),
]