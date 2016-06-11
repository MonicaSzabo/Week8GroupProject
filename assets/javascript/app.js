$(document).ready(function() {
    var LatLong = [];

    function searchByCity() {
        //var queryCity = $('#city-input').val().trim();
        var queryURL = "http://api.eventful.com/json/events/search?app_key=crQBBZznzX5Sn2R4&location=Austin";

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
            	LatLong.push({
            		lat: events[i].latitude,
            		lng:  events[i].longitude});


           		$('.display').append("<h3><a href=" + events[i].venue_url +" target='_blank'>" + events[i].title + "</a></h3>" +
					"<br>" + events[i].venue_address + "<br>" + events[i].city_name + ", " + events[i].region_abbr +
					"<br>" + moment(events[i].start_time).format('MMMM Do YYYY, h:mm:ss A') + "<br><br>");

           	}

            console.log(events);
        });

    }

    searchByCity();

//==================================== map feature ========================================

  function initMap() {
    var mapDiv = document.getElementById('map');
    var map = new google.maps.Map(mapDiv, {
      center: {lat: 30.503, lng: -97.689},
      zoom: 8
    });
  }



});