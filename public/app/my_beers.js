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

var userAuth;

function app(user) {
    userAuth = user.uid;
    console.log("username: " + user.displayName);
    readRatingsData();
}

window.onload = login;

    function logout() {
        firebase.auth().signOut().then(function() {
            localStorage.removeItem("firebase:authUser:AIzaSyBwspmlEDpJedq9KLjCXglMAzL3qYWelF8:[DEFAULT]");
            window.location.href = "index.html";
            // Sign-out successful.
        }).catch(function(error) {
            console.log(error);
            localStorage.removeItem("firebase:authUser:AIzaSyBwspmlEDpJedq9KLjCXglMAzL3qYWelF8:[DEFAULT]");
        });
    }

// array
function snapshotToArray(snapshot) {
    var returnArr = [];
    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });
    return returnArr;
}

var ratingsArray;

function readRatingsData() {
    var ratingsRef = firebase.database().ref('/ratings').child(userAuth);
    ratingsRef.once('value', function(snapshot) {
        if (snapshot.exists()) {
            console.log("kasutajal ratingud olemas");
            ratingsRef.once('value', function(snapshot) {
                ratingsArray = snapshotToArray(snapshot);

                console.log(ratingsArray);
                document.getElementById("loader").style.display = "none";
                displayRatings();
            });
        } else {
            console.log("kasutal pole ratingute objekti loodud");
            document.getElementById("empty_container").style.display = "block";
            document.getElementById("empty_ratings").style.display = "block";
            document.getElementById("loader").style.display = "none";
        }
    });
}

var forRatings = [];
var beerImages = [];
var beersArray = [];

function getBeerImages() {
    for (i = 0; i < beersArray.length; i++) {
        beerImages.push(beersArray[i]['beer_name']);
        beerImages.push(beersArray[i]['beer_image']);
    }
}

function displayRatings() {
    var beersRef = firebase.database().ref('/beers').orderByChild('rating');
    beersRef.once('value', function(snapshot) {
        beersArray = snapshotToArray(snapshot);
        getBeerImages();

        ratingsArray.sort(function (a, b) {
            return b.rating - a.rating;
        });
        console.log(ratingsArray);

        for (n = 0; n < ratingsArray.length; n++) {

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
            var beerName = ratingsArray[n]['beer_name'];

            // name
            var newBeerNameElement = document.createElement('div');
            newBeerNameElement.className = "beer_name";
            newBeerNameElement.innerHTML = beerName;
            newBeerNameElement.setAttribute("onclick", "to_beer_view(this)");
            newBeerNameElement.setAttribute("name", beerName);
            document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(newBeerNameElement);

            // ratings
            var p;
            forRatings.push(newBeerNameElement.innerText);
            for (p=1; p<6; p++) {
                var ratingIcons = document.createElement('i');
                ratingIcons.className = "rating"+p;
                ratingIcons.innerHTML = '<i class="fa fa-star aria-hidden="true"></i>';
                ratingRow.setAttribute("name", newBeerNameElement.innerText);
                ratingIcons.setAttribute("onclick", "change_rating(this)");
                ratingIcons.setAttribute("name", newBeerNameElement.innerText);
                ratingIcons.setAttribute("data-value1", n);
                ratingIcons.setAttribute("data-value2", p);
                document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(iconRow).appendChild(ratingRow).appendChild(ratingIcons);
            }

            // // images
            for (x = 0; x < beerImages.length; x+=2) {

                if (beerImages[x] === beerName) {
                    // images
                    var newBeerImage = document.createElement("img")
                    newBeerImage.className = "image";
                    var beerLink = beerImages[x+1];
                    newBeerImage.setAttribute("src", beerLink);
                    document.getElementById('main').appendChild(beers).appendChild(newBeerImage);
                } else {
                    // console.log("ei ole vastet");
                }
            }
        }
        displayUserBasedRatings();
    });
}

function displayUserBasedRatings() {
    var ratingsRef = firebase.database().ref('/ratings').child(userAuth);
    ratingsRef.orderByChild('rating').once('value', function(snapshot) {
        if (snapshot.exists()) {
            // console.log("kasutajal ratingud olemas");
            ratingsRef.once('value', function(snapshot) {
                var ratingsArray = snapshotToArray(snapshot);
                var ratingsCount = ratingsArray.length;

                for (m = 0; m < ratingsCount; m++) {
                    var beerRatingFromDB = ratingsArray[m]['rating'];
                    var beerNameFromDB = ratingsArray[m]['beer_name'];

                    for (a = 0; a < forRatings.length; a++) {
                        var beerNameFromSite = document.getElementsByClassName("beer_rating")[a].getAttribute("name");
                        var rating1 = document.getElementsByClassName("rating1")[a];
                        var rating2 = document.getElementsByClassName("rating2")[a];
                        var rating3 = document.getElementsByClassName("rating3")[a];
                        var rating4 = document.getElementsByClassName("rating4")[a];
                        var rating5 = document.getElementsByClassName("rating5")[a];

                        if (beerNameFromSite === beerNameFromDB) {
                            if (beerRatingFromDB <= 1) {
                                rating1.setAttribute("style", "color: #d340fd");
                            } else if (beerRatingFromDB <= 2) {
                                rating1.setAttribute("style", "color: #d340fd");
                                rating2.setAttribute("style", "color: #d340fd");
                            } else if (beerRatingFromDB <= 3) {
                                rating1.setAttribute("style", "color: #d340fd");
                                rating2.setAttribute("style", "color: #d340fd");
                                rating3.setAttribute("style", "color: #d340fd");
                            } else if (beerRatingFromDB <= 4) {
                                rating1.setAttribute("style", "color: #d340fd");
                                rating2.setAttribute("style", "color: #d340fd");
                                rating3.setAttribute("style", "color: #d340fd");
                                rating4.setAttribute("style", "color: #d340fd");
                            } else if (beerRatingFromDB <= 5) {
                                rating1.setAttribute("style", "color: #d340fd");
                                rating2.setAttribute("style", "color: #d340fd");
                                rating3.setAttribute("style", "color: #d340fd");
                                rating4.setAttribute("style", "color: #d340fd");
                                rating5.setAttribute("style", "color: #d340fd");
                            } else {}
                        } else {
                            // console.log("sellist pole");
                        }
                    }
                }
            })
        } else {
            // console.log("kasutajal pole ratingute objekti veel");
        }
    });
}


