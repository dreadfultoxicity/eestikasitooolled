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
}

window.onload = login;

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

function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}


var selectedBeer = decodeURI(getQueryVariable("beer"));
var forRatings = [];
var beerName;
var color = "#1cceb6";

firebase.database().ref('/beers').once('value', function(snapshot) {

    var beersArray = snapshotToArray(snapshot);
    var n = 0;

    for (n; n < beersArray.length; n++){
        beerName = beersArray[n]["beer_name"];
        forRatings.push(beerName);
        if (beerName === selectedBeer){
            document.getElementById("loader").style.display = "none";
            document.getElementById("beer_details").style.display = "inherit";
            document.getElementById("beer_name").innerHTML = beerName;
            document.getElementById("summary").innerHTML = beersArray[n]["beer_summary"];
            document.getElementById("brewery").innerHTML = beersArray[n]["brewery"];
            document.getElementById("alcohol_percentage").innerHTML = beersArray[n]["beer_alcohol"];
            document.getElementById("temperature").innerHTML = beersArray[n]["beer_temperature"];
            document.getElementById("homepage").innerHTML = beersArray[n]["homepage"];
            document.getElementById("homepage").setAttribute("href", beersArray[n]["homepage"]);
            document.getElementById("image").setAttribute("src", beersArray[n]["beer_image"]);
            getRating(beerName, n);
            break;
        } else {
            // console.log("pole veel õiget õlut leidnud");
        }
    }
});


function getRating(beerName, n) {
    var ratingRow = document.createElement('div');
    ratingRow.className = "beer_rating";

    var p;
    for (p=1; p<6; p++) {
        var ratingIcons = document.createElement('i');
        ratingIcons.className = "rating"+p;
        ratingIcons.innerHTML = '<i class="fa fa-star aria-hidden="true"></i>';
        ratingRow.setAttribute("name", beerName);
        ratingIcons.setAttribute("onclick", "add_rating(this)");
        ratingIcons.setAttribute("name", beerName);
        ratingIcons.setAttribute("data-value1", n);
        ratingIcons.setAttribute("data-value2", p);
        document.getElementById('beer_details').appendChild(ratingRow).appendChild(ratingIcons);
    }
    displayAllUsersRatings(color);
}

function displayAllUsersRatings(color) {
    var ratingsRef = firebase.database().ref('/ratings');
    var allUsersAverageToDisplay;
    ratingsRef.on('value', function (snapshot) {
        var users = snapshot.val();
        var numberOfUsers = snapshot.numChildren();
        var allUsersRating;
        var allUsersNumbers = [];
        var allUsersAverage;
        var allUsersSum;

        var ratingsContainer = document.getElementById('number_who_voted');
        if (ratingsContainer) {
            ratingsContainer.remove();
            color = "#d340fd";
        }

        for (a = 0; a < numberOfUsers; a++) {
            var key = Object.keys(users)[a];
            var values = users[key];

            for (e = 0; e < values.length; e++) {
                if (values[e]["beer_name"] === beerName) {
                    allUsersRating = values[e]["rating"];
                    allUsersNumbers.push(parseInt(allUsersRating));
                } else {
                    // console.log("sellist pole veel hinnatud");
                }
            }
        }

        function getSum(total, num) {
            return total + num;
        }

        var numberOfUsersDiv = document.createElement('div');
        numberOfUsersDiv.id = "number_of_users";
        var numberOfUsersWhoVoted = document.createElement('span');
        numberOfUsersWhoVoted.id = "number_who_voted";

        if (allUsersNumbers.length === 0) {
            numberOfUsersDiv.innerText = "Ükski kasutaja pole veel seda õlut hinnanud";
            document.getElementById('beer_details').appendChild(numberOfUsersDiv);
        } else {
            allUsersSum = allUsersNumbers.reduce(getSum);
            allUsersAverage = (allUsersSum / allUsersNumbers.length).toFixed(1);
            allUsersAverageToDisplay = Math.round(allUsersSum / allUsersNumbers.length);
            numberOfUsersWhoVoted.innerText = allUsersAverage + " (" + allUsersNumbers.length + ")";
            document.getElementById('beer_details').appendChild(numberOfUsersWhoVoted);

            var rating1 = document.getElementsByClassName("rating1")[0];
            var rating2 = document.getElementsByClassName("rating2")[0];
            var rating3 = document.getElementsByClassName("rating3")[0];
            var rating4 = document.getElementsByClassName("rating4")[0];
            var rating5 = document.getElementsByClassName("rating5")[0];

            if (allUsersAverageToDisplay === 1) {
                rating1.setAttribute("style", "color:" + color);
            } else if (allUsersAverageToDisplay === 2) {
                rating1.setAttribute("style", "color:" + color);
                rating2.setAttribute("style", "color:" + color);
            } else if (allUsersAverageToDisplay === 3) {
                rating1.setAttribute("style", "color:" + color);
                rating2.setAttribute("style", "color:" + color);
                rating3.setAttribute("style", "color:" + color);
            } else if (allUsersAverageToDisplay === 4) {
                rating1.setAttribute("style", "color:" + color);
                rating2.setAttribute("style", "color:" + color);
                rating3.setAttribute("style", "color:" + color);
                rating4.setAttribute("style", "color:" + color);
            } else if (allUsersAverageToDisplay === 5) {
                rating1.setAttribute("style", "color:" + color);
                rating2.setAttribute("style", "color:" + color);
                rating3.setAttribute("style", "color:" + color);
                rating4.setAttribute("style", "color:" + color);
                rating5.setAttribute("style", "color:" + color);
            } else {}
        }
    });

    displayWishlist();
}

