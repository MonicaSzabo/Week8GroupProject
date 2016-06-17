$(document).ready(function() {
    var mapData = [];
    var fb = new Firebase("https://events04.firebaseio.com/");
    var cities = [];

    $('#key').html("<img src='http://maps.google.com/mapfiles/ms/icons/green-dot.png'> = Today" +
     "<img src='http://maps.google.com/mapfiles/ms/icons/blue-dot.png'> = Next 2 Weeks" +
     "<img src='http://maps.google.com/mapfiles/ms/icons/red-dot.png'> = After 2 Weeks");

    function searchByCity() {
    	$('#new-city').on('submit', function(){
	        var queryCity = $('#city-input').val().trim().toLowerCase();
	        var queryURL = "http://api.eventful.com/json/events/search?app_key=crQBBZznzX5Sn2R4&location=" + queryCity;

            isDuplicate();
            cities.push(queryCity);

            fb.set({
                cities: cities
            });

	        mapData = [];
	        $('#display').empty();

	        $.ajax({
	            url: queryURL,
	            method: "GET",
	            dataType: 'jsonp',
	            data: {
	                format: "jsonp",
	                apikey: 'crQBBZznzX5Sn2R4',
	            }
	        }).done(function(response){
                if(response.total_items > 0){
                    var events = response.events.event;
                    var description = "";

    	            for(var i = 0; i < events.length; i++) {
                        //Calculates how many days until the event
                        var daysDiff = moment(events[i].start_time).diff(moment(), "days");

                        //Only will show days in the future, won't show past events or Testing Event, a false event in the API
                        if(daysDiff > -1 && events[i].title !== "Testing Event") {

                            mapData.push({
                                name: events[i].title,
                                url: events[i].venue_url,
                                lat: events[i].latitude,
                                lng:  events[i].longitude,
                                daysAway: daysDiff
                            });


                            $('#display').append("<a href=" + events[i].venue_url +" class='eventLink' data-url=" +
                                events[i].venue_url + " target='_blank'>" + events[i].title + "</a>" +
                                "<br>" + events[i].venue_address + "<br>" + events[i].city_name + ", " + events[i].region_abbr +
                                "<br>" + moment(events[i].start_time).format('MMMM Do YYYY, h:mm A') + "<br><br>");
                        }
    	           	}

    	            console.log(mapData);
                    mapStuff(mapData);
                }
                else {
                    $('#display').append("Sorry! There are no events found for this request!");
                }
	        });

	        return false;
	    });
    }

    function isDuplicate() {
        for(i = 0; i < cities.length; i++){
            for(k = 0; k < cities.length; k++){
                if(i !== k) {
                    if (cities[i] == cities[k]){
                        cities.splice(k, 1);
                        console.log(cities);
                    }
                }
            }
        }
        console.log(cities);
    }

    fb.once('value', function(snapshot){ 
        console.log(snapshot.val().cities);
        cities = snapshot.val().cities;
    });

    $(function() {
        $("#city-input").autocomplete({
            source: cities
        });
    });

    searchByCity();

    //==================================== map feature ========================================

    var map;
    var bounds = new google.maps.LatLngBounds();
    var markersArray = [];
    // map placeholder centered on Austin
    (function () {
        var mapDiv = document.getElementById('map');
        map = new google.maps.Map(mapDiv, {
        center: {lat: 50.294797, lng: -97.739589},
        zoom: 10
        });
    })();

    function mapStuff(mapData) {
        //just incase there are markers already on the map
        //clear markers
        clearMarkers(markersArray);
        // Display multiple markers on a map
        var infoWindow = new google.maps.InfoWindow(), marker, i;

        // Loop through our array of markers & place each one on the map
        for( i = 0; i < mapData.length; i++ ) {
            //trap for missing lat or lng
            if (mapData[i].lat === null || mapData[i].lng === null) {
                console.log("mapData[i].lat = "+mapData[i].lat + " mapData[i].lng = " + mapData[i].lng + " i = "+i)
            }
            else{
                            var position = new google.maps.LatLng(mapData[i].lat, mapData[i].lng);
            bounds.extend(position);
            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: mapData[i].name
            });
            markersArray.push(marker);
            // Allow each marker to have an info window
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    //infoWindow.setContent(infoWindowContent[i][0]);
                    infoWindow.setContent('<div class="info_content">' +
                                        '<h3>' + mapData[i].name+'</h3>' +
                                        '<p>' + mapData[i].name+'</p>' +
                                        '<p><a href="'+mapData[i].url+'" target="_blank">Click to open Event URL in new tab</a></p>'+
                                        '</div>');
                    marker.addListener('click', function() {
                        infoWindow.open(map, marker);
                    });
                }
            })(marker, i));
            //add code to change the color desired
            if(mapData[i].daysAway === 0){
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
            }
            else if(mapData[i].daysAway>0 && mapData.daysAway<14){
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png')
            }
            else{
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
            }
            // Automatically center the map fitting all markers on the screen
            map.fitBounds(bounds);
            }
        }
    };
    function clearMarkers(markersArray){
        //passed an array with the gogle maps marker objects saved when the markers are created
        for (var i = 0; i < markersArray.length; i++) {
            markersArray[i].setMap(null);
        }
        markersArray = [];
        bounds = new google.maps.LatLngBounds();
    }

});

