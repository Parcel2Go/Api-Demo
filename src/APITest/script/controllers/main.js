p2GoApp.controller('mainController', ['TokenService', 'OrderService', '$scope', '$location', 'p2gDataContext', function (TokenService, OrderService, $scope, $location, p2gDataContext) {

    $scope.signIn = function () {
        window.location.href = config.endPoints.auth +
                     "/connect/authorize?" +
                     "response_type=token&" +
                     "redirect_uri=" + config.oAuthReturnUrl + "&" +
                     "client_id=" + config.oAuthClientId + "&" +
                     "scope=" + config.oAuthScope + "&" +
                     "state=oauth2";
    };

    $scope.signOut = function () {
        TokenService.set(null);
        $scope.name = null;
    };

    $scope.getName = function () {
        setTimeout(function () {
            p2gDataContext.getCustomerDetails()
            .success(function (data) {
                $scope.name = data.Forename;
            })
            .error(function (err) {
                console.log(err);
                $scope.signIn();
            });
        }, 1000);

    };

    TokenService.registerObserverCallback(function (token) {
        if (token != null) {
            $scope.getName();
        }
        else {
            $location.path('/');
        }
    });

    if (TokenService.isLoggedIn) {
        $scope.getName();
    }
}]);