p2GoApp.controller('parcelController', ['OrderService', '$scope', '$location', function (OrderService, $scope, $location) {
    $scope.order = OrderService.get();

    var generateId = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    $scope.nextStep = function () {
        $scope.order.Order =
        {
            Items: [{ Parcels: [] }]
        };

        $scope.order.Order.Items[0].Id = generateId();
        $scope.order.Order.Items[0].Service = $scope.order.Service.Service.Slug;

        $scope.order.Order.Items[0].CollectionAddress = {};
        $scope.order.Order.Items[0].CollectionAddress.Postcode = $scope.order.Quote.CollectionAddress.Postcode;
        $scope.order.Order.Items[0].CollectionAddress.CountryIsoCode = $scope.order.Quote.CollectionAddress.Country;

        for (var i = 0; i < $scope.order.Quote.Parcels.length; i++) {
            $scope.order.Order.Items[0].Parcels.push($scope.order.Quote.Parcels[i]);
            $scope.order.Order.Items[0].Parcels[i].DeliveryAddress = {};
            $scope.order.Order.Items[0].Parcels[i].DeliveryAddress.Postcode = $scope.order.Quote.DeliveryAddress.Postcode;
            $scope.order.Order.Items[0].Parcels[i].DeliveryAddress.CountryIsoCode = $scope.order.Quote.DeliveryAddress.Country;
        }
        OrderService.set($scope.order);
        $location.path('/order');
    };
}]);