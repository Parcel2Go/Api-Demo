p2GoApp.controller('quoteController', ['OrderService', '$scope', '$location', 'p2gDataContext', function (OrderService, $scope, $location, p2gDataContext) {

    var order = OrderService.get();
    if (!order || !order.Quote) {
        $scope.quote = { CollectionAddress: { Country: "GBR", Postcode: "DN37 9QS" }, DeliveryAddress: { Country: "GBR", Postcode: "LL28 5NE" }, Parcels: [{ Weight: 2.4 }] };
    }
    else {
        $scope.quote = order.Quote;
    }

    $scope.countries = {};
    $scope.loadCountries = function () {
        p2gDataContext.getCountryList()
            .success(function (data) {
                $scope.countries = data;
            });
    };

    $scope.getQuote = function () {
        var order = { Quote: $scope.quote, Results: {}, Service: {} };
        order.Quote.Service = null;
        OrderService.set(order);
        $location.path('/results');
    };

    $scope.addParcel = function () {
        $scope.quote.Parcels.push({});
    };

    $scope.removeParcel = function (index) {
        $scope.quote.Parcels.splice(index, 1);
    };

    $scope.loadCountries();
}]);