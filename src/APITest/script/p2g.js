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