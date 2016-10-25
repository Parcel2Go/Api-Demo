var config = {
    oAuthClientId: "demo",
    oAuthScope: "public-api%20payment",
    oAuthReturnUrl: "http%3A%2F%2Flocalhost%3A52981%2F%23%2Ftoken?",
    endPoints: {
        auth: "https://www.parcel2go.com/auth",
        quotes: "https://www.parcel2go.com/api/quotes",
        countries: "https://www.parcel2go.com/api/countries",
        customer: "https://www.parcel2go.com/api/me/detail",
        deliveryAddresses: "https://www.parcel2go.com/api/me/deliveryAddresses",
        collectionAddresses: "https://www.parcel2go.com/api/me/collectionAddresses",
        order: "https://www.parcel2go.com/api/orders"
    }
};
var p2GoApp = angular.module('p2GoApp', ['ngRoute', 'ngAnimate', 'angular-loading-bar', 'angular-cache']);

p2GoApp.config([
    'cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
        cfpLoadingBarProvider
            .spinnerTemplate =
            '<div class="bg"><i class="fa fa-spinner animated infinite rotateIn"></i><span>Loading...</span></div>';
    }
]);

p2GoApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/',
        {
            templateUrl: 'pages/quote.html',
            controller: 'quoteController'
        })
        .when('/token',
        {
            templateUrl: 'pages/quote.html',
            controller: 'tokenController'
        })
        .when('/results',
        {
            templateUrl: 'pages/results.html',
            controller: 'resultsController'
        })
        .when('/parcels',
        {
            templateUrl: 'pages/parcels.html',
            controller: 'parcelController'
        })
        .when('/order',
        {
            templateUrl: 'pages/order.html',
            controller: 'orderController'
        })
        .when('/overview',
        {
            templateUrl: 'pages/overview.html',
            controller: 'overviewController'
        });
});
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
p2GoApp.service('OrderService', ['$rootScope', function ($rootScope) {
    var order = null;
    return {
        set: function (v) { order = v; localStorage.setItem("order", JSON.stringify(v)); $rootScope.$broadcast('order:updated', order); },
        get: function () { return (order == null ? JSON.parse(localStorage.getItem("order")) : order); }
    };
}]);

