$(document).ready(function() {

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
	
    var map = L.map('map', {
        center: [39.8282, -98.5795],
        zoom: 5,
		minZoom: 3,
        maxBounds: maxBounds,
        defaultExtentControl: true,
		layers: [Esri_WorldImagery]
    }).fitBounds(maxBounds);
	 
	map.spin(true)
	
    function attributes1() {
        return $.ajax({
            url: "../static/js/photo_attributes_final1.js",
            async: true,
			dataType: "script",
            success: function(data1) {
			data1
			}
        });
    }
	
	function attributes2() {
        return $.ajax({
            url: "../static/js/photo_attributes_final1.js",
            async: true,
			dataType: "script",
            success: function(data2) {
			data2
			}
        });
    }
	

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
		
    var baseMaps = {
        "Streets": OpenStreetMap_Mapnik,
        "Imagery": Esri_WorldImagery,
		"USGS Imagery": USGSImageryLayer
    };
	
    //Define overlay layers (nlcd and ecoregions)
    var nlcdLandCover = L.tileLayer.wms(
        'http://raster.nationalmap.gov/arcgis/services/LandCover/USGS_EROS_LandCover_NLCD/MapServer/WMSServer', {
            layers: '24',
            format: 'image/png',
            transparent: true
        });
		
    
	//Ecoregion colors
    colors = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3",
        "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd",
        "#ccebc5", "#ffed6f", "#8dd3c7", "#ffffb3", "#bebada",
        "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5",
        "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f", "#8dd3c7",
        "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",
        "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5",
        "#ffed6f", "#8dd3c7", "#ffffb3", "#bebada", "#fb8072",
        "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9",
        "#bc80bd", "#ccebc5", "#ffed6f", "#8dd3c7", "#ffffb3",
        "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69",
        "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f",
        "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3",
        "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd",
        "#ccebc5", "#ffed6f", "#8dd3c7", "#ffffb3", "#bebada",
        "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5",
        "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"
    ]
	
    var ecoregions = null
	
	//Ecoregion hover, highlight, zoom
    var info = L.control({
        position: 'bottomright'
    });
	
    info.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
	
    info.update = function(props) {
        this._div.innerHTML = '<h4>Ecoregion:<\/h4>' + (props ?
            '<b>' + props.NAME + '<\/b>' :
            'Hover over an ecoregion');
    };

    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
        info.update(layer.feature.properties);
    }
    var ecoregions;

    function resetHighlight(e) {
        ecoregions.resetStyle(e.target);
        info.update();
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
	
	//Get ecoregions_83.geojson
    function ajax1() {
        return $.ajax({
            url: '../static/json/ecoregions_83.geojson',
            async: true,
            dataType: 'json',
            success: function(eco) {
                ecoregions = L.geoJson(eco, {
                    style: function(feature) {
                        return {
                            fillColor: colors[
                                feature
                                .properties
                                .ECO],
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: 0.7
                        };
                    },
                    onEachFeature: onEachFeature
                })
            }
        });
    }

    function onEachFeatureblocks(feature, layer) {
        layer.on({
            click: zoomToFeature
        });
    }
	
	//Get sampleblocks.geojson
    function ajax2() {
        return $.ajax({
            url: '../static/json/sampleblocks.geojson',
            async: true,
            dataType: 'json',
            success: function(eco) {
                blocks = L.geoJson(eco, {
                    style: function(feature) {
                        return {
                            weight: 1,
                            opacity: 1,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: 0.7
                        };
                    },
                    onEachFeature: onEachFeatureblocks
                })
            }
        });
    }
	
	//When ecoregions and sampleblocks retrieved
    $.when(ajax1(), ajax2()).done(function(a1) {
		//Define overlay maps
		
        var overlayMaps = {
            "Ecoregions": ecoregions,
            "NLCD 2011": nlcdLandCover,
            "Sample Blocks": blocks
        };
		
        //Add basemaps and overlay layers to map
        L.control.layers(baseMaps, overlayMaps).addTo(map);
        $('[data-toggle="popover"]').popover({
            placement: 'top'
        });
    });
	
	
	//Define photo cluster       
    var photoLayer = L.photo.cluster({
        maxClusterRadius: 60,
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
	
	
	//Prepare photo attributes for clustering
	 $.when(attributes1(), attributes2()).done(function(a1) {
    allphotos = null
	
	
   
    var photos = [];
	
    for (var i = 0; i < photo_attributes1.length; i++) {
        var photo = photo_attributes1[i];
        phototag = photo_attributes1[i][5].split(",")
		date = photo_attributes1[i][4].toString().split(".")
		econum = photo_attributes1[i][0].split("_")[0]
        photos.push({
            lat: parseFloat(photo_attributes1[i][2]),
            lng: parseFloat(photo_attributes1[i][3]),
            url: "https://landcovertrends.usgs.gov/landcovertrendsphotos/" + econum + "/" +
                photo_attributes1[i][0] + ".jpg",
            caption: "<strong>" + "State: " + "<\/strong>" +
                phototag[0] + "<br>" + "<strong>" +
                "Ecoregions (I-III): " + "<\/strong>" +
                phototag.slice(1, 4) + "<br>" + "<strong>" +
                "Date taken: " + "<\/strong>" +
                date[1] + "/" + date[0] + "<br>" + "<strong>" +
                "Tags: " + "<\/strong>" + phototag.slice(4),
            thumbnail: "https://landcovertrends.usgs.gov/landcovertrendsphotos/thumbnails/JPEG/" +
                photo_attributes1[i][0] + ".jpg"
        });
    };
	
	for (var i = 0; i < photo_attributes2.length; i++) {
        var photo = photo_attributes2[i];
        phototag = photo_attributes2[i][5].split(",")
		date = photo_attributes2[i][4].toString().split(".")
		econum = photo_attributes2[i][0].split("_")[0]
        photos.push({
            lat: parseFloat(photo_attributes2[i][2]),
            lng: parseFloat(photo_attributes2[i][3]),
            url: "https://landcovertrends.usgs.gov/landcovertrendsphotos/" + econum + "/" +
                photo_attributes2[i][0] + ".jpg",
            caption: "<strong>" + "State: " + "<\/strong>" +
                phototag[0] + "<br>" + "<strong>" +
                "Ecoregions (I-III): " + "<\/strong>" +
                phototag.slice(1, 4) + "<br>" + "<strong>" +
                "Date taken: " + "<\/strong>" +
                date[1] + "/" + date[0] + "<br>" + "<strong>" +
                "Tags: " + "<\/strong>" + phototag.slice(4),
            thumbnail: "https://landcovertrends.usgs.gov/landcovertrendsphotos/thumbnails/JPEG/" +
                photo_attributes2[i][0] + ".jpg"
        });
    }; 
	
    allphotos = photos
    //Add photos to cluster, add cluster to map
	
    photoLayer.add(photos).addTo(map);
	
    //Fit map to bounds
    map.fitBounds(photoLayer.getBounds());
    map.spin(false);
	});
    //Define photo search function
    function search() {
				
            //Get search parameters
            var startdate = $("#startdate").val().split("/");
            var enddate = $("#enddate").val().split("/");
            var taginput = $("#taginput").val()
            var selected = $('.selectpicker option:selected').val();
            startdate = parseFloat(startdate[0] / 100) + parseInt(
                startdate[1])
            enddate = parseFloat(enddate[0] / 100) + parseInt(enddate[1])
            
			var photos = [];
             //Filter photos
            var tags = photo_attributes1.filter(function(v) {
                return (v[5].search(new RegExp(taginput, "i")) !=
                    -1) && (selected === 'all' || v[1] ==
                    selected) && (startdate === 2000 || v[4] >=
                    startdate) && (enddate === 2019 || v[4] <=
                    enddate)
            })
            data3 = tags 
			
			var tags2 = photo_attributes2.filter(function(v) {
                return (v[5].search(new RegExp(taginput, "i")) !=
                    -1) && (selected === 'all' || v[1] ==
                    selected) && (startdate === 2000 || v[4] >=
                    startdate) && (enddate === 2019 || v[4] <=
                    enddate)
            })
			
            data4 = tags2
            
            for (var i = 0; i < data3.length; i++) {
                var photo = data3[i];
                phototag = data3[i][5].split(",")
				date = data3[i][4].toString().split(".")
				econum = data3[i][0].split("_")[0]
                photos.push({
                    lat: parseFloat(data3[i][2]),
                    lng: parseFloat(data3[i][3]),
                    url: "https://landcovertrends.usgs.gov/landcovertrendsphotos/" + econum + "/" +
                        data3[i][0] + ".jpg",
                    caption: "<strong>" + "State: " +
                        "<\/strong>" + phototag[0] + "<br>" +
                        "<strong>" + "Ecoregions (I-III): " +
                        "<\/strong>" + phototag.slice(1, 4) +
                        "<br>" + "<strong>" +
                "Date taken: " + "<\/strong>" +
                date[1] + "/" + date[0] + "<br>" + "<strong>" + "Tags: " +
                        "<\/strong>" + phototag.slice(4),
                    thumbnail: "https://landcovertrends.usgs.gov/landcovertrendsphotos/thumbnails/JPEG/" +
                        data3[i][0] + ".jpg"
                });
            };
			
			for (var i = 0; i < data4.length; i++) {
                var photo = data4[i];
                phototag = data4[i][5].split(",")
				date = data4[i][4].toString().split(".")
				econum = data4[i][0].split("_")[0]
                photos.push({
                    lat: parseFloat(data4[i][2]),
                    lng: parseFloat(data4[i][3]),
                    url: "https://landcovertrends.usgs.gov/landcovertrendsphotos/" + econum + "/" +
                        data4[i][0] + ".jpg",
                    caption: "<strong>" + "State: " +
                        "<\/strong>" + phototag[0] + "<br>" +
                        "<strong>" + "Ecoregions (I-III): " +
                        "<\/strong>" + phototag.slice(1, 4) +
                        "<br>" + "<strong>" +
                "Date taken: " + "<\/strong>" +
                date[1] + "/" + date[0] + "<br>" +"<strong>" + "Tags: " +
                        "<\/strong>" + phototag.slice(4),
                    thumbnail: "https://landcovertrends.usgs.gov/landcovertrendsphotos/thumbnails/JPEG/" +
                        data4[i][0] + ".jpg"
                });
            };
			//Clear photo layer
            photoLayer.clear();
            if (photos.length >= 1) {
			    //Add new photos to cluster, add cluster to map
                photoLayer.add(photos).addTo(map);
                map.fitBounds(photoLayer.getBounds());
				map.spin(false);
            } else {
				//altert "no photos found" if filter returns no photos
                alert("No photos found")
				map.spin(false);
            }
			
        }
    
	//Define reset function//
    var resetval = false

    function reset() {
            
            photoLayer.clear();
            photoLayer.add(allphotos).addTo(map);
            map.fitBounds(photoLayer.getBounds());
            map.spin(false)
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
    $(function() {
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
        })
		
     //onclick reset button, reset photos and search bar
    $('#resetsearch').on('click', function(e) {
			map.spin(true)
		setTimeout(function(){
 
            resetval = true;
            reset();
			$('#startdate').datepicker('update', "01/1999");
			$('#enddate').datepicker('update', "12/2009");
            //$('#startdate').val('01/1999');
          //  $("#enddate").val("12/2007")
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
        saveAs(content, "LandCoverTrendsImages.zip");
        map.spin(false);
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
    $('.downloadphotos').on('click', function(e) {
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
        })
     //Initialize date picker
    $('.picker').datepicker({
        format: "mm/yyyy",
        startDate: "01/1999",
        endDate: "12/2009",
        minViewMode: 1
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
});  