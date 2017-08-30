# -*- coding: utf-8 -*-
import pysb
import os, time, csv
from datetime import datetime


sb = pysb.SbSession()
# Get a private item.  Need to log in first.
sb.login('jsherba@usgs.gov', 'CamelliaBloom0601@')
time.sleep(2)
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
        #time.sleep(2)
        print "Successfully attached file:", photo
        
        print "\n"

    print "All files were processed successfully."

def deleteChildItems(photo_parent_id):
    photo_items_ids = sb.get_child_ids(photo_parent_id)
    sb.delete_items(photo_items_ids)
    print("all child items deleted")

def populateItems(path_to_csv, photo_parent_id):

    #create a dictionary {photoname: photo attributes} from csv of metadata
    metadata_dic = {}
    with open(path_to_csv, 'rb') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            metadata_dic[row['File Name']]=row

    #get ids of all photo items
    photo_items_ids = sb.get_child_ids(photo_parent_id)

    #for each photo item update metadata with data from metadata_dic
    for photo_id in photo_items_ids:
        photo_item = sb.get_item(photo_id)

        #extract file name from item
        file_name = ''
        for file in photo_item['files']:
            if file['contentType'] == 'image/jpeg':
                file_name = file['name']
        print("Updating item metadata for photo "+file_name)
        print "\n"
        #set item 'title' json       
        title = metadata_dic[file_name]["Title (SB item name)"]
        photo_item['title'] = title
        
        #set item 'body' json   
        body = metadata_dic[file_name]["Summary"]
        photo_item['body'] = body

        #set item 'dates' json 
        dates = []
        aquisition_date_extract =  metadata_dic[file_name]["Acquisition Date"]
        #aquisition_date_split = aquisition_date_extract.split("/")
        #aquisition_date_reformat = aquisition_date_split[2]+"-"+aquisition_date_split[0]+"-"+aquisition_date_split[1]
        aquisition_date = {'type': 'Aquisition', 'dateString': aquisition_date_extract, 'label': 'Aquisition Date'}
        dates.append(aquisition_date)

        publication_date_extract = metadata_dic[file_name]["Publication date"]
        publication_date = {'type': 'Publication', 'dateString': publication_date_extract, 'label': 'Publication Date'}
        dates.append(publication_date)
        photo_item['dates'] = dates

        #set item 'tags' json 
        tags = []
        geology_tab = {"type":"Geology", "name":metadata_dic[file_name]["Geology (tag)"]}
        tags.append(geology_tab)
        region_tag = {"type":"Region", "name":metadata_dic[file_name]["Region (tag)"]}
        tags.append(region_tag)
        place_tags = metadata_dic[file_name]["Place (tags)"]
        for tag in place_tags.split(","):
            place_tag = {"type":"Place", "name":tag}
            tags.append(place_tag)
        theme_tag = {"type":"Theme", "name":metadata_dic[file_name]["Theme (tag)"]}
        tags.append(theme_tag)
        photo_item['tags'] = tags

        #set item 'rights' json 
        rights = metadata_dic[file_name]['Rights']
        photo_item['rights'] = rights

        #set item 'contacts' json 
        contacts = []
        
        origin = metadata_dic[file_name]["Origin"]
        contact_origin = {'name': origin,'type': "Origin", "oldPartyId": 63686,}
        contacts.append(contact_origin)
        
        point_of_contact = metadata_dic[file_name]["Point of contact"]
        contact_point_of_contact = {'name': point_of_contact,'type': "Point of Contact", "oldPartyId": 63686,}
        contacts.append(contact_point_of_contact)
        
        metadata_contact = metadata_dic[file_name]["Metadata contact"]
        contact_metadata_contact = {'name': metadata_contact,'type': "Metadata contact", "oldPartyId": 63686,}
        contacts.append(contact_metadata_contact)

        publisher_contact = metadata_dic[file_name]["Publisher"]
        contact_publisher_contact = {'name': publisher_contact,'type': "Publisher", "oldPartyId": 63686,}
        contacts.append(contact_publisher_contact)

        distributor_contact = metadata_dic[file_name]["Distributor"]
        contact_distributor_contact = {'name': distributor_contact,'type': "Distributor", "oldPartyId": 63686,}
        contacts.append(contact_distributor_contact)

        photo_item['contacts'] = contacts

        #set item 'web link' json 
        doi_link = metadata_dic[file_name]["Onlink"]
        doi_link_item = {
        "type":"Citation",
        "typeLabel": "Citation",
        "uri":"https://test/"+doi_link,
        "rel":"related",
        "title":"DOI"
        }
        photo_item['webLinks'] = [doi_link_item]

        sb.update_item(photo_item)

    print "All items were updated successfully."

def addItemExtents(path_to_csv, photo_parent_id):
    #create a dictionary {photoname: photo attributes} from csv of metadata
    metadata_dic = {}
    with open(path_to_csv, 'rb') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            metadata_dic[row['File Name']]=row

    #get ids of all photo items
    photo_items_ids = sb.get_child_ids(photo_parent_id)
    
    #for each photo item update metadata with data from metadata_dic
    for photo_id in photo_items_ids:
        time.sleep(1)
        photo_item = sb.get_item(photo_id)

        #extract file name from item
        file_name = ''
        for file in photo_item['files']:
            if file['contentType'] == 'image/jpeg':
                file_name = file['name']
        print("Updating item extent for photo "+file_name)
        print "\n"
        #Add point from bounding box
        print(metadata_dic[file_name]["Title (SB item name)"])
        point = [float(metadata_dic[file_name]["WestBC"]),float(metadata_dic[file_name]["NorthBC"])]
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
        
    print "All item extents updated successfully."   


photo_dir = r"/media/sf_lucas_models/Eastern/Eastern"
photo_parent_id = "59a5e8b9e4b0fd9b77cd0884"
path_to_csv = r"/home/jsherba-pr/Projects/photo_app/helpers/EasternGrandCanyon_photometadata.csv"

#photos = listPhotos(photo_dir)
#createItems(photos, photo_parent_id)
#populateItems(path_to_csv, photo_parent_id)  
addItemExtents(path_to_csv, photo_parent_id) 
#deleteChildItems(photo_parent_id)