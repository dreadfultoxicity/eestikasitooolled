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
    // console.log("username: " + user.displayName);
    // console.log("email: " + user.email);
    // console.log("token: " + user.uid);
    var name = user.displayName;
    var email = user.email;
    writeUserData(name, email, user);
    readingBeerData();
    showWishlist();
    showRatings();
}

// Check if user exists, if not, write user data to database
function writeUserData(name, email, user) {
    var usersRef = firebase.database().ref('/users');
    usersRef.child(user.uid).orderByChild('email').on('value', function(snapshot) {
        if (snapshot.exists()) {
            // console.log("exists");
        } else {
            // console.log("doesn't exist");
            // var newUserRef = usersRef.push();
                firebase.database().ref('users/' + user.uid).set({
                email: email,
                name: name
            });
        }
    });
}

window.onload = login;

var beersArray;
var forWishlist = [];
var forRatings = [];

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

function readingBeerData() {
    // console.log(firebase.database().ref('/beers'));
    firebase.database().ref('/beers').orderByChild('beer_name').on('value', function (snapshot) {
        beersArray = snapshotToArray(snapshot);
        // beersArray.reverse();
        var numberOfBeers = beersArray.length;
        var firstnumber = 0;
        var secondnumber = 15;

        function showBeers() {
            for (n = firstnumber; n < secondnumber; n++) {
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

                // brewery
                var newBreweryElement = document.createElement('div');
                newBreweryElement.className = "brewery_name";
                newBreweryElement.innerHTML = beersArray[n]['brewery'];
                document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(newBreweryElement);


                // name
                var newBeerNameElement = document.createElement('div');
                newBeerNameElement.className = "beer_name";
                newBeerNameElement.innerHTML = beersArray[n]['beer_name'];
                newBeerNameElement.setAttribute("onclick", "to_beer_view(this)");
                newBeerNameElement.setAttribute("name", beersArray[n]['beer_name']);
                document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(newBeerNameElement);

                // summary
                var newBeerSummaryElement = document.createElement('div');
                newBeerSummaryElement.className = "beer_summary";
                newBeerSummaryElement.innerHTML = beersArray[n]['beer_summary'];
                document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(newBeerSummaryElement);

                // ratings
                var p;
                forRatings.push(newBeerNameElement.innerText);
                for (p=1; p<6; p++) {
                    var ratingIcons = document.createElement('i');
                    ratingIcons.className = "rating"+p;
                    ratingIcons.innerHTML = '<i class="fa fa-star aria-hidden="true"></i>';
                    ratingRow.setAttribute("name", newBeerNameElement.innerText);
                    ratingIcons.setAttribute("onclick", "add_rating(this)");
                    ratingIcons.setAttribute("name", newBeerNameElement.innerText);
                    ratingIcons.setAttribute("data-value1", n);
                    ratingIcons.setAttribute("data-value2", p);
                    document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(iconRow).appendChild(ratingRow).appendChild(ratingIcons);
                }

                // average rating
                var averageUsersInfo = document.createElement('div');
                averageUsersInfo.className = "number_who_voted";
                document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(iconRow).appendChild(averageUsersInfo);

                // wishlist
                var wishlistIcon = document.createElement('i');
                wishlistIcon.className = "wishlist_heart";
                wishlistIcon.innerHTML = '<i class="fa fa-heart aria-hidden="true"></i>';
                wishlistIcon.setAttribute("onclick", "add_to_wishlist(this)");
                forWishlist.push(newBeerNameElement.innerText);
                wishlistIcon.setAttribute("name", newBeerNameElement.innerText);
                wishlistIcon.setAttribute("data-value", n);
                document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(iconRow).appendChild(wishlistIcon);

                // images
                var newBeerImage = document.createElement("img");
                newBeerImage.className = "image";
                var beerLink = beersArray[n]['beer_image'];
                newBeerImage.setAttribute("src", beerLink);
                document.getElementById('main').appendChild(beers).appendChild(beerimage).appendChild(newBeerImage);
            }
        }
        showBeers();

        // Load more stuff
        window.onscroll = function () {
            if ((window.innerHeight + (window.scrollY) + 10) >= document.body.scrollHeight) {
                if (document.body.scrollHeight < 34955) {
                    firstnumber += 15;
                    secondnumber += 15;

                    if (secondnumber <= numberOfBeers+5) {
                        showBeers();
                        showWishlist();
                        showRatings();
                    } else {
                        document.getElementById("to_top").style.display = "inline-block";
                        document.getElementById("loader").style.display = "none";
                    }
                } else {
                    document.getElementById("to_top").style.display = "inline-block";
                    document.getElementById("loader").style.display = "none";
                }
            }
        };
    });
}

