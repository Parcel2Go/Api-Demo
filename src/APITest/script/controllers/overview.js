p2GoApp.controller('overviewController', ['OrderService', '$scope', '$location', 'p2gDataContext', function (OrderService, $scope, $location, p2gDataContext) {
    $scope.order = OrderService.get();
    $scope.order.Overview = null;
    $scope.loading = true;

    p2gDataContext.getOrder($scope.order.Order)
        .success(function (data) {
            $scope.order.Overview = data;
            OrderService.set($scope.order);
            $scope.loading = false;
        });

    $scope.pay = function () {
        $scope.loading = true;
        p2gDataContext.pay($scope.order.Overview.Links.PayWithPrePay)
        .success(function (data) {
            $scope.order.Payment = data;
            OrderService.set($scope.order);
            $scope.loading = false;
        });
    };

    $scope.labels = function () {
        $scope.loading = true;
        p2gDataContext.labels($scope.order.Payment.Links[0].Link)
        .success(function (data) {
            $scope.loading = false;
            window.location = "data:image/png;base64," + data.Base64EncodedLabels[0];
        });
    };
}]);