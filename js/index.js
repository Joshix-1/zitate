var rating = "bewertung_zitate.json";
var authors = "namen.txt";
var quotes = "zitate.txt";

window.q = [];
window.r = [];

$(".quote-text").text("");
$(".quote-author").text("");

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function saveAsImg() {
    html2canvas(document.body).then(function(canvas) {
        document.body.appendChild(canvas);
    });
}

function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1) urlparameter = getUrlVars()[parameter];
    return urlparameter;
}

function displayZitat(id) {
    var ids = id.split("-");
    
    var theQuote = window.q[1][ids[0]];
    var theAuthor = window.q[0][ids[1]];
    var rating = window.r[0][id];
    
    if(rating == undefined) rating = "-";
    
    $(".quote-text").text(theQuote);
    $(".quote-author").text("- " + theAuthor);
    $(".quote-id").text(id);
    $(".quote-rating").text("Rating: " + rating);

    $(".tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent(theQuote + ' - ' + theAuthor + "\nGenerated by " + window.location.href));
}

function getUrlWithoutParam() {
    var end = window.location.href.lastIndexOf('dex.html');
    if(end < 0) end = window.location.href.lastIndexOf("/zitate/")
    if(end < 0) end = window.location.href.length;
    return window.location.href.substring(0, end + 8);
}

function getUrlWithId(value) {
    var rating = getUrlParam("rating", "");
    if(!(rating === "")) rating = "&rating=" + rating;
    return getUrlWithoutParam() + "?id=" + value + rating;
}

function getUrlWithRating(value) {//w; all; rated; n
    var id = getUrlParam("id", "");
    if(!(id === "")) id = "&id=" + id;
    return getUrlWithoutParam() + "?rating=" + value + id;
}

function getZitatUrl() {
    var paramRating = getUrlParam("rating", "w");
    if(paramRating === "all") return getRandomZitatUrl();
    var keys = Object.keys(window.r[0]);
    var z;
    do {
        z = Math.floor(Math.random() * keys.length);
    } while ((window.r[0][keys[z]] <= 0 && paramRating === "w") || (window.r[0][keys[z]] >= 0 && paramRating === "n") || (window.r[0][keys[z]] === 0 && paramRating === "rated")); //Bis richtiges Zitat gefunden
    
    return getUrlWithId(keys[z])
}

function getRandomZitatUrl() {
    return getUrlWithId(Math.floor(Math.random() * window.q[1].length) + '-' + Math.floor(Math.random() * window.q[0].length));
}

function checkLoad() {
    if (window.q.length == 2 && window.r.length == 1) {
        var id = getUrlParam("id", "");
        if(id.indexOf('-') < 1) id = getUrlParam("tag", "");
        if(id.indexOf('-') < 1) window.location = getZitatUrl();
        else {
            displayZitat(id);
            $(".get-quote").attr("href", getZitatUrl()); //adds next zitat to button 
            saveAsImg();
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

$(".rating_param").change(function(){
    if(!($(this).val() === "" || $(this).val() === getUrlParam("rating", "text"))) window.location = getUrlWithRating($(this).val());
});

$(document).ready(function() {
  $('select').niceSelect();
});

$(".rating_param").val(getUrlParam("rating", "w"));