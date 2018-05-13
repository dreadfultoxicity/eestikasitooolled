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
    console.log(userAuth);
    console.log("username: " + user.displayName);
    readWishlistData();
}

window.onload = login;

// get elements
var dbRefObject = firebase.database().ref('beers').child('beer1');
var dbRefBeerName = dbRefObject.child('beer_name');

function snapshotToArray(snapshot) {
    var returnArr = [];
    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });
    return returnArr;
}

var wishlistArray;

function readWishlistData() {
    var wishlistRef = firebase.database().ref('/wishlist').child(userAuth);
    wishlistRef.once('value', function(snapshot) {
        if (snapshot.exists()) {
            console.log("kasutajal wishlist olemas");
            wishlistRef.once('value', function(snapshot) {
                wishlistArray = snapshotToArray(snapshot);
                console.log(wishlistArray);
                document.getElementById("loader").style.display = "none";
                displayBeers();
            });
        } else {
            console.log("kasutajal pole wishlisti objekti loodud");
            document.getElementById("empty_container").style.display = "block";
            document.getElementById("empty_wishlist").style.display = "block";
            document.getElementById("loader").style.display = "none";
        }

    });
}

var beerImages = [];
var beersArray = [];

function displayBeers() {
    var beersRef = firebase.database().ref('/beers').orderByChild('beer_name');
    beersRef.once('value', function(snapshot) {
    beersArray = snapshotToArray(snapshot);

    wishlistArray.sort();
    getBeerImages();

    for (n = 0; n < wishlistArray.length; n++) {

        var wishlistBeer = wishlistArray[n];

        var beers = document.createElement('div');
        beers.className = "beers";
        var beerinfo = document.createElement('div');
        beerinfo.className = "beer_info";

        // beer name
        var newBeerNameElement = document.createElement('div');
        newBeerNameElement.className = "beer_name";
        newBeerNameElement.innerHTML = wishlistBeer;
        newBeerNameElement.setAttribute("onclick", "to_beer_view(this)");
        newBeerNameElement.setAttribute("name", wishlistBeer);
        document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(newBeerNameElement);

        // wishlist
        var wishlistIcon = document.createElement('i');
        wishlistIcon.className = "in_wishlist";
        wishlistIcon.innerHTML = '<i class="fa fa-heart aria-hidden="true"></i>';
        wishlistIcon.setAttribute("onclick", "add_to_wishlist(this)");
        wishlistIcon.setAttribute("name", newBeerNameElement.innerText);
        wishlistIcon.setAttribute("data-value", n);
        document.getElementById('main').appendChild(beers).appendChild(beerinfo).appendChild(wishlistIcon);

        for (x = 0; x < beerImages.length; x+=2) {
            if (beerImages[x] === wishlistBeer) {
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
});
}

function getBeerImages() {
    for (i = 0; i < beersArray.length; i++) {
        beerImages.push(beersArray[i]['beer_name']);
        beerImages.push(beersArray[i]['beer_image']);
    }
}

function add_to_wishlist(d) {
    console.log(d.getAttribute("data-value"));
    var x = d.getAttribute("data-value");
    var name = document.getElementsByClassName("in_wishlist")[x].getAttribute("name");

    firebase.database().ref('/wishlist').child(userAuth).once('value', function(snapshot) {
        if (snapshot.exists()) {
            console.log("kasutajal wishlist olemas");
            addOrRemoveFromWishlist(name, x);
        } else {
            console.log("kasutajal pole wishlisti objekti veel");
            firebase.database().ref('wishlist/' + userAuth).set({
                0: name
            });
            document.getElementsByClassName("in_wishlist")[0].setAttribute("style", "color: #ff3e73");
        }
    });
}

function addOrRemoveFromWishlist(name, x) {
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
        if (inWishlistArray.includes(name)) {
            console.log("Selline juba on");
            document.getElementsByClassName("in_wishlist")[x].setAttribute("style", "color: #c2c2c2");
            var beerIndex = wishlistArray.indexOf(name);
            console.log(beerIndex);
            console.log(document.getElementsByClassName("in_wishlist")[x].getAttribute("name"));
            wishlistArray.splice(beerIndex, 1);
            console.log(wishlistArray);
            wishlistRef.set(wishlistArray);
        } else {
            console.log("Sellist pole");
            document.getElementsByClassName("in_wishlist")[x].setAttribute("style", "color: #ff3e73");
            wishlistArray.push(name);
            wishlistRef.set(wishlistArray);
        }
    });
}

function to_beer_view(d) {
    var encodedUrl = encodeURI(d.getAttribute("name"));
    window.open("beer_view.html?beer=" + encodedUrl, "_self");
}



