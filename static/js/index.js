 $(document).ready(function() {
    $("#sidebar").toggleClass("collapsed");
    $("#content").toggleClass("col-md-12 col-md-9");
  
  var sbData = 0
    //Set max bounds and define map
  var maxBounds = [
        [8, -144.2], //Southwest
        [59, -39.1] //Northeast
    ];
	var Esri_WorldImagery = L.tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
    
    //Initialize leaflet map
    window.map = L.map('map', {
      //  center: [39.8282, -98.5795],
      //  zoom: 5,
    	//minZoom: 3,
       // maxBounds: maxBounds,
        defaultExtentControl: true,
		layers: [Esri_WorldImagery]
    })//.fitBounds(maxBounds);
	 
	map.spin(true)
    
	//Define basemaps, add world imagery base map to map 
    var OpenStreetMap_Mapnik = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 3,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap<\/a>'
        });
	var USGSImageryLayer = L.tileLayer.wms(
        'http://basemap.nationalmap.gov/arcgis/services/USGSImageryOnly/MapServer/WMSServer', {
           layers: '0',
            format: 'image/png',
            transparent: true,
			attribution: "USGS, TNM, Imagery Only"
        });
   /* var geologic_imagery = L.mapbox.tileLayer('rclark.d2f57dc3', {
      accessToken: 'pk.eyJ1IjoicmNsYXJrIiwiYSI6IlQwaklqazAifQ.OWuTG3XPSdvoq_zGL0-1tA',
      attribution: '<a href="http://geomaps.wr.usgs.gov/arizona/">George Billingsley et al.</a> <a href="https://www.mapbox.com/about/maps/">© Mapbox © OpenStreetMap</a> and Ryan Clark, 2014'
    })*/
		
    var baseMaps = {
        "Streets": OpenStreetMap_Mapnik,
        "Imagery": Esri_WorldImagery,
		"USGS Imagery": USGSImageryLayer
        //"Geology":geologic_imagery
    };
	
    //Define overlay layers (nlcd and ecoregions)
    var nlcdLandCover = L.tileLayer.wms(
        'http://raster.nationalmap.gov/arcgis/services/LandCover/USGS_EROS_LandCover_NLCD/MapServer/WMSServer', {
            layers: '24',
            format: 'image/png',
            transparent: true
        });
		

   
		//Define overlay maps
		
        var overlayMaps = {
           
            "NLCD 2011": nlcdLandCover
            
        };
		
        //Add basemaps and overlay layers to map
        var control = L.control.layers(baseMaps, overlayMaps, {collapsed:false})
        control.addTo(map);
        var htmlObject = control.getContainer();

        var a = document.getElementById('basemaps-panel');

        function setParent(el, newParent)
         {
            newParent.appendChild(el);
         }
         setParent(htmlObject, a);

       $('[data-toggle="popover"]').popover({
            placement: 'top'
        });
   
	
	
	//Define photo cluster       
    var photoLayer = L.photo.cluster({
        maxClusterRadius: 45,
        chunkedLoading: true
    }).on('click', function(evt) {
        var photo = evt.layer.photo,
            template =
            '<img src="{url}"/><\/a><p>{caption}<\/p>';
        if (photo.video && (!!document.createElement('video').canPlayType(
            'video/mp4; codecs=avc1.42E01E,mp4a.40.2'))) {
            template =
                '<video autoplay controls poster="{url}"><source src="{video}" type="video/mp4"/><\/video>';
        };
        evt.layer.bindPopup(L.Util.template(template, photo), {
            className: 'leaflet-popup-photo',
            minWidth: 400
        }).openPopup();
    });
	
	// attributes2()
	//Prepare photo attributes for clustering

  function addAllPhotos() {
          
	$.when($.ajax({
    			url: '/allPhotos',
    			data: $('form').serialize(),
    			type: 'POST',
    			success: function(response){
    				
                sbData  = response
    			},
    			error: function(error){
    				console.log(error);
    			}
    		})).done(function(a1) {
        
    allphotos = null
	
	

    var photos = [];
   window.sbDataAll  = sbData.items   
    
   for (var i = 0; i < sbData.items.length; i++) {
        item = sbData.items[i];
       
        photos.push({
            lat: parseFloat(item['spatial']['boundingBox']['minY']),
            lng: parseFloat(item['spatial']['boundingBox']['minX']),
            //url: item['previewImage']['original']['viewUrl'],
            url: item['previewImage']['small']['uri'],
            caption: "<strong>" + "Name: " +
                        "<\/strong>" + item['title'] + 
                        "<br>" + "<strong>" +
                "Date: " + "<\/strong>" +
                 item['dates'][0]['dateString'] + "<br>" + "<strong>" + "Region: " +
                        "<\/strong>" + item['tags'][0]['name'] + "<br>" +
                        "<strong>" + "Description: " +
                        "<\/strong>" + item['summary'] + "<br>" + "<strong>" + "Geology: " +
                        "<\/strong>" + item['tags'][1]['name'] + "<br>" +
						"<button type='button' class='addCart btn btn-success' id="+item['id']+"><i class='fa fa-cart-plus' aria-hidden='true'><\/i><\/button>" +
						"<a href="+item['files'][0]['url']+" class='btn btn-info' role='button'><i class='fa fa-download' aria-hidden='true'><\/i></a>",
            thumbnail: item['previewImage']['thumbnail']['uri']
        });
    };
   
   
	
	
    allphotos = photos
    //Add photos to cluster, add cluster to map
	
    photoLayer.add(photos).addTo(map);
	
    //Fit map to bounds
    map.fitBounds(photoLayer.getBounds(), {padding: [20,20]});
    map.spin(false);
	
	
	
	});
  }
   addAllPhotos()     
    
	window.cartVals = []
	map.on('popupopen', function(e){
		
	 $('.addCart').on('click', function(f) {
		 var obj = sbDataAll.find(o => o.id === f.target.id);
		 
			 if (checkCart(obj)===false){
				 cartVals.push(obj)
				 addToCart(obj)
				 updateCartLabel(cartVals)
			 }
		})
	})
	function checkCart(obj){
		return cartVals.filter(function(e) e.id == obj.id).length > 0;
	}
	
	function removeFromCart(f){
		cartVals = cartVals.filter(function(el) {
			return el.id !== f.currentTarget.id;
		});
		$("."+f.currentTarget.id).remove();
		updateCartLabel()
	}
	$('#emptyCart').on('click', function() {
		removeAll()
	})
	function removeAll(){
		$("#cartDropdown").empty();
		cartVals = []
	}
	function updateCartLabel(){
		var cartDiv = document.getElementById("cartLabel")
		cartDiv.innerHTML = '<i class="fa fa-shopping-cart" aria-hidden="true"></i> Cart ('+cartVals.length+')'
	}
	function addToCart(cartObject){
		
		var cartDiv = document.getElementById("cartDropdown")
		var listItem = document.createElement("li");
		listItem.className = cartObject['id']
		var innerDiv = document.createElement("div");
		innerDiv.className += "thumbnail"
		innerDiv.className += " right-caption"
		innerDiv.className += " span4"
		var img = document.createElement("img");
		img.src = cartObject['previewImage']['small']['uri'];
		img.className += "span2"
		img.className += " cartImg"
		var captionDiv = document.createElement("div");
		captionDiv.className="caption"
		//var thumbLabel = document.createElement("h5");
		//thumbLabel.innerHTML="Thumbnail label"
		var description = document.createElement("p");
		description.innerHTML="<strong>" + "Name: " +
                        "<\/strong>" + cartObject['title'] + 
                        "<br>" + "<strong>" +
                "Date: " + "<\/strong>" +
                 cartObject['dates'][0]['dateString'] + "<br>" + "<strong>" + "Region: " +
                        "<\/strong>" + cartObject['tags'][0]['name'] + "<br>" +
                        "<strong>" + "Description: " +
                        "<\/strong>" + cartObject['summary'] + "<br>" + "<strong>" + "Geology: " +
                        "<\/strong>" + cartObject['tags'][1]['name'] + "<br>" +
						"<button type='button' class='removeCart btn btn-danger' id="+cartObject['id']+"><i class='fa fa-times' aria-hidden='true'><\/i><\/button>" +
						//"<button type='button' class='downloadPhoto btn btn-primary' id="+cartObject['id']+" href="+cartObject['files'][0]['url']+"><i class='fa fa-download' aria-hidden='true'><\/i><\/button>"
						"<a href="+cartObject['files'][0]['url']+" class='btn btn-info' role='button'><i class='fa fa-download' aria-hidden='true'><\/i></a>"
		
		cartDiv.appendChild(listItem)
		listItem.appendChild(innerDiv)
		innerDiv.appendChild(img)
		innerDiv.appendChild(captionDiv)
		//captionDiv.appendChild(thumbLabel)
		captionDiv.appendChild(description)
		
		$('.removeCart').on('click', function(f) {
			removeFromCart(f)
		
		})
		//$('.downloadPhoto').on('click', function(f) {
			//downloadPhoto(f)
		
		//})
		
	}
	function downloadPhoto(f){
		var obj = sbDataAll.find(o => o.id === f.target.id);
		console.log(obj['files'])
		console.log(obj['files'][0]['url'])
	}
	$('#downloadAll').on('click', function() {
		downloadAllPhotos()
	})
	function downloadAllPhotos(){
		allPhotos = []
		//for (i = 0; i < cartVals.length; i++) {
			//allPhotos.push(cartVals[i]['files'][0]['url'])
			//allPhotos.push(cartVals[i]['previewImage']['original']['viewUrl'])
			
		//}
		allPhotos = ["https://www.sciencebase.gov/catalog/file/get/59a5ec99e4b0fd9b77cd0a58?f=__disk__76%2F63%2F61%2F766361d00be6897349abe4e56e78c0eeb0bea2a9"]
		console.log(allPhotos)
		if (allPhotos.length <= 100) {
                downloadAllImages(allPhotos)
            } else {
                alert("100 photo download limit exceeded")
            
            }
	}
    //Define photo search function
    function search() {
				
            //Get search parameters
           var startdate = $("#startdate").val();
           var enddate = $("#enddate").val();
           var stringquery = $("#taginput").val()
           var geo = $('.selectpicker.geo option:selected').val();
           var reg = $('.selectpicker.region option:selected').val();  
       
        	$.when(
                   
              $.ajax({
    			url: '/searchPhotos',
    			data: {startdate:startdate, enddate:enddate, geo: geo, reg: reg, stringquery:stringquery},//('form').serialize(),
    			type: 'POST',
    			success: function(response){
    				
                sbData  = response
    			},
    			error: function(error){
    				console.log(error);
    			}
    		})).done(function(a1) {
        
            allphotos = null
        	
        	
        
            var photos = [];
        	
                     
           for (var i = 0; i < sbData.items.length; i++) {
                var item = sbData.items[i];
               
                photos.push({
                    lat: parseFloat(item['spatial']['boundingBox']['minY']),
                    lng: parseFloat(item['spatial']['boundingBox']['minX']),
                    //url: item['previewImage']['original']['viewUrl'],
					url: item['previewImage']['thumbnail']['uri'],
                    caption: "<strong>" + "Name: " +
                                "<\/strong>" + item['title'] + 
                                "<br>" + "<strong>" +
                        "Date: " + "<\/strong>" +
                         item['dates'][0]['dateString'] + "<br>" + "<strong>" + "Region: " +
                                "<\/strong>" + item['tags'][0]['name'] + "<br>" +
                                "<strong>" + "Description: " +
                                "<\/strong>" + item['summary'] + "<br>" + "<strong>" + "Geology: " +
                                "<\/strong>" + item['tags'][1]['name'] + "<br>" +
								"<button type='button' class='addCart btn btn-success' id="+item['id']+"><i class='fa fa-cart-plus' aria-hidden='true'><\/i><\/button>" +
								"<a href="+item['files'][0]['url']+" class='btn btn-info' role='button'><i class='fa fa-download' aria-hidden='true'><\/i></a>",
                    thumbnail: item['previewImage']['thumbnail']['uri']
					
                });
            };
           
           
        	
        	
            //allphotos = photos
            //Add photos to cluster, add cluster to map
        	
            //Clear photo layer
            photoLayer.clear();
            if (photos.length >= 1) {
			    //Add new photos to cluster, add cluster to map
                photoLayer.add(photos).addTo(map);
				
                map.fitBounds(photoLayer.getBounds(), {padding: [20,20]});
				map.spin(false);
            } else {
				//altert "no photos found" if filter returns no photos
                alert("No photos found")
				map.spin(false);
            }
        	});
           
      
    }
    
	//Define reset function//
    var resetval = false

    function reset() {
            
            photoLayer.clear();
            addAllPhotos()
           // photoLayer.add(allphotos).addTo(map);
            //map.fitBounds(photoLayer.getBounds());
           // map.spin(false)
        }
		
    //Run search function on keyboard "enter"
    $(document).keypress(function(e) {
        if (e.which == 13) {
            map.spin(true)
					setTimeout(function(){
						search()
					}, 20);
        }
    });
	
    //Run search on change for tag search, date change, ecoregion change
    $('.search').on('click', function(e) {
        if (resetval == false) {
			map.spin(true)
					setTimeout(function(){
						search()
					}, 20);
        }
    })
	
	 
	
	

  /*  $(function() {
        $('.selectpicker').on('change', function() {
            if (resetval == false) {
				map.spin(true)
					setTimeout(function(){
						search()
					}, 20);
            }
        });
    });
    $(window).load(function() {
            $("#datepicker").on("changeDate", function(e) {
                if (resetval == false) {
					map.spin(true)
					setTimeout(function(){
						search()
					}, 20);
					
                }
            });
        })*/
		
     //onclick reset button, reset photos and search bar
    $('#resetsearch').on('click', function(e) {
			map.spin(true)
		setTimeout(function(){
 
            resetval = true;
            reset();
			$('#startdate').datepicker('update', date_min);
			$('#enddate').datepicker('update', date_max);
           
            $("#taginput").val("")
            $('.selectpicker').val('all').change();
            resetval = false
			
			}, 20);
        })
    
	//Define photo download functions
    function downloadAllImages(imgLinks) {
        var zip = new JSZip();
        var deferreds = [];
        for (var i = 0; i < imgLinks.length; i++) {
            deferreds.push(addToZip(zip, imgLinks[i], i));
        }
        $.when.apply(window, deferreds).done(generateZip);
    }

    function generateZip(zip) {
        var content = zip.generate({
            type: "blob"
        });
        // see FileSaver.js
        saveAs(content, "sb_photos.zip");
    }

    function addToZip(zip, imgLink, i) {
            var deferred = $.Deferred();
            JSZipUtils.getBinaryContent(imgLink, function(err, data) {
                if (err) {
                    alert(
                        "Problem happened when download img: " +
                        imgLink);
                    console.error(
                        "Problem happened when download img: " +
                        imgLink);
                    deferred.resolve(zip); // ignore this error: just logging
                    // deferred.reject(zip); // or we may fail the download
                } else {
                    var filename = imgLink.split('/').pop();
                    zip.file(filename, data, {
                        binary: true
                    });
                    deferred.resolve(zip);
                }
            });
            return deferred;
        }
     //Download photos onclick
  /*  $('.downloadphotos').on('click', function(e) {
            map.spin(true);
            // Construct an empty list to fill with onscreen markers.
            var inBounds = [],
                // Get the map bounds - the top-left and bottom-right locations.
                bounds = map.getBounds();
            // For each marker, consider whether it is currently visible by comparing
            // with the current map bounds.
            photoLayer.eachLayer(function(marker) {
                if (bounds.contains(marker.getLatLng())) {
                    inBounds.push(marker.options.icon.options
                        .url);
                }
            });
            //Check if less than 100 photos in bounds 
            if (inBounds.length <= 100) {
                downloadAllImages(inBounds)
            } else {
                alert("100 photo download limit exceeded")
                map.spin(false);
            }
        })*/
     
     //Initialize date picker
    $('.picker').datepicker({
        format: "yyyy-mm-dd",
        startDate: date_min,
        endDate: date_max,
        minViewMode: 0
    });
	
	//Month dictionary
    monthdic = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sept",
        10: "Oct",
        11: "Nov",
        12: "Dec"
    };

    //Create legend for NLCD
    var legend = L.control({
        position: 'bottomright'
    });
    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML +=
            '<img id="NLCD_Legend" src="../static/img/NLCD_800.jpg" alt="legend" width="200" height="300">';
        return div;
    };
    // Add NLCD or Ecoregions layer
    map.on('overlayadd', function(eventLayer) {
        
        if (eventLayer.name === 'NLCD 2011') {
            legend.addTo(this);
        } else if (eventLayer.name === 'Ecoregions') {
            info.addTo(this);
        }
    });
	//Remove NLCD or ecoregions layer
    map.on('overlayremove', function(eventLayer) {
        // Switch to the Population legend...
        if (eventLayer.name === "NLCD 2011") {
            this.removeControl(legend);
        } else if (eventLayer.name === 'Ecoregions') {
            this.removeControl(info);
        }
    });

    $(".toggle-sidebar").click(function () {
  
                $("#sidebar").toggleClass("collapsed");
                $("#content").toggleClass("col-md-12 col-md-9");
				 setTimeout(function(){ map.invalidateSize()}, 300);
                //map.invalidateSize(true)
				//map.fitBounds(photoLayer.getBounds());
                return false;
            });
    $('.collapse').collapse()
         
    
});   