/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
// Enable the visual refresh
google.maps.visualRefresh = true;
var map;
var markers = {};
var time = Math.round(new Date().getTime() / 1000); 
var photoData = {};
var currentBigPic;
var currentCenterPoint;
var EARTH_RADIUS = 6371000;
var insta_client_id = '35b072784eab4b4db51d8094cfb18127';
var redIcon = 'images/icon-red.png';
var blueIcon = 'images/icon-blue.png';


$(document).ready(function(){
    $('#instagramDisp').hide();
    $('#searchButton').mousedown(function() {
        performSearch();
     });
    $('#resetButton').mousedown(function() {
       reset();
    });
});

function initialize(){
    var mapProp = {
      center:new google.maps.LatLng(40.6594,-73.9704),
      zoom:14,
      mapTypeId:google.maps.MapTypeId.ROADMAP,
      streetViewControl: false

      };
    map = new google.maps.Map(document.getElementById("googleMap")
      ,mapProp);
      
    var input = /** @type {HTMLInputElement} */(document.getElementById('input'));
    var autocomplete = new google.maps.places.Autocomplete(input);
    
    autocomplete.bindTo('bounds', map);
    
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        input.className = '';
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // Inform the user that the place was not found and return.
            input.className = 'notfound';
            return;
        }
        if (place.geometry.viewport) {
            $('#instagramDisp').empty();
            for (var i in markers){
                markers[i].setMap(null);
            }
            $('#instagramDisp').hide();
            $('#bigPicHolder').empty();
            $('#pictureInfo').empty();
            photoData = {};

            map.fitBounds(place.geometry.viewport);
            
        } 
        else {
            $('#instagramDisp').empty();
            for (var i in markers){
                markers[i].setMap(null);
            }
            $('#instagramDisp').hide();
            $('#bigPicHolder').empty();
            $('#pictureInfo').empty();
            photoData = {};
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
    });

}


function reset(){
    $('#instagramDisp').empty();
    for (var i in markers){
        markers[i].setMap(null);
    }
    $('#instagramDisp').hide();
    $('#bigPicHolder').empty();
    $('#pictureInfo').empty();
    photoData = {};
}



function performSearch(){
//    $('#instagramDisp').empty();
//    for (var i in markers){
//        markers[i].setMap(null);
//    } ----- commented out but if we want visual refresh each search bring back in.
    
    var centerLat = map.getCenter().lat();
    var centerLong = map.getCenter().lng();
    currentCenterPoint = new google.maps.LatLng(centerLat, centerLong);
    var radius = calculateMapRadius();
    if(radius > 5000){
        radius = 5000;
    }
    var CLIENT_ID = "35b072784eab4b4db51d8094cfb18127";
    var access_parameter = {client_id:CLIENT_ID};
    var request = "https://api.instagram.com/v1/media/search?callback=?&lat="+centerLat+"&lng="+centerLong+"&distance="+radius+"&client_id="+CLIENT_ID;
    console.log(request);
    $.getJSON(request, access_parameter, performSearchHelper);
    
}

