p2GoApp.service('OrderService', ['$rootScope', function ($rootScope) {
    var order = null;
    return {
        set: function (v) { order = v; localStorage.setItem("order", JSON.stringify(v)); $rootScope.$broadcast('order:updated', order); },
        get: function () { return (order == null ? JSON.parse(localStorage.getItem("order")) : order); }
    };
}]);
