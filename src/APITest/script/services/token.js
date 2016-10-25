p2GoApp.service('TokenService', function () {
    var token = null;
    var observerCallbacks = [];

    var notifyObservers = function (token) {
        angular.forEach(observerCallbacks, function (callback) {
            callback(token);
        });
    };

    return {
        set: function (v) { token = v; localStorage.setItem("token", JSON.stringify(token)); notifyObservers(token); },
        get: function () { return (token == null && localStorage.getItem("token") ? token = JSON.parse(localStorage.getItem("token")) : token); },
        registerObserverCallback: function (callback) { observerCallbacks.push(callback); },
        isLoggedIn: function () { return token != null }
    };
});