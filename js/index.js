$(".quote-text").text("");
$(".quote-author").text("");

$(document).ready(function () {
    $('select').niceSelect();
});

var rating = "bewertung_zitate.json";
var authors = "namen.txt";
var quotes = "zitate.txt";

window.q = [];
window.r = [];

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function saveAsImg() {
    html2canvas(document.getElementById('quote-important'), {scrollX: 0,scrollY: -window.scrollY, allowTaint: true, backgroundColor: "#000000"}).then(function (canvas) {
        var a = document.createElement("a"); //Create <a>
        a.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'); //Image Base64
        a.download = "Zitat_(" + $(".quote-id").text() + ")_asozialesnetzwerk.github.io.png"; //File name
        a.click(); //Downloaded file
    });
}

function getUrlParam(parameter, defaultvalue) {
    if (window.location.href.indexOf(parameter) > -1) {
        return getUrlVars()[parameter];
    } else {
        return defaultvalue;
    }
}

function displayZitat(id) {
    var ids = id.split("-");
    
    var theQuote = window.q[1][ids[0]];
    var theAuthor = window.q[0][ids[1]];
    var ratingUndefined = window.r[0][id] == undefined;
    var rating = ((ratingUndefined) ? 0 : window.r[0][id]);
    
    $(".quote-text").text(theQuote);
    $(".quote-text").attr("onClick", "window.open('https://ddg.gg/?q=" +  encodeURIComponent(theQuote) + "')");
    $(".quote-author").text("- " + theAuthor);
    $(".quote-author").attr("onClick", "window.open('https://ddg.gg/?q=" +  encodeURIComponent(theAuthor) + "')");

    $(".quote-id").text(id);
    $(".quote-rating").text((ratingUndefined) ? "—" : Math.abs(window.r[0][id]) + " x   ");
    $(".quote-rating").append((ratingUndefined) ? '' : '<img class="rating-image" src="css/Stempel' + ((rating < 0) ? 'Nicht' : '') + 'Witzig.svg" onload="SVGInject(this)"/>'); //width="auto" height="42"    onerror="SVGInject.err(this, "image.png")
    
    if (rating < 0) {
        $(".rating-image").css("bottom","0.008rem");
        $(".rating-image").css("fill", "#DC143C"); //$(".rating-image").css("filter", "brightness(0) invert(1) sepia(1000) saturate(10000) hue-rotate(107deg) invert(84%) brightness(69%)"); //"-webkit-filter"
    } else {
        $(".rating-image").css("top","0.01rem");
        if (rating > 0) {
            $(".rating-image").css("fill", "#228B22"); //$(".rating-image").css("filter", 'brightness(0) invert(1) sepia() saturate(10000%) hue-rotate(30deg) brightness(60%)'); //"-webkit-filter"
        } else {
            $(".rating-image").css("fill", "#b8b7b6");
        }
    }
        
    $(".tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent(theQuote + ' - ' + theAuthor + "\nGenerated by " + window.location.href));
}

function getUrlWithoutParam() {
    var end = window.location.href.indexOf('?');
    return window.location.href.substring(0, (end < 0) ? window.location.href.length : end);
}

function getUrlWithId(value) {
    var rating = getUrlParam("rating", "");
    if (!(rating === "")) rating = "&rating=" + rating;
    return getUrlWithoutParam() + "?id=" + value + rating;
}

function getUrlWithRating(value) {//w; all; rated; n
    var id = getUrlParam("id", "");
    return getUrlWithoutParam() + "?id=" + ((id=== "") ? getRandomZitatId() : id) + "&rating=" + value;
}

function getRandomZitatId() {
    return Math.floor(Math.random() * window.q[1].length) + '-' + Math.floor(Math.random() * window.q[0].length);
}

function getZitatUrl() {
    var paramRating = getUrlParam("rating", "w");
    if (paramRating === "all") {
        return getUrlWithId(getRandomZitatId());
    }
    var keys = Object.keys(window.r[0]);
    var z;
    do {
        z = Math.floor(Math.random() * keys.length);
    } while ((window.r[0][keys[z]] <= 0 && paramRating === "w") || (window.r[0][keys[z]] >= 0 && paramRating === "n") || (window.r[0][keys[z]] === 0 && paramRating === "rated")); //Bis richtiges Zitat gefunden
    
    return getUrlWithId(keys[z]);
}

function checkLoad() {
    if (window.q.length === 2 && window.r.length === 1) {
        var id = getUrlParam("id", "");
        if (id.indexOf('-') < 1) id = getUrlParam("tag", "");
        if (id.indexOf('-') < 1) window.location = getZitatUrl(); 
        else {
            displayZitat(id);
            $(".get-quote").attr("href", getZitatUrl()); //adds next zitat to button 
        }
    }
}

var getQuote = function (data) {
    window.q.push(data.split(/\n/));
    checkLoad();
};

var getRating = function (data) {
    window.r.push(JSON.parse(data));
    checkLoad();
};

$.get(rating, getRating, 'text');
$.get(authors, getQuote, 'text');
$.get(quotes, getQuote, 'text');

$(".rating-param").val(getUrlParam("rating", "w"));
if($(".rating-param").val() === null) window.location = getUrlWithRating("w");

$(".rating-param").change(function () {
    if (!($(this).val() === "" || $(this).val() === getUrlParam("rating", "text"))) window.location = getUrlWithRating($(this).val());
});

$(".download").on("click", function() {
	saveAsImg();
});