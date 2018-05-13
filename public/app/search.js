// Initialize firebase
var config = {
    apiKey: "AIzaSyBwspmlEDpJedq9KLjCXglMAzL3qYWelF8",
    authDomain: "estonian-craftbeers.firebaseapp.com",
    databaseURL: "https://estonian-craftbeers.firebaseio.com",
    projectId: "estonian-craftbeers",
    storageBucket: "estonian-craftbeers.appspot.com",
    messagingSenderId: "936385111355"
};
firebase.initializeApp(config);

var userAuth;
var searchInput;
var beersArray;
var howManyAnswers = 0;

// LOGIN
function login() {
    function newLoginHappened(user) {
        if (user) {
            // User is signed in
            app(user);
        } else {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider);
        }
    }
    firebase.auth().onAuthStateChanged(newLoginHappened);
}

function app(user) {
    userAuth = user.uid;
    console.log("username: " + user.displayName);
    getBeers();
}

window.onload = login;

function snapshotToArray(snapshot) {
    var returnArr = [];
    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });
    return returnArr;
}

function getBeers() {
    firebase.database().ref('/beers').orderByChild('beer_name').on('value', function (snapshot) {
        beersArray = snapshotToArray(snapshot);
        // console.log(beersArray);
    });
}

function click_search() {

    cleanPreviousSearchResults();
    document.getElementById("search_is_clicked").style.display = "";
    document.getElementById("help_text").style.display = "none";

    searchInput = document.getElementById("search_input").value;
    console.log(searchInput);
    searchInput = searchInput || window.event;

    var howMany = 0;

    for (i = 0; i < beersArray.length; i++) {
        var beersInArray = beersArray[i]['beer_name'];
        var beerImage = beersArray[i]['beer_image'];
        var beerBrewery = beersArray[i]['brewery'];
        var beerSort = beersArray[i]['beer_alcohol'].split("%").pop();
        var lowerCaseBeerSort = beerSort.toLowerCase().toString();
        var lowerCaseSearchInput = searchInput.toLowerCase();
        var lowerCaseBeersInArray = beersInArray.toLowerCase();
        var lowerCaseBeerBrewery = beerBrewery.toLowerCase();
        console.log(lowerCaseBeerSort);
        console.log(lowerCaseBeerSort.indexOf(lowerCaseSearchInput) > -1);

        if (lowerCaseBeersInArray === lowerCaseSearchInput) {
            howManyAnswers += 1;
            displaySearchResult(beersInArray, beerImage);
        } else if (lowerCaseBeersInArray.indexOf(lowerCaseSearchInput) > -1) {
            howManyAnswers += 1;
            displaySearchResult(beersInArray, beerImage);
        } else if (lowerCaseBeerBrewery === lowerCaseSearchInput) {
            howManyAnswers += 1;
            displaySearchResult(beersInArray, beerImage);
        } else if (lowerCaseBeerBrewery.indexOf(lowerCaseSearchInput) > -1) {
            howManyAnswers += 1;
            displaySearchResult(beersInArray, beerImage);
        }else if (lowerCaseBeerSort.indexOf(lowerCaseSearchInput) > -1) {
            howManyAnswers += 1;
            displaySearchResult(beersInArray, beerImage);
        } else {
            howMany += 1;
            if (howMany === beersArray.length) {
                document.getElementById("no_answer").style.display = "initial";
                document.getElementById("search_is_clicked").style.display = "none";
            } else {
                // console.log("continue");
            }
        }
    }
}

function displaySearchResult(beersInArray, beerImage) {
    document.getElementById("no_answer").style.display = "none";
    document.getElementById("search_is_clicked").style.display = "none";

    var beersContainer = document.createElement('div');
    beersContainer.id = "beers_container";
    var beers = document.createElement('div');
    beers.className = "beers";
    var beerimage = document.createElement('div');
    beerimage.className = "beer_image";
    var beerinfo = document.createElement('div');
    beerinfo.className = "beer_info";
    var iconRow = document.createElement('div');
    iconRow.className = "icon_row";
    var ratingRow = document.createElement('div');
    ratingRow.className = "beer_rating";

    // name
    var newBeerNameElement = document.createElement('div');
    newBeerNameElement.className = "beer_name";
    newBeerNameElement.innerHTML = beersInArray;
    newBeerNameElement.setAttribute("onclick", "to_beer_view(this)");
    newBeerNameElement.setAttribute("name", beersInArray);
    document.getElementById('main').appendChild(beersContainer).appendChild(beers).appendChild(beerinfo).appendChild(newBeerNameElement);

    // images
    var newBeerImage = document.createElement("img");
    newBeerImage.className = "image";
    newBeerImage.setAttribute("src", beerImage);
    document.getElementById('main').appendChild(beersContainer).appendChild(beers).appendChild(beerimage).appendChild(newBeerImage);
}

function cleanPreviousSearchResults() {
    for (i=0; i<howManyAnswers; i++) {
        var beersContainer = document.getElementById('beers_container');
        if (beersContainer) {
            // console.log("peaks kustutama");
            beersContainer.remove();
        } else {
            // console.log("ei peaks kustutama");
        }
    }
}

function to_beer_view(d) {
    var encodedUrl = encodeURI(d.getAttribute("name"));
    window.open("beer_view.html?beer=" + encodedUrl, "_self");
}


