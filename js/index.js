const quoteText = $(".quote-text");
const quoteAuthor = $(".quote-author");

quoteText.text("");
quoteAuthor.text("");

const ratingParam = $(".rating-param");
const quoteId = $(".quote-id");
const nextQuote = $(".get-quote");
const tweetButton = $(".tweet");
const quoteRating = $(".rating-text");
const witzig = $(".witzig");
const nichtWitzig = $(".nicht-witzig");

$(document).ready(function () {
    $('select').niceSelect();
});

const rating = "bewertung_zitate.json";
const authors = "namen.txt";
const quotes = "zitate.txt";

window.q = [];
window.r = [];
let id;

const app = $.sammy(function() {
    this.get("#/:id", function() {
        id = this.params["id"];
        displayZitat();
    });

    this.get("/", function () {
        window.location = getNewZitatUrl();
    });

    this.get("/#", function () {
        window.location = getNewZitatUrl();
    });
});
app.run();

function hasLoaded() {
    return window.q.length === 2 && window.r.length === 1;
}

function getUrlVars() {
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultValue) {
    if (window.location.href.indexOf(parameter) > -1) {
        return getUrlVars()[parameter];
    } else {
        return defaultValue;
    }
}

function saveAsImg() {
    html2canvas(document.getElementById('quote-important'), {scrollX: 0,scrollY: -window.scrollY, allowTaint: true, backgroundColor: "#000000"}).then(function (canvas) {
        let a = document.createElement("a"); //Create <a>
        a.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'); //Image Base64
        a.download = "Zitat_(" + id + ")_asozialesnetzwerk.github.io.png"; //File name
        a.click(); //Downloaded file
    });
}

function changeVisibility(element, visible) {
    const isInvisible = element.hasClass("invisible");
    if(visible === !isInvisible) {
        return;
    }
    if(visible && isInvisible) {
        element.removeClass("invisible");
    } else if (!visible && !isInvisible) {
        element.addClass("invisible");
    }
}

let oldRating;
function displayZitat() {
    if(!hasLoaded() || !checkId()) return;
    nextQuote.attr("href", getNewZitatUrl());

    const ids = id.split("-");
    
    let theQuote = window.q[1][ids[0]] ;
    const theAuthor = window.q[0][ids[1]];
    theQuote = "»" + theQuote.substr(1, theQuote.lastIndexOf('"') - 1) + "«";

    const ratingUndefined = window.r[0][id] === undefined;
    const rating = ((ratingUndefined) ? 0 : window.r[0][id]);
    
    quoteText.text(theQuote);
    quoteText.attr("onClick", "window.open('https://ddg.gg/?q=" +  encodeURIComponent(theQuote) + "')");
    quoteAuthor.text("- " + theAuthor);
    quoteAuthor.attr("onClick", "window.open('https://ddg.gg/?q=" +  encodeURIComponent(theAuthor) + "')");

    $('meta[property="og:description"]').remove();
    $('head').append('<meta property="og:description" content=\'' + theQuote + '\n- ' + theAuthor + '\'>' );

    quoteId.text(id);
    if(rating !== oldRating) {
        quoteRating.text((ratingUndefined) ? "—" : Math.abs(window.r[0][id]) + " x   ");
        if(!ratingUndefined) {
            if (rating < 0) {
                changeVisibility(witzig, false);
                changeVisibility(nichtWitzig, true);
            } else if (rating === 0) {
                changeVisibility(witzig, false);
                changeVisibility(nichtWitzig, false);
            } else {
                changeVisibility(witzig, true);
                changeVisibility(nichtWitzig, false);
            }
        }
    }
    oldRating = rating;

    tweetButton.attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent(theQuote + ' - ' + theAuthor + "\nGenerated by " + window.location.href));
}

function getUrlWithoutParam() {
    let url = window.location.href;
    window.location.href.toLowerCase().replace(/.+\/zitate/, function (match) {
        url =  match + "/#/";
    });
    return url;
}

function getUrlWithId(value) {
    let rating = getUrlParam("rating", "");
    return getUrlWithoutParam() + value + (rating === "" ? "" : "?rating=" + rating);
}

function getUrlWithRating(value) {//w; all; rated; n
    return getUrlWithoutParam()  + id + (value === "" ? "" : "?rating=" + value);
}

function getRandomZitatId() {
    return Math.floor(Math.random() * window.q[1].length) + '-' + Math.floor(Math.random() * window.q[0].length);
}

function getNewZitatUrl() {
    const paramRating = getUrlParam("rating", "w");
    if (paramRating === "all") {
        let newId;
        do {
            newId = getRandomZitatId();
        } while (newId === id);
        return getUrlWithId(newId);
    }
    const keys = Object.keys(window.r[0]);
    let z;
    do {
        z = Math.floor(Math.random() * keys.length);
    } while ((window.r[0][keys[z]] <= 0 && paramRating === "w") || (window.r[0][keys[z]] >= 0 && paramRating === "n") || (window.r[0][keys[z]] === 0 && paramRating === "rated") || (keys[z] === id)); //Bis richtiges Zitat gefunden
    
    return getUrlWithId(keys[z]);
}

const id_regex = /^\d{1,4}-\d{1,4}$/; //1234-1234
function isValidId(val) {
    if(val === undefined || val === null || id === "") {
        return false;
    }
    if(id_regex.test(val)) {
        if(hasLoaded()) {
            const ids = id.split('-');
            return ids[0] < window.q[1].length && ids[1] < window.q[0].length;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

function checkId() {
    if(isValidId(id)) {
        return true;
    } else {
        const id2 = getUrlParam("id", "");
        if(isValidId(id2)) {
            window.location = getUrlWithId(id2);
        } else {
            if(id !== undefined && id !== null) {
                console.log("Given id (" + id + ") is invalid.");
            }
            window.location = getNewZitatUrl();
        }
        return false;
    }
}

function checkLoad() {
    if (hasLoaded()) {
        checkId();
        displayZitat();
    }
}

const getQuote = function (data) {
    window.q.push(data.split(/\n/));
    checkLoad();
};

const getRating = function (data) {
    window.r.push(JSON.parse(data));
    checkLoad();
};

$.get(rating, getRating, 'text');
$.get(authors, getQuote, 'text');
$.get(quotes, getQuote, 'text');

ratingParam.val(getUrlParam("rating", "w"));
if(ratingParam.val() === null) window.location = getUrlWithRating("w");

ratingParam.change(function () {
    if (!(ratingParam.val() === "" || ratingParam.val() === getUrlParam("rating", "text"))) {
        window.location = getUrlWithRating(ratingParam.val());
    }
});

$(".download").on("click", function() {
	saveAsImg();
});