function scrollToTop(){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function to_beer_view(d) {
    var encodedUrl = encodeURI(d.getAttribute("name"));
    window.open("beer_view.html?beer=" + encodedUrl, "_self");
}

// Show wishlist
function showWishlist() {
    var wishlistRef = firebase.database().ref('/wishlist').child(userAuth);
    wishlistRef.on('value', function(snapshot) {
        if (snapshot.exists()) {
            wishlistRef.on('value', function(snapshot) {
                var wishlistArray = snapshotToArray(snapshot);
                var count = wishlistArray.length;
                var allWishlistElements = [];

                // saidil olevad elemendid
                var i;
                for (i = 0; i < forWishlist.length; i++) {
                    var element = document.getElementsByClassName("wishlist_heart")[i].getAttribute("name");
                    if (element === null) {
                        // console.log("do nothing");
                    } else {
                        allWishlistElements.push(element);
                    }
                }

                // andmebaasis olevad elemendid
                for(n = 0; n < count; n++) {
                    var wishlistObject = wishlistArray[n];
                    changeColor();
                }

                function changeColor() {
                    var count2 = allWishlistElements.length;
                    if (allWishlistElements.includes(wishlistObject)) {
                        // saidil olevate elementide võtmine ja muutmine
                        for (var j = 0; j < count2; j++) {
                            var element2 = document.getElementsByClassName("wishlist_heart")[j].getAttribute("name");
                            if (element2 === wishlistObject) {
                                document.getElementsByClassName("wishlist_heart")[j].setAttribute("style", "color: #ff3e73");
                            } else {
                                // console.log("do nothing");
                            }
                        }
                    } else {}
                }

            })
        } else {
            console.log("kasutajal pole wishlisti objekti veel");
        }
    });
}

// add or remove from wishlist
function add_to_wishlist(d) {
    var x = d.getAttribute("data-value");
    var name = document.getElementsByClassName("wishlist_heart")[x].getAttribute("name");

    firebase.database().ref('/wishlist').child(userAuth).once('value', function(snapshot) {
        if (snapshot.exists()) {
            // console.log("kasutajal wishlist olemas");
            addOrRemoveFromWishlist(name, x);
        } else {
            // console.log("kasutajal pole wishlisti objekti veel");
            firebase.database().ref('wishlist/' + userAuth).set({
                0: name
            });
        }
    });
}

function addOrRemoveFromWishlist(name, x) {
    var wishlistRef = firebase.database().ref('/wishlist').child(userAuth);
    wishlistRef.once('value', function(snapshot) {
        var wishlistArray = snapshotToArray(snapshot);
        var count = wishlistArray.length;
        var inWishlistArray = [];

        for (i = 0; i < count; i++) {
            inWishlistArray.push(wishlistArray[i]);
        }

        // removinc or adding a new beer to wishlist
        if (inWishlistArray.includes(name)) {
            document.getElementsByClassName("wishlist_heart")[x].setAttribute("style", "color: #c2c2c2");
            document.getElementById("main").click();
            var beerIndex = wishlistArray.indexOf(name);
            wishlistArray.splice(beerIndex, 1);
            wishlistRef.set(wishlistArray);
        } else {
            wishlistArray.push(name);
            wishlistRef.set(wishlistArray);
        }
    });
}

var beerNamesFromSite = [];

function showRatings() {
    var ratingsRef = firebase.database().ref('/ratings');
    ratingsRef.on('value', function (snapshot) {
        var users = snapshot.val();
        var numberOfUsers = snapshot.numChildren();
        var allUsersSum;
        var allUsersRating;
        var allBeersFromDB = [];

        for (a = 0; a < numberOfUsers; a++) {
            var key = Object.keys(users)[a];
            var values = users[key];
            allBeersFromDB = allBeersFromDB.concat(values);
        }

        for (m = 0; m < forRatings.length; m++) {
            var beerNameFromSite = document.getElementsByClassName("beer_rating")[m].getAttribute("name");
            var oneBeerRatingsSum = 0;
            var oneBeerRatingsCount = 0;
            var oneBeerRatingsAverage;

            for (e = 0; e < allBeersFromDB.length; e++) {
                if (allBeersFromDB[e]["beer_name"] === beerNameFromSite) {
                    allUsersRating = allBeersFromDB[e]["rating"];
                    allUsersSum = parseInt(allUsersRating);
                    oneBeerRatingsSum += allUsersSum;
                    oneBeerRatingsCount += 1;
                } else {
                    // console.log("sellist pole veel hinnatud");
                }
            }
            oneBeerRatingsAverage = (oneBeerRatingsSum / oneBeerRatingsCount).toFixed(1);
            var oneBeerRatingsRoundedAverage = Math.round(oneBeerRatingsSum / oneBeerRatingsCount);

            for (u = 0; u < forRatings.length; u++) {
                var beerAttributeFromSite = document.getElementsByClassName("beer_rating")[u].getAttribute("name");

                if (beerAttributeFromSite === beerNameFromSite) {
                    var beerRatingElement = document.getElementsByClassName("beer_rating")[u];
                    var rating1 = document.getElementsByClassName("rating1")[u];
                    var rating2 = document.getElementsByClassName("rating2")[u];
                    var rating3 = document.getElementsByClassName("rating3")[u];
                    var rating4 = document.getElementsByClassName("rating4")[u];
                    var rating5 = document.getElementsByClassName("rating5")[u];
                }
            }

            if (isNaN(oneBeerRatingsAverage)) {
                oneBeerRatingsAverage = "0.0";
            }
            document.getElementsByClassName("number_who_voted")[m].innerText = oneBeerRatingsAverage + " (" + oneBeerRatingsCount + ")";

            beerRatingElement.setAttribute("data-value", oneBeerRatingsRoundedAverage);
            beerNamesFromSite.push(beerNameFromSite, oneBeerRatingsAverage);

            if (oneBeerRatingsRoundedAverage === 1) {
                rating1.setAttribute("style", "color: #1cceb6");
                rating2.setAttribute("style", "color: #d6d6d6");
                rating3.setAttribute("style", "color: #d6d6d6");
                rating4.setAttribute("style", "color: #d6d6d6");
                rating5.setAttribute("style", "color: #d6d6d6");
            } else if (oneBeerRatingsRoundedAverage === 2) {
                rating1.setAttribute("style", "color: #1cceb6");
                rating2.setAttribute("style", "color: #1cceb6");
                rating3.setAttribute("style", "color: #d6d6d6");
                rating4.setAttribute("style", "color: #d6d6d6");
                rating5.setAttribute("style", "color: #d6d6d6");
            } else if (oneBeerRatingsRoundedAverage === 3) {
                rating1.setAttribute("style", "color: #1cceb6");
                rating2.setAttribute("style", "color: #1cceb6");
                rating3.setAttribute("style", "color: #1cceb6");
                rating4.setAttribute("style", "color: #d6d6d6");
                rating5.setAttribute("style", "color: #d6d6d6");
            } else if (oneBeerRatingsRoundedAverage <= 4) {
                rating1.setAttribute("style", "color: #1cceb6");
                rating2.setAttribute("style", "color: #1cceb6");
                rating3.setAttribute("style", "color: #1cceb6");
                rating4.setAttribute("style", "color: #1cceb6");
                rating5.setAttribute("style", "color: #d6d6d6");
            } else if (oneBeerRatingsRoundedAverage <= 5) {
                rating1.setAttribute("style", "color: #1cceb6");
                rating2.setAttribute("style", "color: #1cceb6");
                rating3.setAttribute("style", "color: #1cceb6");
                rating4.setAttribute("style", "color: #1cceb6");
                rating5.setAttribute("style", "color: #1cceb6");
            } else {}
        }
    });
}

function add_rating(d) {
    var beerIdFromSite = d.getAttribute("data-value1");
    var name = document.getElementsByClassName("rating1")[beerIdFromSite].getAttribute("name");
    var ratingClicked = d.getAttribute("data-value2");

    firebase.database().ref('/ratings').child(userAuth).once('value', function(snapshot) {
        if (snapshot.exists()) {
            // console.log("kasutajal ratingud olemas");
            addOrChangeRating(beerIdFromSite, name, ratingClicked);
        } else {
            // console.log("kasutajal pole ratingute objekti veel");
            firebase.database().ref('ratings/' + userAuth).child("0").set({
                beer_name: name,
                rating: ratingClicked
            });

            var rating1 = document.getElementsByClassName("rating1")[beerIdFromSite];
            var rating2 = document.getElementsByClassName("rating2")[beerIdFromSite];
            var rating3 = document.getElementsByClassName("rating3")[beerIdFromSite];
            var rating4 = document.getElementsByClassName("rating4")[beerIdFromSite];
            var rating5 = document.getElementsByClassName("rating5")[beerIdFromSite];

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

function addOrChangeRating(beerIdFromSite, name, ratingClicked) {
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
                ratingKey = ratingsArray[i].key;
                originalRating = ratingsArray[i]['rating'];
            } else {}

        }

        // overwrite existing rating
        if (siteRatingsArray.includes(name)) {
            firebase.database().ref('ratings/' + userAuth).child(ratingKey).set({
                beer_name: name,
                rating: ratingClicked
            });

        // add new rating
        } else {
            firebase.database().ref('ratings/' + userAuth).child(count).set({
                beer_name: name,
                rating: ratingClicked
            });
        }
    });

    var beerNameFromSite = document.getElementsByClassName("beer_rating")[beerIdFromSite].getAttribute("name");
    var rating1 = document.getElementsByClassName("rating1")[beerIdFromSite];
    var rating2 = document.getElementsByClassName("rating2")[beerIdFromSite];
    var rating3 = document.getElementsByClassName("rating3")[beerIdFromSite];
    var rating4 = document.getElementsByClassName("rating4")[beerIdFromSite];
    var rating5 = document.getElementsByClassName("rating5")[beerIdFromSite];

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
    } else {}

}
