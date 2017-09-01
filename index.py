# -*- coding: utf-8 -*-
import pysb
import os, time
from datetime import datetime
from flask import Flask, url_for, render_template, jsonify, request, json
app = Flask(__name__)

photo_parent_id = "59a5e8b9e4b0fd9b77cd0884"
project_parent_id = "597e9378e4b0a38ca2774a30"
user_instructions_parent_id ="599f85f7e4b038630d00ff7c"
about_photos_parent_id = "599f8ae6e4b038630d00ff8b"
max_projects = "500"
sb = pysb.SbSession()
# Get a private item.  Need to log in first.


#username = raw_input("Username:  ")
#sb.loginc(str(username))


@app.route('/')	
def home():
    #query parent item for dataset metadata
    project_item = sb.get_item(project_parent_id)
   
    title = project_item['title']	
    
    user_instructions_item = sb.get_item(user_instructions_parent_id)
    user_instructions = user_instructions_item['body']
    
    about_photos_item = sb.get_item(about_photos_parent_id)
    about_photos = about_photos_item['body']
    
    #query all items to list dates, regions, geology
    all_items = sb.find_items({
    'parentId': photo_parent_id,
    'fields': ['tags, dates']
    })
   
    regions = []
    geology = []
    dates = []
    for item in all_items['items']:
        try:
            for date in item['dates']:
                if date['type']=='Aquisition':
                   
                    dates.append(date['dateString'])
                
            for tag in item['tags']:
               
                if tag['type']=='Region':
                    regions.append(tag['name'])
                
                if tag['type']=='Geology':
                    geology.append(tag['name'])
                
        except KeyError:
            continue
                
    regions=sorted(list(set(regions)))
    geology=sorted(list(set(geology)))
    dates = list(set(dates))
    
    date_min = min(dates)
    date_max = max(dates)
    
    return render_template('index.html', regions=regions, geology=geology, date_min=date_min, date_max=date_max, title=title, user_instructions=user_instructions, about_photos=about_photos)

@app.route('/allPhotos', methods=['POST'])
def allPhotos():
    items = sb.find_items({
    'parentId': photo_parent_id,
    'fields':['title, summary, files, previewImage, tags, spatial, dates'],
    'max': "500"
    })
    
    return jsonify(items);

@app.route('/searchPhotos', methods=['POST'])
def searchPhotos():
    geo =  request.form['geo'];
    reg = request.form['reg'];
    start_date = request.form['startdate']
    end_date = request.form['enddate']
    string_query = request.form['stringquery']

    
    filter_params = []
    if geo != "all":
        geo_param = 'tags='+geo
        filter_params.append(geo_param)
        
    if reg != "all":    
        reg_param = 'tags='+reg
        filter_params.append(reg_param)
        
    date_range = 'dateRange={"start":'+start_date+',"end":'+end_date+',"dateType":"Aquisition"}'
    filter_params.append(date_range)
    
    
    items = sb.find_items({
        'parentId': photo_parent_id,
        'q': string_query,
        'filter': filter_params,
        #'lq': '(tags.name'+reg+') AND tags.name(+'+geo+'))', # AND tags.name(+water)) OR tags.name(+WY)',
        'max': "500",
        'fields':['title, summary, files, previewImage, tags, spatial, dates']
    })
    return jsonify(items);



