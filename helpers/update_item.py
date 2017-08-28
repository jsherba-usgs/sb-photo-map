# -*- coding: utf-8 -*-
import pysb
import os, time, csv
from datetime import datetime


sb = pysb.SbSession()
# Get a private item.  Need to log in first.
sb.login('jsherba@usgs.gov', 'CamelliaBloom0601@')

def listPhotos(photo_dir):
    # Define the directory we will work from. Obtain a list of files.
    tif_files = []
    for file in os.listdir(photo_dir):
        if file.endswith(".jpg"):
            tif_files.append(os.path.join(photo_dir, file))
    return tif_files


def createItems(photo_paths, photo_parent_id):
    for photo in photo_paths:
        
        x = sb.upload_file_and_create_item(photo_parent_id, photo, scrape_file=False)
        
        print "Successfully attached file:", photo
        
        print "\n"

    print "All files were processed successfully."

def populateItems(path_to_csv):
    point_json = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [125.6, 10.1]
      },
      "properties": {
        "name": "Dinagat Islands"
      }
    }

    #create a dictionary {photoname: photo attributes} from csv of metadata
    metadata_dic = {}
    with open(path_to_csv, 'rb') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            metadata_dic[row['File name']]=row

    #get ids of all photo items
    photo_items_ids = sb.get_child_ids(photo_parent_id)

    #for each photo item update metadata with data from metadata_dic
    for photo_id in photo_items_ids:
        photo_item = sb.get_item(photo_id)

        file_name = ''
        for file in photo_item['files']:
            if file['contentType'] == 'image/jpeg':
                file_name = file['name']


        title = metadata_dic[file_name]["Title"]
        photo_item['title'] = title
        #update date fields
        #date =  photo_item['dates'][0]['dateString']
        #photo_item['dates'] = [{'type': 'Aquisition', 'dateString': date, 'label': 'Aquisition'}]
        body = metadata_dic[file_name]["Description"]
        photo_item['body'] = body

        date =  metadata_dic[file_name]["Date Created"]
        photo_item['dates'] = [{'type': 'Aquisition', 'dateString': date, 'label': 'Aquisition'}]

        tags = []
        geology_tab = {"type":"Geology", "name":metadata_dic[file_name]["Geology"]}
        region_tag = {"type":"Region", "name":metadata_dic[file_name]["Region"]}
        tags.append(geology_tab)
        tags.append(region_tag)
        photo_item['tags'] = tags

        rights = metadata_dic[file_name]['Usage terms']
        photo_item['rights'] = rights

        contacts = []
        photographer = metadata_dic[file_name]["Creator"]
        contact_photographer = {
            #'name': photographer,
            'name': "Jason Sherba",
            'email': "jsherba@usgs.gov",
            
            }
        contacts.append(contact_photographer)
        photo_item['contacts'] = contacts
        #Add point from bounding box
        #point = [photo_item['spatial']['boundingBox']['minX'],photo_item['spatial']['boundingBox']['minY']]
        point = [float(metadata_dic[file_name]["XMP Long"]),float(metadata_dic[file_name]["XMP Lat"])]
        print(point)
        #print(photo_item)
        #photo_item['spatial']["representationalPoint"]=point
        
        point_json = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": point
          },
          "properties": {
            "name": "Dinagat Islands"
          }
        }
        
        sb.add_extent(photo_item['id'], point_json)

        sb.update_item(photo_item)


photo_dir = r"/home/jsherba-pr/Projects/photo_app/helpers/photo_test"
photo_parent_id = "59a48465e4b077f0056734f4"
path_to_csv = r"/home/jsherba-pr/Projects/photo_app/helpers/centralgrandcanyon_photometadata.csv"

#photos = listPhotos(photo_dir)
#createItems(photos, photo_parent_id)
populateItems(path_to_csv)   