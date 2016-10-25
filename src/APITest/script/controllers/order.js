p2GoApp.controller('orderController', ['OrderService', '$scope', '$location', 'p2gDataContext', function (OrderService, $scope, $location, p2gDataContext) {
    $scope.order = OrderService.get();

    $scope.customerDetails = function () {
        p2gDataContext.getCustomerDetails().success(function (data) {
            $scope.order.Order.CustomerDetails = {};
            $scope.order.Order.CustomerDetails.Forename = data.Forename;
            $scope.order.Order.CustomerDetails.Surname = data.Surname;
            $scope.order.Order.CustomerDetails.Email = data.Email;
        });
    };

    $scope.placeOrder = function () {
        OrderService.set($scope.order);
        $location.path('/overview');
    };

    $scope.customerDetails();
}]);