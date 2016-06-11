$(document).ready(function() {
    var LatLong = [];

    function searchByCity() {
        var queryCity = $('#city-input').val().trim();
        var queryURL = "http://api.eventful.com/json/events/search?app_key=crQBBZznzX5Sn2R4&location=" + queryCity;

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
                if(events[i].description === null) {
                    description = "There is no description available";
                }
                else {
                    description = events[i].description;
                }

                $(".temp").append(events[i].title + "<br>Longitude: " + events[i].longitude +
                    "<br>Latitude: " + events[i].latitude + "<br>Description: " + events[i].description + "<br>===========<br>");
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