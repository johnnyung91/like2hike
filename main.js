//Global Variables
var googleAPI = "AIzaSyDy-k7naixPLfTdtOFOWye58XgWfSUNrgY";
var hikingAPI = "200712037-04ab66ab7f810ab7c981e63fe3f4d800";
var map;
var infoWindow;

//DOM Queries
var mapLanding = document.getElementById("map");
var mapInfo = document.getElementById("map-info"); // FOR REMOVING D-NONE
var submitButton = document.getElementById("submit");
var locationForm = document.getElementById("location-form");
var infoSection = document.getElementById("info");

locationForm.addEventListener("submit", initiateApp);

function initiateApp(event) {
    mapLanding.innerHTML = "";
    infoSection.innerHTML = "";
    mapInfo.className = "container d-none"; // FOR REMOVING D-NONE
    geocode(event);
}

function geocode(event) {
    event.preventDefault();
    var location = document.getElementById("location-input").value;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, function(results, status) {
        if (status === "OK") {
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            getHikingTrails(latitude, longitude);
        } else {
            alert("ADDRESS CANNOT BE FOUND");
        }
    });
}

function initMap(lat, long, array) {
    map = new google.maps.Map(mapLanding, {
        center: { lat: lat, lng: long },
        zoom: 10
    });

    infoWindow = new google.maps.InfoWindow();

    for (let i = 0; i < array.length; i++) {
        addMarker(array[i]);
        addInfoDiv(array[i]);
    }
}

function addMarker(data) {
    var marker = new google.maps.Marker({
        position: { lat: data.latitude, lng: data.longitude },
        map: map
    });

    google.maps.event.addListener(marker, "click", function() {
        var info = `<b>${data.name}</b> <br/> <br/>${data.location}`;
        infoWindow.setContent(info);
        infoWindow.open(map, this);
        var active = document.querySelector(".active-div");
        if (!active) {
            highlightDiv(marker, data)
        } else {
            active.classList.remove("active-div");
            highlightDiv(marker, data)
        }
    });
}

//Refactored highlight div
function highlightDiv(marker, data) {
    marker.name = data.name;
    var selected = document.getElementById(marker.name)
    selected.classList.add("active-div");
    infoSection.insertBefore(selected, infoSection.firstChild)
}

function getHikingTrails(lat, long) {
    $.ajax({
        method: "GET",
        url:
            "https://www.hikingproject.com/data/get-trails?lat=" +
            lat +
            "&lon=" +
            long +
            "&maxDistance=15&key=" +
            hikingAPI,
        success: function(data) {
            var trailArray = data.trails;
            console.log(trailArray);
            document.querySelector(".d-none").classList.remove("d-none"); // FOR REMOVING D-NONE
            initMap(lat, long, trailArray);
        },
        error: function(err) {
            console.error(err);
        }
    });
}

function addInfoDiv(data) {
    var name = document.createElement("h5");
    name.textContent = data.name;
    var summary = document.createElement("p");
    summary.textContent = data.summary;
    var difficulty = document.createElement("p");
    var capitalized = data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1);
    difficulty.textContent = "Difficulty: " + capitalized;
    var rating = document.createElement("p");
    rating.textContent = "Rating: " + data.stars;
    var a = document.createElement("a");
    var link = document.createTextNode(data.url);
    a.href = data.url;
    a.setAttribute("target", "_blank");
    a.appendChild(link);

    var trailInfo = document.createElement("div");
    trailInfo.classList.add("trail-info");
    trailInfo.setAttribute("id", data.name);
    trailInfo.style.backgroundColor = data.difficulty;

    trailInfo.append(name, difficulty, summary, rating, a);
    infoSection.appendChild(trailInfo);
}
