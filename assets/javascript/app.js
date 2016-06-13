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
	        });

	        return false;
	    });
    }
    searchByCity();

//==================================== map feature ========================================

//=============== dummy data needed from event API==================================

    // Multiple Markers
    // array for market placement and hover data
    //'hover data (string)', lat #, lng #
    var markers = [
        ['event 1 name', 30.243241, -97.782064],
        ['event 2 name', 30.24907, -97.75032],
        ['event 3 name', 30.2498122, -97.7527743],
        ['event 4 name', 30.2671123, -97.7528579]
    ];


    // Info Window Content
    var infoWindowContent = [
        ['<div class="info_content">' +
        '<h3>Broken Spoke</h3>' +
        '<p>Live music & boot-scootin , plus beer & chicken-fried steak since 1964</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Home Slice</h3>' +
        '<p>Thin-crust slices & pies for dining in or carry out, open late for takeaway on weekends.</p>' +'</div>'],
        ['<div class="info_content">' +
        '<h3>Gourdoughs Big. Fat. Donuts.</h3>' +
        '<p>Ironic names & unique toppings on fried-dough treats served until late-night from a vintage trailer.</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Sullivans Steakhouse</h3>' +
        '<p>Steakhouse chain serving beef, seafood & cocktails in swanky surrounds with live music.</p>' + '</div>']
    ];
//end dummy data ================================================================

    var map;
    var bounds = new google.maps.LatLngBounds();

    // map placeholder centered on Austin
    (function () {
        var mapDiv = document.getElementById('map');
        map = new google.maps.Map(mapDiv, {
        center: {lat: 30.294797, lng: -97.739589},
        //dummy test data to prove the move on marker works
        //comment this in and the map starts in London
        //center: {lat: 51.503454, lng: -0.119562},
        //end dummy city data
        zoom: 10
        });
    })();

    // button to trigger adding the markers and moving to the area that the markers are from
    $('.testButton').on('click', function(){
mapStuff();
})


function mapStuff() {

    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;

    // Loop through our array of markers & place each one on the map
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0]
        });

        // Allow each marker to have an info window
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(infoWindowContent[i][0]);
                infoWindow.open(map, marker);
            }
        })(marker, i));

        // Automatically center the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(14); // if markers are too spread out this might cause some of them to not be visable on the map
        google.maps.event.removeListener(boundsListener);
    });

    };


});