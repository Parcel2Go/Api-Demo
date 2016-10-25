p2GoApp.controller('tokenController', ['TokenService', '$location', function (TokenService, $location) {
    var token = {
        token : $location.search()['access_token'],
        expires: $location.search()['expires_in'],
        scope: $location.search()['scope']
    };

    TokenService.set(token);

    $location.url($location.path());
    $location.path('/');
}]);