var numberOfRatings;

function displayUserBasedRatings() {
    var ratingsRef = firebase.database().ref('/ratings').child(userAuth);
    ratingsRef.orderByChild('rating').once('value', function(snapshot) {
        if (snapshot.exists()) {
            ratingsRef.once('value', function(snapshot) {
                var ratingsArray = snapshotToArray(snapshot);
                var ratingsCount = ratingsArray.length;

                for (m = 0; m < ratingsCount; m++) {
                    var beerRatingFromDB = ratingsArray[m]['rating'];
                    var beerNameFromDB = ratingsArray[m]['beer_name'];
                    var beerNameFromSite = document.getElementsByClassName("beer_rating")[0].getAttribute("name");
                    var rating1 = document.getElementsByClassName("rating1")[0];
                    var rating2 = document.getElementsByClassName("rating2")[0];
                    var rating3 = document.getElementsByClassName("rating3")[0];
                    var rating4 = document.getElementsByClassName("rating4")[0];
                    var rating5 = document.getElementsByClassName("rating5")[0];

                    if (beerNameFromSite === beerNameFromDB) {
                        if (beerRatingFromDB <= 1) {
                            rating1.setAttribute("style", "color: #1cceb6");
                        } else if (beerRatingFromDB <= 2) {
                            rating1.setAttribute("style", "color: #1cceb6");
                            rating2.setAttribute("style", "color: #1cceb6");
                        } else if (beerRatingFromDB <= 3) {
                            rating1.setAttribute("style", "color: #1cceb6");
                            rating2.setAttribute("style", "color: #1cceb6");
                            rating3.setAttribute("style", "color: #1cceb6");
                        } else if (beerRatingFromDB <= 4) {
                            rating1.setAttribute("style", "color: #1cceb6");
                            rating2.setAttribute("style", "color: #1cceb6");
                            rating3.setAttribute("style", "color: #1cceb6");
                            rating4.setAttribute("style", "color: #1cceb6");
                        } else if (beerRatingFromDB <= 5) {
                            rating1.setAttribute("style", "color: #1cceb6");
                            rating2.setAttribute("style", "color: #1cceb6");
                            rating3.setAttribute("style", "color: #1cceb6");
                            rating4.setAttribute("style", "color: #1cceb6");
                            rating5.setAttribute("style", "color: #1cceb6");
                        } else {}
                    } else {
                        // console.log("sellist pole");
                    }
                }
            })
        } else {
            // console.log("kasutajal pole ratingute objekti veel");
        }
    });
}

