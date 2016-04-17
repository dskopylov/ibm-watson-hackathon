# -*- coding: utf-8 -*-
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseNotFound, HttpResponseForbidden
import requests
import urllib2
import json
from getTraining import *
import subprocess


def encodeUserData(user, password):
    return "Basic " + (user + ":" + password).encode("base64").rstrip()

# Главная страница сайта
@csrf_exempt
def index(request):

    if request.method == 'POST':
        text = request.POST.get('data')
        r = requests.post('http://node-red-bluemix-starter-sytyuk-1215.eu-gb.mybluemix.net/tn', data={'text':text})
        response_dict = json.loads(r.text)
        print response_dict
        print getTraining(response_dict)
        return HttpResponse(getTraining(response_dict))

    return HttpResponse(status_code=404)
