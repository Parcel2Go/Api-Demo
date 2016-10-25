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