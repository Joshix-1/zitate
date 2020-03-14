var rating = "https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/bewertung_zitate.json"
var authors = "https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/namen.txt"
var quotes = "https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/zitate.txt"

window.q = [];
window.r = [];

var getQuote = function(data) {
    q.push(data.split(/\n/));
    if(window.q.length==2 && window.r.length==1) createZitat();
};
var getRating = function(data) {
    r.push(JSON.parse(data));
    if(window.q.length==2 && window.r.length==1) createZitat();
};

$.get(authors, getQuote, 'text');
$.get(quotes, getQuote, 'text');
$.get(rating, getRating, 'text');

$(".get-quote").on("click", function() {
    createZitat();
});

function createZitat()
{
    var a = Math.floor(Math.random() * window.q[0].length);
    var q = Math.floor(Math.random() * window.q[1].length);
    var z = q+"-"+a; //Zitat-ID
    if(window.r[0][z] === undefined) createZitat(); //Keine neuen Zitate (does not always work)
    else {
        var theAuthor = window.q[0][a];
        var theQuote = window.q[1][q];
        $(".quote-text").text(theQuote);
        $(".quote-author").text("- " + theAuthor);
        $(".quote-id").text(z);
        $(".quote-rating").text("Rating: "+window.r[0][z]);

        $(".tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent(theQuote + ' - ' + theAuthor + "\nGenerated by https://github.com/asozialesnetzwerk/zitate"));
    }
}