function change_rating(d) {
    var beerIdFromSite = d.getAttribute("data-value1");
    var name = document.getElementsByClassName("rating1")[beerIdFromSite].getAttribute("name");
    var ratingClicked = d.getAttribute("data-value2");

    firebase.database().ref('/ratings').child(userAuth).once('value', function(snapshot) {
        if (snapshot.exists()) {
            // console.log("kasutajal ratingud olemas");
            changeRating(beerIdFromSite, name, ratingClicked);
        } else {
            // console.log("kasutajal pole ratingute objekti veel - cannot be possible");
        }
    });

}

function changeRating(beerIdFromSite, name, ratingClicked) {
    // check if rating for that beer already exists
    var ratingsRef = firebase.database().ref('/ratings').child(userAuth);
    ratingsRef.once('value', function(snapshot) {
        var ratingsArray = snapshotToArray(snapshot);
        var siteRatingsArray = [];
        var count = ratingsArray.length;
        var ratingKey;
        var originalRating;

        for (i = 0; i < count; i++) {
            siteRatingsArray.push(ratingsArray[i]['beer_name']);

            if (ratingsArray[i]['beer_name'] === name) {
                console.log(ratingsArray[i].key);
                ratingKey = ratingsArray[i].key;
                originalRating = ratingsArray[i]['rating'];
            } else {
                console.log("nope");
            }

        }

        // overwrite existing rating
        if (siteRatingsArray.includes(name)) {
            console.log("Selline juba on");

            firebase.database().ref('ratings/' + userAuth).child(ratingKey).set({
                beer_name: name,
                rating: ratingClicked
            });

            console.log(ratingClicked);;

            for (a = 0; a < siteRatingsArray.length; a++) {
                var beerNameFromSite = document.getElementsByClassName("beer_rating")[a].getAttribute("name");
                var rating1 = document.getElementsByClassName("rating1")[a];
                var rating2 = document.getElementsByClassName("rating2")[a];
                var rating3 = document.getElementsByClassName("rating3")[a];
                var rating4 = document.getElementsByClassName("rating4")[a];
                var rating5 = document.getElementsByClassName("rating5")[a];

                if (beerNameFromSite === name) {
                    if (ratingClicked <= 1) {
                        if (ratingClicked > originalRating) {
                            rating1.setAttribute("style", "color: #d340fd");
                        } else {
                            rating2.setAttribute("style", "color: #d6d6d6");
                            rating3.setAttribute("style", "color: #d6d6d6");
                            rating4.setAttribute("style", "color: #d6d6d6");
                            rating5.setAttribute("style", "color: #d6d6d6");
                        }
                    } else if (ratingClicked <= 2) {
                        if (ratingClicked > originalRating) {
                            rating1.setAttribute("style", "color: #d340fd");
                            rating2.setAttribute("style", "color: #d340fd");
                        } else {
                            rating3.setAttribute("style", "color: #d6d6d6");
                            rating4.setAttribute("style", "color: #d6d6d6");
                            rating5.setAttribute("style", "color: #d6d6d6");
                        }
                    } else if (ratingClicked <= 3) {
                        if (ratingClicked > originalRating) {
                            rating1.setAttribute("style", "color: #d340fd");
                            rating2.setAttribute("style", "color: #d340fd");
                            rating3.setAttribute("style", "color: #d340fd");
                        } else {
                            rating4.setAttribute("style", "color: #d6d6d6");
                            rating5.setAttribute("style", "color: #d6d6d6");
                        }
                    } else if (ratingClicked <= 4) {
                        if (ratingClicked > originalRating) {
                            rating1.setAttribute("style", "color: #d340fd");
                            rating2.setAttribute("style", "color: #d340fd");
                            rating3.setAttribute("style", "color: #d340fd");
                            rating4.setAttribute("style", "color: #d340fd");
                        } else {
                            rating5.setAttribute("style", "color: #d6d6d6");
                        }
                    } else if (ratingClicked <= 5) {
                        // console.log("rating 5");
                        rating1.setAttribute("style", "color: #d340fd");
                        rating2.setAttribute("style", "color: #d340fd");
                        rating3.setAttribute("style", "color: #d340fd");
                        rating4.setAttribute("style", "color: #d340fd");
                        rating5.setAttribute("style", "color: #d340fd");
                    } else {}
                } else {
                    // console.log("sellist pole");
                }
            }

            // add new rating
        } else {
            // console.log("Sellist pole - not possible");
        }

    });

}

function to_beer_view(d) {
    var encodedUrl = encodeURI(d.getAttribute("name"));
    window.open("beer_view.html?beer=" + encodedUrl, "_self");
}
