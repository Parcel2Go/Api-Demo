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
                if (scope.delivery == "true") {
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
                if (scope.data.Property && scope.data.Street && scope.data.Postcode) {
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

                    if (scope.data.Property && scope.data.Street && scope.data.Postcode) {
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