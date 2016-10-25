p2GoApp.directive('sidebar', [function (TokenService, p2gDataContext) {
    return {
        restrict: "AE",
        templateUrl: "/pages/templates/sidebar.html",
        scope: true,
        replace: true,
        controller: function ($scope) {
            if ($scope.order.Service.Service.CollectionType === 'Collection') {
                setInterval(function () {
                    var now = moment(new Date());
                    var end = moment($scope.order.Service.CutOff);
                    var duration = moment.duration(end.diff(now));
                    $scope.$apply(function () {
                        $scope.cutOff = duration.hours() + ":" + duration.minutes() + ":" + duration.seconds();
                    });           
                },1000);
            }
        }
    };
}]);