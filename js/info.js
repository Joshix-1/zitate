const duckduckgoApiUrl = "https://api.duckduckgo.com/?format=json&t=FalscheZitateWebApp&q=";

const list = $(".list");
const text = $(".info-text");
const searchContainer = $(".search-container");
const selectType = $(".select");
const infoContainer = $(".info-container");

text.text("");

let id;

const app = $.sammy(function() {
    this.get("#/:author/:id", function() {
        id = this.params["id"];

        if(this.params["author"].toLowerCase() === "zitat") {
            id = id + "-";
        } else {
            id = "-" + id;
        }
        setSelection(selectType, getFilter(isAuthor(id)));
        runCode();
    });
});
app.run();

function showSearch(boo) {
    if(boo) {
        changeVisibility(searchContainer, true);
        infoContainer.removeClass("alone");
    } else {
        changeVisibility(searchContainer, false);
        infoContainer.addClass("alone");
    }
}

var lastSearch = -1;
var lastSearchDisplayed = false;
//more info: https://duckduckgo.com/api
function displaySearchResult(searchParam) {
    if(searchParam === undefined || !windowIsLandscape()) {
        showSearch(false);
    } else if(lastSearch === searchParam) {
        showSearch(lastSearchDisplayed);
    } else {
        $.getJSON(duckduckgoApiUrl + searchParam, respondJson => {
            searchContainer.children().remove();
            if (respondJson["Abstract"].length === 0) {
                lastSearchDisplayed = false;
            } else {
                const elementPoweredBy = document.createElement("strong");
                elementPoweredBy.innerHTML = "Folgender Text ist präsentiert von <a href='https://ddg.gg/DuckDuckGo'>DuckDuckGo <img alt='DuckDuckGo Logo' width='21px' height='21px' src='https://duckduckgo.com/assets/common/dax-logo.svg'</a>:<br>";
                searchContainer.append(elementPoweredBy);

                const element = document.createElement("p");
                element.innerHTML = respondJson["AbstractText"] + " (Quelle: ";

                const linkToSource = document.createElement("a");
                linkToSource.href = respondJson["AbstractURL"];
                linkToSource.textContent = respondJson["AbstractSource"];
                element.append(linkToSource);

                element.append(")")

                searchContainer.append(element);

                lastSearchDisplayed = true;
            }
            showSearch(lastSearchDisplayed);
        });
        lastSearch = searchParam;
    }
}

function getText(id) {
    return isAuthor(id) ? authorsArr[id.replace("-", "")] : quotesArr[id.replace("-", "")];
}

function getFilter(isAuthor) {
    return isAuthor ? "Autor" : "Zitat"
}

function isAuthor(id) {
    return id.startsWith("-");
}

function getBaseUrl() {
    let url = window.location.href;
    window.location.href.toLowerCase().replace(/.+\/info/, function (match) {
        url =  match + "/#/";
    });
    return url;
}

function getPlainId(id) {
    return id.replace("-", "");
}

function getUrlWithIdAndFilter(id, filter) {
    return getBaseUrl() + filter + "/" + getPlainId(id);
}

function getRandomUrl() {
    const isAuthor = Math.random() >= 0.5;
    return getBaseUrl() + getFilter(isAuthor) + "/" + Math.floor(Math.random() * (isAuthor ? authorsArr.length : quotesArr.length));
}

function getFalschesZitat(zitatId) {
    let ids = zitatId.split("-");
    if(ids.length < 2 || !hasLoaded()) return "";
    return quotesArr[ids[0]] + "<br>  - " + authorsArr[ids[1]];
}

function addToList(text) {
    const element = document.createElement("li");
    const element2 = document.createElement("p");
    element2.innerHTML = text;
    element2.className = "text";
    element.appendChild(element2);
    list.append(element);
}

function runCode() {
    if(!hasLoaded()) return;

    if(id === undefined) {
        console.log("Id wasn't defined.");
        window.location = getRandomUrl();
        return;
    }

    const keys = Object.keys(ratingJson);

    let regexId;
    if(isAuthor(id)) {
        //URL should end with: /zitate/info/#/zitat/69
        regexId = new RegExp("^\\d{0,4}" + id + "$")
    } else {
        //URL should end with: /zitate/info/#/autor/69
        regexId = new RegExp("^" + id + "\\d{0,4}$");
    }

    const zitatIdArr = keys.filter(s => regexId.test(s)) //filters all which contain author/quote
        .sort((a, b) => ratingJson[b] - ratingJson[a]); //sort them top to bottom


    list.children().remove();

    let thisText = getText(id);
    displaySearchResult(thisText);
    thisText = "<a href='https://ddg.gg/" + encodeURI(thisText) + "'>" + thisText + "</a>";

    if(zitatIdArr.length === 0) {
        text.text("Es wurde kein bewertetes falsches Zitat mit folgendem " + getFilter(isAuthor(id)) + " gefunden: ");
        text.append(thisText);
        return;
    } else {
        text.text("Hier findest du alle bewerteten falschen Zitate mit folgendem " + getFilter(isAuthor(id)) + ": ");
        text.append(thisText);
    }

    for (let i = 0; i < zitatIdArr.length; i++) {
        addToList(getFalschesZitat(zitatIdArr[i]) + "<br>ID = '" + zitatIdArr[i] + "', Bewertung = '" + ratingJson[zitatIdArr[i]] + "'");
    }
}

selectType.change(function () {
    window.location = getUrlWithIdAndFilter(id, selectType.val());
    runCode();
});

window.addEventListener("orientationchange", function() {
    console.log(windowIsLandscape());
    if(windowIsLandscape()) {
        console.log(getText(id));
        displaySearchResult(getText(id));
    }
}, false);

//starts loading process:
loadFiles();