function add_rating(d) {
    var beerIdFromSite = d.getAttribute("data-value1");
    var ratingClicked = d.getAttribute("data-value2");
    var number = numberOfRatings + 1;
    var userIndicator = "user" + number;

    firebase.database().ref('/ratings').child(userAuth).once('value', function(snapshot) {
        if (snapshot.exists()) {
            // console.log("kasutajal ratingud olemas");
            addOrChangeRating(beerIdFromSite, beerName, ratingClicked, userIndicator);
        } else {
            // console.log("kasutajal pole ratingute objekti veel");
            firebase.database().ref('ratings/' + userAuth).child("0").set({
                beer_name: beerName,
                rating: ratingClicked
            });

            var rating1 = document.getElementsByClassName("rating1")[0];
            var rating2 = document.getElementsByClassName("rating2")[0];
            var rating3 = document.getElementsByClassName("rating3")[0];
            var rating4 = document.getElementsByClassName("rating4")[0];
            var rating5 = document.getElementsByClassName("rating5")[0];

            if (ratingClicked <= 1) {
                rating1.setAttribute("style", "color: #d340fd");
                rating2.setAttribute("style", "color: #d6d6d6");
                rating3.setAttribute("style", "color: #d6d6d6");
                rating4.setAttribute("style", "color: #d6d6d6");
                rating5.setAttribute("style", "color: #d6d6d6");
            } else if (ratingClicked <= 2) {
                rating1.setAttribute("style", "color: #d340fd");
                rating2.setAttribute("style", "color: #d340fd");
                rating3.setAttribute("style", "color: #d6d6d6");
                rating4.setAttribute("style", "color: #d6d6d6");
                rating5.setAttribute("style", "color: #d6d6d6");
            } else if (ratingClicked <= 3) {
                rating1.setAttribute("style", "color: #d340fd");
                rating2.setAttribute("style", "color: #d340fd");
                rating3.setAttribute("style", "color: #d340fd");
                rating4.setAttribute("style", "color: #d6d6d6");
                rating5.setAttribute("style", "color: #d6d6d6");
            } else if (ratingClicked <= 4) {
                rating1.setAttribute("style", "color: #d340fd");
                rating2.setAttribute("style", "color: #d340fd");
                rating3.setAttribute("style", "color: #d340fd");
                rating4.setAttribute("style", "color: #d340fd");
                rating5.setAttribute("style", "color: #d6d6d6");
            } else if (ratingClicked <= 5) {
                // console.log("rating 5");
                rating1.setAttribute("style", "color: #d340fd");
                rating2.setAttribute("style", "color: #d340fd");
                rating3.setAttribute("style", "color: #d340fd");
                rating4.setAttribute("style", "color: #d340fd");
                rating5.setAttribute("style", "color: #d340fd");
            } else {
                console.log("mingi kala");
            }
        }
    });
}

function addOrChangeRating(beerIdFromSite, beerName, ratingClicked, userIndicator) {
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

            if (ratingsArray[i]['beer_name'] === beerName) {
                ratingKey = ratingsArray[i].key;
                originalRating = ratingsArray[i]['rating'];
            } else {}
        }

        // overwrite existing rating
        if (siteRatingsArray.includes(beerName)) {

            firebase.database().ref('ratings/' + userAuth).child(ratingKey).set({
                beer_name: beerName,
                rating: ratingClicked
            });

            var rating1 = document.getElementsByClassName("rating1")[0];
            var rating2 = document.getElementsByClassName("rating2")[0];
            var rating3 = document.getElementsByClassName("rating3")[0];
            var rating4 = document.getElementsByClassName("rating4")[0];
            var rating5 = document.getElementsByClassName("rating5")[0];

            if (ratingClicked === "1") {
                if (ratingClicked > originalRating) {
                    rating1.setAttribute("style", "color: #d340fd");
                } else {
                    rating2.setAttribute("style", "color: #d6d6d6");
                    rating3.setAttribute("style", "color: #d6d6d6");
                    rating4.setAttribute("style", "color: #d6d6d6");
                    rating5.setAttribute("style", "color: #d6d6d6");
                }
            } else if (ratingClicked === "2") {
                if (ratingClicked > originalRating) {
                    rating1.setAttribute("style", "color: #d340fd");
                    rating2.setAttribute("style", "color: #d340fd");
                } else {
                    rating3.setAttribute("style", "color: #d6d6d6");
                    rating4.setAttribute("style", "color: #d6d6d6");
                    rating5.setAttribute("style", "color: #d6d6d6");
                }
            } else if (ratingClicked === "3") {
                if (ratingClicked > originalRating) {
                    rating1.setAttribute("style", "color: #d340fd");
                    rating2.setAttribute("style", "color: #d340fd");
                    rating3.setAttribute("style", "color: #d340fd");
                } else {
                    rating4.setAttribute("style", "color: #d6d6d6");
                    rating5.setAttribute("style", "color: #d6d6d6");
                }
            } else if (ratingClicked === "4") {
                if (ratingClicked > originalRating) {
                    rating1.setAttribute("style", "color: #d340fd");
                    rating2.setAttribute("style", "color: #d340fd");
                    rating3.setAttribute("style", "color: #d340fd");
                    rating4.setAttribute("style", "color: #d340fd");
                } else {
                    rating5.setAttribute("style", "color: #d6d6d6");
                }
            } else if (ratingClicked === "5") {
                if (ratingClicked > originalRating) {
                    rating1.setAttribute("style", "color: #d340fd");
                    rating2.setAttribute("style", "color: #d340fd");
                    rating3.setAttribute("style", "color: #d340fd");
                    rating4.setAttribute("style", "color: #d340fd");
                    rating5.setAttribute("style", "color: #d340fd");
                } else {}
            } else {}

        // add new rating
        } else {
            // console.log("Sellist pole");
            firebase.database().ref('ratings/' + userAuth).child(count).set({
                beer_name: beerName,
                rating: ratingClicked
            });
            // location.reload();
            document.getElementById("number_of_users").style.display = "none";
        }
    });
    }

