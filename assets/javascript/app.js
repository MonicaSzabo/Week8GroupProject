$(document).ready(function() {
    var mapData = [];   //Holds the data for the map from the Eventful API
    var fb = new Firebase("https://events04.firebaseio.com/");
    var cities = [];    //Holds the cities that people have searched and found

    //Sets the Key div to show the user what the different markers mean
    $('#key').html("<img src='http://maps.google.com/mapfiles/ms/icons/green-dot.png'> = This Week" +
     "<img src='http://maps.google.com/mapfiles/ms/icons/blue-dot.png'> = Next 4 Weeks" +
     "<img src='http://maps.google.com/mapfiles/ms/icons/red-dot.png'> = After 4 Weeks");

    //The function that will pull up the cities
    function searchByCity() {
    	$('#new-city').on('submit', function(){
	        var queryCity = $('#city-input').val().trim().toLowerCase();
	        var queryURL = "http://api.eventful.com/json/events/search?app_key=crQBBZznzX5Sn2R4&location=" + queryCity;

            //If the city has not been searched before, it adds it to the database and the array cities
            if(cities.indexOf(queryCity) == -1) {
                cities.push(queryCity);

                fb.set({
                    cities: cities
                });
            }

            //Clears the data from previous searches
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
                //Will only work if there are results in the JSON
                if(response.total_items > 0){
                    //Holds the events array from the Eventful JSON
                    var events = response.events.event;

    	            for(var i = 0; i < events.length; i++) {
                        //Calculates how many days until the event
                        var daysDiff = moment(events[i].start_time).diff(moment(), "days");

                        //Only will show days in the future, won't show past events or Testing Event, a false event in the API
                        if(daysDiff > -1 && events[i].title !== "Testing Event") {

                            //Adds the data to the mapData array for later use by the map
                            mapData.push({
                                name: events[i].title,
                                url: events[i].venue_url,
                                lat: events[i].latitude,
                                lng:  events[i].longitude,
                                daysAway: daysDiff
                            });

                            //Shows the different events on the page
                            $('#display').append("<a href=" + events[i].venue_url +" class='eventLink' data-url=" +
                                events[i].venue_url + " target='_blank'>" + events[i].title + "</a>" +
                                "<br>" + events[i].venue_address + "<br>" + events[i].city_name + ", " + events[i].region_abbr +
                                "<br>" + moment(events[i].start_time).format('MMMM Do YYYY, h:mm A') + "<br><br>");
                        }
    	           	}

                    //Calls mapStuff with the mapData array
                    mapStuff(mapData);
                }
                //If there are no events at that city
                else {
                    $('#display').append("Sorry! There are no events found for this request!");

                    //It will remove the city from cities and reset the database to get rid of search
                    cities.pop(); 

                    fb.set({
                        cities: cities
                    });
                }
	        });
            //Need for the form submission so it stays on the page
	        return false;
	    });
    }

    //Using jQuery UI, it will pull up the cities from our database as possible choices for the user
    function autoComplete() {
        var availableTags = cities;

        $("#city-input").autocomplete({
            source: availableTags
        }); 
    }

    //Sets cities to be equal to the database of cities for persistant data
    fb.once('value', function(snapshot){ 
        cities = snapshot.val().cities;

        //Calls autoComplete after setting cities to equal the database
        autoComplete();
    });

    //The function for the strobeLight effect
    function strobeLight() {
        var colorChange = document.getElementById("colorBox");

        var color = ["red","OrangeRed","Tomato","orange", "yellow", "greenYellow", "yellowGreen",
        "green","seaGreen","blue","blueViolet","violet","mediumVioletRed", "pink"];

        counter = 0;
        colorChange.style.background = "red";

        colorChange.style.transition = "background 1s";


        function changeColorBackground() {
            counter++;
            if(counter === color.length-1){
                counter = 0;
            }
            
            colorChange.style.background = color[counter];
        }

        var colorToChange = setInterval(changeColorBackground, 2000);
    }

    //Calls searchByCity and strobeLight on load
    searchByCity();
    strobeLight();

    //==================================== map feature ========================================

    var map;
    var bounds = new google.maps.LatLngBounds();
    var markersArray = [];
    // map placeholder centered on Austin
    (function () {
        var mapDiv = document.getElementById('map');
        map = new google.maps.Map(mapDiv, {
        center: {lat: 30.294797, lng: -97.739589},
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
                                            '<p><a href="'+mapData[i].url+'" target="_blank">' + mapData[i].name + '</a></p>'+
                                            '</div>');
                        marker.addListener('click', function() {
                            infoWindow.open(map, marker);
                        });
                    }
                })(marker, i));

                //add code to change the color desired
                if(mapData[i].daysAway>=0 && mapData[i].daysAway<7){
                    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
                }
                else if(mapData[i].daysAway>6 && mapData[i].daysAway<28){
                    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png')
                }
                else{
                    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
                }
                // Automatically center the map fitting all markers on the screen
                map.fitBounds(bounds);
            }
        }
    }

    function clearMarkers(markersArray){
        //passed an array with the gogle maps marker objects saved when the markers are created
        for (var i = 0; i < markersArray.length; i++) {
            markersArray[i].setMap(null);
        }
        markersArray = [];
        bounds = new google.maps.LatLngBounds();
    }

});