p2GoApp.factory('p2gDataContext', ['TokenService', '$http', '$q', 'CacheFactory', function (TokenService, $http, $q, CacheFactory) {

    TokenService.registerObserverCallback(function (token) {
        setDefaultHeader(token);
    });

    function setDefaultHeader(token) {
        if (token != null) {
            console.log("Using Token", token);
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + token.token;
        }
    }
    setDefaultHeader(TokenService.get());

    var data = {
        getCountryList: getCountryList,
        getQuote: getQuote,
        getOrder: getOrder,
        getCustomerDetails: getCustomerDetails,
        getCustomerDeliveryAddresses: getCustomerDeliveryAddresses,
        getCustomerCollectionAddresses: getCustomerCollectionAddresses,
        pay: pay,
        labels: labels
    };

    var cache = CacheFactory('localCache', {
        maxAge: 15 * 60 * 1000, // Items added to this cache expire after 15 minutes.
        cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour.
        deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
        storageMode: 'localStorage' // This cache will use `localStorage`.
    });

    return data;

    function pay(url) {
        return $http.post(url);
    }

    function labels(url) {
        return $http.get(url);
    }

    function getQuote(query, refresh) {
        return $http.post(config.endPoints.quotes, query);
    }

    function getOrder(query, refresh) {
        return $http.post(config.endPoints.order, query);
    }

    function getCountryList(refresh) {
        var deferred = $q.defer();
        var start = new Date().getTime();
        var key = config.endPoints.countries;
        return $http.get(config.endPoints.countries, {
            cache: cache
        }).success(function (data) {
            console.log('Country list resolved: ' + (new Date().getTime() - start) + 'ms');
            deferred.resolve(data);
        });
    }

    function getCustomerDetails(refresh) {
        var deferred = $q.defer();
        var start = new Date().getTime();
        var key = config.endPoints.countries;
        return $http.post(config.endPoints.customer, {
            cache: cache
        }).success(function (data) {
            console.log('Customer details resolved: ' + (new Date().getTime() - start) + 'ms');
            deferred.resolve(data);
        });
    }

    function getCustomerDeliveryAddresses(refresh) {
        var deferred = $q.defer();
        var start = new Date().getTime();
        var key = config.endPoints.countries;
        return $http.post(config.endPoints.deliveryAddresses, {
            cache: cache
        }).success(function (data) {
            console.log('Customer delivery addresses resolved: ' + (new Date().getTime() - start) + 'ms');
            deferred.resolve(data);
        });
    }

    function getCustomerCollectionAddresses(refresh) {
        var deferred = $q.defer();
        var start = new Date().getTime();
        var key = config.endPoints.countries;
        return $http.post(config.endPoints.collectionAddresses, {
            cache: cache
        }).success(function (data) {
            console.log('Customer collection addresses resolved: ' + (new Date().getTime() - start) + 'ms');
            deferred.resolve(data);
        });
    }
}]);
p2GoApp.directive('googleplace', function () {
    return {
        scope: {
            data: '='
        },
        link: function (scope, element, attrs, model) {
            scope.gPlace = new google.maps.places.Autocomplete(element[0], { types: ['geocode'] });
            google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                scope.$apply(function () {
                    var place = scope.gPlace.getPlace();
                    for (var i = 0; i < place.address_components.length; i++) {
                        var component = place.address_components[i];
                        for (var ii = 0; ii < component.types.length; ii++) {
                            var type = component.types[ii];
                            var value = component.long_name.length ? component.long_name : component.short_name;
                            switch (type) {
                                case "street_number":
                                    scope.data.Property = value;
                                    break;
                                case "route":
                                    scope.data.Street = value;
                                    break;
                                case "postal_town":
                                    scope.data.Town = value;
                                    break;
                                case "administrative_area_level_1":
                                    scope.data.Locality = value;
                                    break;
                                case "administrative_area_level_2":
                                    scope.data.County = value;
                                    break;
                                case "postal_code":
                                    scope.data.Postcode = value;
                                    break;
                            }
                        }
                    }

                    if (scope.data.Property && scope.data.Street && scope.data.Postcode) {
                        scope.data.State.View = null;
                        scope.data.State.HasAddress = true;
                    }
                    else {
                        scope.data.State.View = "Edit";
                    }
                });
            });
        }
    };
});
p2GoApp.directive('address', ['TokenService', 'p2gDataContext', function (TokenService, p2gDataContext) {
    return {
        restrict: "AE",
        scope: { data: "=", header: "@", delivery: "@" },
        templateUrl: "/pages/templates/address.html",
        link: function (scope, element, attrs, model) {
            if (scope.data.Property && scope.data.Street && scope.data.Postcode) {
                scope.data.State = { View: null, HasAddress: true };
            }
            else {
                scope.data.State = { View: "Search", HasAddress: false };
            }

            scope.gatherAddressOptions = function () {
                if (scope.delivery === "true") {
                    p2gDataContext.getCustomerDeliveryAddresses().success(function (data) {
                        scope.setAddressOptions(data);
                    });
                } else {
                    p2gDataContext.getCustomerCollectionAddresses().success(function (data) {
                        scope.setAddressOptions(data);
                    });
                }
            };

            scope.setAddressOptions = function(addresses) {
                scope.data.State.AddressCollection = addresses;
                for (var i = 0; i < scope.data.State.AddressCollection.length; i++) {
                    var item = scope.data.State.AddressCollection[i];
                    item.Id = i;
                    item.Label = item.Name + " " + item.Property + " " + item.Street + " " + item.Postcode;
                }
            };

            scope.gatherAddressOptions();

            scope.edit = function () {
                scope.data.State.HasAddress = false;
                scope.data.State.View = "Edit";
            };
            scope.search = function () {
                scope.data.State.HasAddress = false;
                scope.data.State.View = "Search";
            };
            scope.done = function () {
                scope.data.State.View = null;
                if (scope.data.Property && scope.data.Street && scope.data.Postcode && scope.data.County) {
                    scope.data.State.HasAddress = true;
                }
            };

            scope.$watch('data.State.SelectedAddress', function () {
                if (scope.data.State.SelectedAddress !== undefined) {
                    var address = scope.data.State.AddressCollection[scope.data.State.SelectedAddress];
                    scope.data.ContactName = address.Name;
                    scope.data.Property = address.Property;
                    scope.data.Street = address.Street;
                    scope.data.Town = address.Town;
                    scope.data.Locality = address.Locality;
                    scope.data.County = address.County;
                    scope.data.Country = address.Country;
                    scope.data.Email = address.Email;
                    scope.data.Phone = address.Phone;
                    scope.data.Organisation = address.Organisation;
                    scope.data.Postcode = address.Postcode;

                    if (scope.data.Property && scope.data.Street && scope.data.Postcode && scope.data.County) {
                        scope.data.State = { View: null, HasAddress: true };
                    }
                    else {
                        scope.data.State = { View: "Edit", HasAddress: false };
                    }
                }
            });
        }
    };
}]);
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
p2GoApp.directive('counter', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            function counter(t,n) {
                this.target = n;
                this.max = t;
                this.interval = t / 100;
                this.current = 0;
                var i = this;
                this.increment = function () {
                    i.target.text((i.current += i.interval).toFixed(2));
                    i.current < i.max ? setTimeout(i.increment, 10) : i.target.text(i.max.toFixed(2));
                };
                setTimeout(i.increment, 50);
            }

            scope.$watch(function () {
                return ngModel.$modelValue;
            }, function (v) {
                if (ngModel.$modelValue) {
                    new counter(parseFloat(ngModel.$modelValue), elem);
                }
            });        
        }
    };
}]);
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
p2GoApp.controller('mainController', ['TokenService', 'OrderService', '$scope', '$location', 'p2gDataContext', function (TokenService, OrderService, $scope, $location, p2gDataContext) {

    $scope.$on('cfpLoadingBar:started', function (event, data) {
        $("#loading-bar-container").removeClass("hidden");
    });
    $scope.$on('cfpLoadingBar:completed', function (event, data) {
        $("#loading-bar-container").addClass("hidden");
    });

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