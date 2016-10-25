p2GoApp.controller('resultsController', ['OrderService', '$scope', '$location', 'p2gDataContext', function (OrderService, $scope, $location, p2gDataContext) {
    $scope.loading = true;
    $scope.order = OrderService.get();
    $scope.order.Quote.Service = undefined;
    if (!$scope.order || !$scope.order.Quote) {
        $location.path('/quote');
    }

    p2gDataContext.getQuote($scope.order.Quote).success(function (data) {
        $scope.order.Results.Quotes = [];
        angular.forEach(data.Quotes, function (quote) {
            if (quote.AvailableExtras) {
                angular.forEach(quote.AvailableExtras, function (extra) {
                    if (extra.Type === "ExtendedBaseCover") {
                        quote.TotalPriceWithCover = quote.TotalPrice + extra.Total;
                        quote.TotalPriceWithCoverExVat = quote.TotalPriceExVat + extra.Price;
                    }
                });
            }
            $scope.order.Results.Quotes.push(quote);
        });
        $scope.loading = false;
    });

    $scope.placeOrder = function (quote, includeCover) {
        $scope.order.Service = quote;
        $scope.order.Quote.Service = quote.Service.Slug;
        $scope.order.Quote.Upsells = [];
        if (includeCover) {
            $scope.order.Quote.Upsells.push("ExtendedBaseCover")
        }
        OrderService.set($scope.order);
        $location.path('/parcels');
    };
}]);