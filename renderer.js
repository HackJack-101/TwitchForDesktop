var timeoutResize;
var baseURL = "https://api.twitch.tv/kraken";
var content;

function doneResizing() {
    var iframe = document.getElementById("iframe");
    var dim = content.getBoundingClientRect();
    if (iframe) {
        iframe.setAttribute("width", dim.width);
        iframe.setAttribute("height", dim.height);
    }
}

function createElement(tag, attributes, innerHTML) {
    var e = document.createElement(tag);
    for (var i = 0, iMax = attributes.length; i < iMax; i++) {
        var name = attributes[i].name;
        var value = attributes[i].value;
        e.setAttribute(name, value);
    }
    if (innerHTML) {
        e.innerHTML = innerHTML;
    }
    return e;
}

function disableInput() {
    var inputs = document.querySelectorAll("input");
    for (var i = 0, iMax = inputs.length; i < iMax; i++) {
        var input = inputs[i];
        input.setAttribute("disabled", "");
    }
}

function removeChildren(e) {
    while (e.firstChild) {
        e.removeChild(e.firstChild);
    }
}

function clearContent() {
    removeChildren(document.getElementById("content"));
}

function enableInput() {
    var inputs = document.querySelectorAll("input");
    for (var i = 0, iMax = inputs.length; i < iMax; i++) {
        var input = inputs[i];
        input.removeAttribute("disabled");
    }
}

function getHTTP(url, callback, data) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function (e) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                callback(req, data);
            }
        }
    };
    req.send(null);
}

function openFollowing() {
    var username = localStorage.getItem('username');
    if (!username) {
        openParameters();
    } else {
        clearContent();
        createMenu();
        var following = createElement('div', [{name: "id", value: "following"}]);
        content.appendChild(following);
        getHTTP(baseURL + '/users/' + username + '/follows/channels?limit=100', function (result) {
            var res = JSON.parse(result.responseText);
            var follows = res.follows;
            for (var i = 0, iMax = follows.length; i < iMax; i++) {
                var name = follows[i].channel.name;
                getHTTP(baseURL + '/streams/' + name, function (result) {
                    var res = JSON.parse(result.responseText);
                    var e = res.stream;
                    if (e !== null) {
                        var parent = createElement('div', [{name: "class", value: "stream"}]);
                        var img = createElement('img', [{name: "src", value: e.preview.medium}, {name: "data-profile", value: e.channel.name}]);
                        var status = createElement('div', [{name: "class", value: "status"}], e.channel.status);
                        var subtitle = createElement('div', [{name: "class", value: "subtitle"}]);
                        var viewers = createElement('span', [{name: "class", value: "viewers"}], e.viewers + " viewers on ");
                        var profile = createElement('a', [{name: "class", value: "viewers"}, {name: "data-profile", value: e.channel.name}], e.channel.display_name);
                        parent.addEventListener("click", function () {
                            openProfile(this.getAttribute("data-profile"));
                        });
                        subtitle.appendChild(viewers);
                        subtitle.appendChild(profile);
                        img.addEventListener("click", function () {
                            openStream(this.getAttribute("data-profile"));
                        });
                        parent.appendChild(img);
                        parent.appendChild(status);
                        parent.appendChild(subtitle);
                        following.appendChild(parent);
                    }
                }, {});
            }
        }, {});
    }
}

function search(query) {
    clearContent();
    createMenu();
    var searchResults = createElement('div', [{name: "id", value: "searchResults"}]);
    content.appendChild(searchResults);
    getHTTP(baseURL + '/streams?limit=20&game=' + encodeURI(query), function (result) {
        var res = JSON.parse(result.responseText);
        var streams = res.streams;
        for (var i = 0, iMax = streams.length; i < iMax; i++) {
            var e = streams[i];
            var parent = createElement('div', [{name: "class", value: "stream"}]);
            var img = createElement('img', [{name: "src", value: e.preview.medium}, {name: "data-profile", value: e.channel.name}]);
            var status = createElement('div', [{name: "class", value: "status"}], e.channel.status);
            var subtitle = createElement('div', [{name: "class", value: "subtitle"}]);
            var viewers = createElement('span', [{name: "class", value: "viewers"}], e.viewers + " viewers on ");
            var profile = createElement('a', [{name: "class", value: "viewers"}, {name: "data-profile", value: e.channel.name}], e.channel.display_name);
            parent.addEventListener("click", function () {
                openProfile(this.getAttribute("data-profile"));
            });
            subtitle.appendChild(viewers);
            subtitle.appendChild(profile);
            img.addEventListener("click", function () {
                openStream(this.getAttribute("data-profile"));
            });
            parent.appendChild(img);
            parent.appendChild(status);
            parent.appendChild(subtitle);
            searchResults.appendChild(parent);
        }
    }, {});
}

