from django.conf.urls import url
from app import views

urlpatterns = [
    url(r'^text/$',  views.index, name='index'),
]
