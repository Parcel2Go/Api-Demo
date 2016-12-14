p2GoApp.controller('dropshopController', ['$scope', '$location', '$q', 'p2gDataContext', function ($scope, $location, $q, p2gDataContext) {

    $scope.quotes = [];
    $scope.selectedQuote = null;
    $scope.shops = [];
    $scope.selectedShop = null;
    $scope.quotes = [];

    var showLocation = function (p) {
        $scope.map.setCenter(new google.maps.LatLng(p.coords.latitude, p.coords.longitude));
        $scope.map.setZoom(12);
    };

    $scope.search = function () {
        var deferred = $q.defer();
        $scope.clearMarkers();
        var location = $scope.map.getCenter();
        if ($scope.selectedQuote === null) {
            var waits = [];
            angular.forEach($scope.quotes, function (quote) {
                waits.push($scope.searchType(quote, location));
            });
            $q.all(waits).then(function () {
                deferred.resolve();
            });
        } else {
            $scope.searchType($scope.selectedQuote, location).then(function () {
                deferred.resolve();
            });
        }
        return deferred.promise;
    }

    $scope.searchType = function (quote, location) {
        var deferred = $q.defer();
        p2gDataContext.getShops(quote.code, location.lat(), location.lng(), "GBR").success(function (data) {
            angular.forEach(data.Results, function (shop) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(shop.Latitude, shop.Longitude),
                    map: $scope.map,
                    title: shop.Name,
                    icon: quote.image,
                    shop: shop,
                    quote: quote
                });
                marker.addListener('click', function () {
                    var m = marker;
                    $scope.selectShop(m);
                });
                $scope.shops.push(marker);
            });
            deferred.resolve();
        });
        return deferred.promise;
    }

    $scope.fitShopsOnMap = function () {
        var bounds = new google.maps.LatLngBounds();
        angular.forEach($scope.shops, function (shop) {
            bounds.extend(shop.position);
        });
        $scope.map.fitBounds(bounds);
    }

    $scope.selectQuote = function (quote) {
        if ($scope.selectedQuote === quote) {
            $scope.selectedQuote = null;
        } else {
            $scope.selectedQuote = quote;
        }
        $scope.search().then(function () {
            $scope.fitShopsOnMap();
        });
    };

    $scope.clearMarkers = function () {
        angular.forEach($scope.shops, function (shop) {
            shop.setMap(null);
        });
        $scope.shops = [];
    }

    $scope.selectShop = function (shop) {
        $scope.selectedShop = shop;
        $scope.map.setCenter(shop.position);
        $scope.map.setZoom(19);
        console.log(shop);
    };

    $scope.closeShop = function () {
        $scope.selectedShop = null;
        $scope.map.setZoom(14);
    };

    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(54.135005, -0.797897),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    $scope.map = new google.maps.Map(document.getElementById('dropShopMap'), mapOptions);
    google.maps.event.addListener($scope.map, 'idle', function () {
        $scope.search();
    });

    p2gDataContext.getQuote({ CollectionAddress: { Country: "GBR", Postcode: "DN37 9QS" }, DeliveryAddress: { Country: "GBR", Postcode: "LL28 5NE" }, Parcels: [{ Weight: 0.1, Height: 10, Length: 10, Width: 10 }] }).success(function (data) {
        $scope.quotes = [];
        angular.forEach(data.Quotes, function (quote) {
            if (quote.Service.DropOffProviderCode !== "" && quote.Service.CollectionType === "Shop") {
                var exists = false;
                angular.forEach($scope.quotes, function (match) {
                    if (match.code === quote.Service.DropOffProviderCode) {
                        if (match.price > quote.TotalPrice) {
                            var index = $scope.quotes.indexOf(match);
                            $scope.quotes.splice(index, 1);
                        } else {
                            exists = true;
                        }
                    }
                });
                if (!exists) {
                    console.log(quote);
                    $scope.quotes.push({
                        code: quote.Service.DropOffProviderCode,
                        image: quote.Service.Links.ImageSmall,
                        name: quote.Service.CourierName,
                        price: quote.TotalPrice,
                        slug : quote.Service.Slug
                    });
                }
            }
        });

        $scope.search();
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showLocation);
    }
}]);