function loadTopGames() {
    clearContent();
    createMenu();
    var topGames = createElement('div', [{name: "id", value: "topGames"}]);
    content.appendChild(topGames);
    getHTTP(baseURL + '/games/top?limit=21', function (result) {
        var res = JSON.parse(result.responseText);
        var top = res.top;
        for (var i = 0, iMax = top.length; i < iMax; i++) {
            var e = top[i];
            var parent = createElement('div', [{name: "class", value: "game"}, {name: "data-query", value: e.game.name}]);
            var img = createElement('img', [{name: "src", value: e.game.box.large}]);
            var game = createElement('div', [{name: "class", value: "gameName"}], e.game.name);
            var viewers = createElement('div', [{name: "class", value: "viewers"}], e.viewers + " viewers");
            parent.addEventListener("click", function () {
                search(this.getAttribute("data-query"));
            });
            parent.appendChild(img);
            parent.appendChild(game);
            parent.appendChild(viewers);
            topGames.appendChild(parent);
        }
    }, {});
}

function openStream(profile) {
    clearContent();
    createMenu();
    getHTTP(baseURL + '/streams/' + profile, function (result) {
        var res = JSON.parse(result.responseText);
        if (res.stream !== null) {
            var dim = content.getBoundingClientRect();
            var attr = [
                {name: "src", value: "http://player.twitch.tv/?channel=" + profile},
                {name: "id", value: "iframe"},
                {name: "frameborder", value: "no"},
                {name: "scrolling", value: "no"},
                {name: "allowfullscreen", value: "true"},
                {name: "width", value: dim.width},
                {name: "height", value: dim.height}
            ];
            var stream = createElement('iframe', attr);
            content.appendChild(stream);
            window.addEventListener('resize', function () {
                clearTimeout(timeoutResize);
                timeoutResize = setTimeout(doneResizing, 25);
            });
        }
    }, {});
}

function createMenu() {
    var menu = createElement('nav', [{name: "id", value: "menu"}]);
    var brand = createElement('div', [{name: "id", value: "brand"}, {name: "class", value: "pointer"}], "Twitch for Desktop");
    brand.addEventListener("click", loadTopGames);
    var submenu = createElement('div', [{name: "id", value: "submenu"}]);
    var games = createElement('div', [{name: "id", value: "games"}, {name: "class", value: "pointer"}], "Games");
    games.addEventListener("click", loadTopGames);
    var followings = createElement('div', [{name: "id", value: "followings"}, {name: "class", value: "pointer"}], "Following");
    followings.addEventListener("click", openFollowing);
    var parameters = createElement('div', [{name: "id", value: "parameters"}, {name: "class", value: "pointer"}], "Parameters");
    parameters.addEventListener("click", openParameters);
    var searchBar = createElement('div', [{name: "id", value: "searchBar"}, {name: "class", value: "pointer"}]);
    menu.appendChild(brand);
    submenu.appendChild(followings);
    submenu.appendChild(games);
    submenu.appendChild(parameters);
    submenu.appendChild(searchBar);
    menu.appendChild(submenu);
    content.appendChild(menu);
}

function openParameters() {
    document.getElementById("overlay").style.display = "flex";
}

function loadParameters() {
    document.getElementById("closeModal").addEventListener("click", function () {
        document.getElementById("overlay").style.display = "none";
    });
    var username = localStorage.getItem('username');
    if (!username) {
        username = "";
    }
    document.getElementById('username').value = username;
    document.getElementById("saveParameters").addEventListener("click", function () {
        document.getElementById("overlay").style.display = "none";
        localStorage.setItem('username', document.getElementById("username").value);
    });
}

function main() {
    content = document.getElementById("content");
    loadTopGames();
    loadParameters();
}

window.addEventListener('load', main, true);