function performSearchHelper(instagram_data){
    if(instagram_data.meta.code === 200){
        $('#instagramDisp').show();
        $('#instagramDisp').html();
        
        var photos = instagram_data.data;
        
        
        if(photos.length > 0){
            for(var i in photos){
                //adding each picture item to photos array with attricabutes attatched to key which is the picture id
                var picture = photos[i];
                if(picture.id in photoData){
                    console.log("dupe.")
                }
                else{
                    $('#instagramDisp').append('<div class="picture" id="'+picture.id+'"><img src="'+picture.images.thumbnail.url+'"></div>');
                    var location = new google.maps.LatLng(picture.location.latitude, picture.location.longitude);
                    //photoData[key][0] -> std res url
                    //photoData[key][1] -> pic link url
                    //photoData[key][2] -> user full name
                    //photoData[key][3] -> picture created time
                    //photoData[key][4] -> # likes
                    //photoData[key][5] -> # comments
                    
                    photoData[picture.id] = [picture.images.standard_resolution.url, picture.link, picture.user.full_name, picture.created_time, picture.likes.count, picture.comments.count];

                    //marker handling.

                    var marker = new google.maps.Marker({position: location, map: map, title:picture.id, icon:redIcon}); 
                    markers[picture.id] = marker;
                    google.maps.event.addListener(marker, 'mouseover', function() {
                        this.setIcon(blueIcon);
                        $('#'+this.getTitle()).stop(true,true).fadeTo(200 ,1);
                        $('.picture').not('#'+this.getTitle()).fadeTo(200,.5);
                    });
                    google.maps.event.addListener(marker, 'mouseout', function() {
                        this.setIcon(redIcon);
                        $('#'+this.getTitle()).stop(true,true).fadeTo(100, .5);
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        $('#'+this.getTitle()).fadeTo(200 ,1);
                        $('#bigPicHolder').empty().append('<a href="'+photoData[this.getTitle()][1]+'" target="_blank"><img src="'+photoData[this.getTitle()][0]+'"></a>');
                        currentBigPic = this.getTitle();
                        $('#pictureInfo').empty().append(loadInfo(currentBigPic));
                    });
                    google.maps.event.addListener(marker, 'dblclick', function(){
                        currentCenterPoint = this.getPosition();
                        map.panTo(currentCenterPoint);
                    });
                }
            }
            $('.picture').mouseenter(function(event){
                $(this).stop(true,true).fadeTo(200 ,1);
                $('.picture').not(this).fadeTo(200,.5);
                markers[this.getAttribute('id')].setIcon(blueIcon);
                    
            });
            $('.picture').mouseleave(function(event){
                markers[this.getAttribute('id')].setIcon(redIcon);
            });
            $('#bigPicHolder').mouseenter(function(event){
                if(typeof currentBigPic === 'undefined'){
                    //Do nothing
                }
                if($('#bigPicHolder').is(':empty')){
                    //Do nothing
                }
                else{
                    markers[currentBigPic].setIcon(blueIcon);
                    map.panTo(markers[currentBigPic].getPosition());

                }
            });
            $('#bigPicHolder').mouseleave(function(event){
                if(typeof currentBigPic === 'undefined'){
                    //Do Nothing
                }
                if($('#bigPicHolder').is(':empty')){
                    //Do Nothing
                }
                else{
                    markers[currentBigPic].setIcon(redIcon);
                    map.panTo(currentCenterPoint);
                }
            });
            $('#instagramDisp').mouseleave(function(event){
                $('.picture').stop(true,true).fadeTo(100, .5);
            });
            $('.picture').click(function(){
                console.log("pic cliked homie");
                var id = $(this).attr('id');
                console.log(id);
                console.log('<a href="'+photoData[id][1]+'"><img src="'+photoData[id][0]+'"></a>');
                $('#bigPicHolder').empty().append('<a href="'+photoData[id][1]+'" target="_blank"><img src="'+photoData[id][0]+'"></a>');
                currentBigPic = id;
                console.log(" " +photoData[id][2] + "  " + photoData[id][3]);
                $('#pictureInfo').empty().append(loadInfo(id));
            });
            $('.picture').dblclick(function(){
                var id = $(this).attr('id');
                map.panTo(markers[id].getPosition());
                currentCenterPoint = markers[id].getPosition();
            });
        }
        else{
            $('#instagramDisp').html('<p id=error>Woah homie, there are no pictures here</p>');
        }
    }
    else  {
      //if we didn’t get a 200 (success) request code from instagram
      //then we display instagram’s error message instagram
      var error = data.meta.error_message;
      $('#instagramDisp').show();
      $('#instagramDisp').append('Uh-oh Something happened, Instagram said: ' + error);
    }
}

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
};

function calculateMapRadius(){
    
    var w = map.getBounds().getSouthWest().lng();
    var centerLng = map.getCenter().lng();
    
    var centerLat = map.getCenter().lat().toRad();
    
    var dlong = Math.abs(centerLng - w).toRad(); // This is the distance from the center to the left in radians
    
    
    
    //Calculating distance using the Haversine formula.
    var a = Math.pow(Math.cos(centerLat),2) * 
            Math.sin(dlong/2) * Math.sin(dlong/2); 

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    
    var radius= Math.round(EARTH_RADIUS * c);
    
    return radius;
}

function loadInfo(id){
    var timeAgoString;
    var secondsAgo = time - photoData[id][3];
    var minutesAgo = secondsAgo/60;
    var hoursAgo = minutesAgo/60;
    var daysAgo = hoursAgo/24;
    
    
    
    if (secondsAgo > 86400){
        timeAgoString = '<span class="label">Uploaded: </span><span class="variable">'+Math.round(daysAgo)+" days ago</span>&nbsp &nbsp &nbsp &nbsp";
    }
    else if(secondsAgo > 3600){
        timeAgoString = '<span class="label">Uploaded: </span><span class="variable">'+Math.round(hoursAgo)+" hours ago</span>&nbsp &nbsp &nbsp &nbsp";
    }
    else if(secondsAgo >60){
        timeAgoString = '<span class="label">Uploaded: </span><span class="variable">'+Math.round(minutesAgo)+" minutes ago</span>&nbsp &nbsp &nbsp &nbsp";
    }
    else{
        timeAgoString = '<span class="label">Uploaded: </span><span class="variable">'+Math.round(secondsAgo)+" seconds ago</span>&nbsp &nbsp &nbsp &nbsp";
    }
    
    var nameString = '<span class="label">Photographer: </span> <span class="variable">'+photoData[id][2]+"</span> &nbsp &nbsp &nbsp &nbsp";
    var likesCommentsString = '<span class="label">Likes: </span><span class="variable">'+photoData[id][4]+ 
                                '</span>&nbsp &nbsp<span class="label">Comments: </span><span class="variable">'+photoData[id][5]+"</span>";
    
    return nameString+"     "+timeAgoString+"     "+likesCommentsString;
    
   
    
}

google.maps.event.addDomListener(window, 'load', initialize);