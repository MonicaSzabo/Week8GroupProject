$(document).ready(function() {

	var queryCity = "Austin";

	var queryURL = "https://api.eventful.com/json/events/search?app_key=crQBBZznzX5Sn2R4&location=" + queryCity;

	console.log(queryCity);

	$.ajax({url: queryURL, method: 'GET'}).done(function(response) {
		console.log(response);

	});

});