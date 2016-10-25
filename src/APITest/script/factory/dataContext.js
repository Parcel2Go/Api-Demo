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