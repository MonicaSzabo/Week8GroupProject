$(document).ready(function() {
    var mapData = [];

    function searchByCity() {
    	$('#new-city').on('submit', function(){
	        var queryCity = $('#city-input').val().trim();
	        var queryURL = "http://api.eventful.com/json/events/search?app_key=crQBBZznzX5Sn2R4&location=" + queryCity;
	        console.log(queryURL);


	        $.ajax({
	            url: queryURL,
	            method: "GET",
	            dataType: 'jsonp',
	            data: {
	                format: "jsonp",
	                apikey: 'crQBBZznzX5Sn2R4',
	            }
	        }).done(function(response){
	            var events = response.events.event;
	            var description = "";

	            for(var i = 0; i < events.length; i++) {
	            	mapData.push({
	            		name: events[i].title,
	            		lat: events[i].latitude,
	            		lng:  events[i].longitude});


	           		$('#display').append("<h3><a href=" + events[i].venue_url +" target='_blank'>" + events[i].title + "</a></h3>" +
						"<br>" + events[i].venue_address + "<br>" + events[i].city_name + ", " + events[i].region_abbr +
						"<br>" + moment(events[i].start_time).format('MMMM Do YYYY, h:mm:ss A') + "<br><br>");

	           	}

	            console.log(mapData);
                mapStuff(mapData);
	        });

	        return false;
	    });
    }


//==================================== map feature ========================================

//=============== dummy data needed from event API==================================

//dummy eventURL string
var urlString = "http://austin.eventful.com/venues/lake-austin-marina-/V0-001-009303062-2?utm_source=apis&utm_medium=apim&utm_campaign=apic"
//end dummy data ================================================================

    var map;
    var bounds = new google.maps.LatLngBounds();

    // map placeholder centered on Austin
    (function () {
        var mapDiv = document.getElementById('map');
        map = new google.maps.Map(mapDiv, {
        center: {lat: 30.294797, lng: -97.739589},
        zoom: 10
        });
    })();

function mapStuff(mapData) {

    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;

    // Loop through our array of markers & place each one on the map
    for( i = 0; i < mapData.length; i++ ) {
        var position = new google.maps.LatLng(mapData[i].lat, mapData[i].lng);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: mapData[i].name
        });

        // Allow each marker to have an info window
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                //infoWindow.setContent(infoWindowContent[i][0]);
                infoWindow.setContent('<div class="info_content">' +
                                        '<h3>' + mapData[i].name+'</h3>' +
                                        '<p>' + mapData[i].name+'</p>' +
                                        '<p><a href="'+urlString+'" target="_blank">Click to open Event URL in new tab</a></p>'+
                                      '</div>');
                 marker.addListener('click', function() {
    infoWindow.open(map, marker);
  });
            }
        })(marker, i));

 //marker.addListener('click', function() {
 //   infowindow.open(map, marker);
//  });
marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
        // Automatically center the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        //this.setZoom(14); // if markers are too spread out this might cause some of them to not be visable on the map
        google.maps.event.removeListener(boundsListener);
    });

    };

searchByCity();
});

//})