function displayWishlist() {
    var wishlistIcon = document.createElement('i');
    wishlistIcon.id = "wishlist_heart";
    wishlistIcon.innerHTML = '<i class="fa fa-heart aria-hidden="true"></i>';
    wishlistIcon.setAttribute("onclick", "add_to_wishlist(this)");
    wishlistIcon.setAttribute("name", beerName);
    document.getElementById('beer_details').appendChild(wishlistIcon);

    firebase.database().ref('/wishlist').child(userAuth).on('value', function(snapshot) {
        if (snapshot.exists()) {
            // console.log("kasutajal wishlist olemas");
            var wishlistArray = snapshotToArray(snapshot);
            var count = wishlistArray.length;
            for (i = 0; i < count; i++) {
                // console.log(wishlistArray[i]);
                if (beerName === wishlistArray[i]) {
                    document.getElementById("wishlist_heart").setAttribute("style", "color: #ff3e73");
                } else {
                }
            }
            } else {
            // console.log("kasutajal pole wishlisti objekti veel");
        }
    });
}

function add_to_wishlist(d) {
    console.log(beerName);

    firebase.database().ref('/wishlist').child(userAuth).once('value', function(snapshot) {

        if (snapshot.exists()) {
            console.log("kasutajal wishlist olemas");
            addOrRemoveFromWishlist(beerName);
        } else {
            console.log("kasutajal pole wishlisti objekti veel");
            firebase.database().ref('wishlist/' + userAuth).set({
                0: beerName
            });
            // location.reload();
        }
    });
}

function addOrRemoveFromWishlist(beerName) {
    var wishlistRef = firebase.database().ref('/wishlist').child(userAuth);
    wishlistRef.once('value', function(snapshot) {
        var wishlistArray = snapshotToArray(snapshot);
        var count = wishlistArray.length;
        console.log("wishlistis olevated õllede arv:" + count);

        var inWishlistArray = [];

        for (i = 0; i < count; i++) {
            inWishlistArray.push(wishlistArray[i]);
        }

        // removinc or adding a new beer to wishlist
        if (inWishlistArray.includes(beerName)) {
            console.log("Selline juba on");
            document.getElementById("wishlist_heart").setAttribute("style", "color: #c2c2c2");
            var beerIndex = wishlistArray.indexOf(beerName);
            console.log(beerIndex);
            wishlistArray.splice(beerIndex, 1);
            console.log(wishlistArray);
            wishlistRef.set(wishlistArray);
        } else {
            console.log("Sellist pole");
            document.getElementById("wishlist_heart").setAttribute("style", "color: #ff3e73");
            wishlistArray.push(beerName);
            console.log(wishlistArray);
            wishlistRef.set(wishlistArray);
        }
    });
}



