var p2gDelivery  = (function() {

    var renderLoading = function () {
        return new Promise(function (accept, reject) {
            $("#" + window.p2gConfig.RenderId).html("<span>Loading...</span><br />");
            var img = $("<img />").attr("src", "http://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif").attr("width", "32");
            $("#" + window.p2gConfig.RenderId).append(img);
            accept();
        });
    };

    var validateConfig = function () {
        return new Promise(function (accept, reject) {
            try {
                console.log("Validation P2G Configuration Settings");
                if (!window.p2gConfig) { reject("Unable to find p2g config settings."); }
                if (!window.p2gConfig.RenderId || !document.getElementById(window.p2gConfig.RenderId)) { reject("Unable to find element to render into."); }
                if (!window.p2gConfig.OutputId || !document.getElementById(window.p2gConfig.OutputId)) { reject("Unable to find element to output to."); }
                if (!window.p2gConfig.Token) { reject("No authentication token provided."); }
                if (!window.p2gConfig.Parcels) { reject("No parcel details provided"); }
                if (!window.p2gConfig.Parcels.CollectionAddress || !window.p2gConfig.Parcels.CollectionAddress.Country || !window.p2gConfig.Parcels.CollectionAddress.Country) { reject("Invalid collection address details"); }
                if (!window.p2gConfig.Parcels.DeliveryAddress || !window.p2gConfig.Parcels.DeliveryAddress.Country || !window.p2gConfig.Parcels.DeliveryAddress.Country) { reject("Invalid delivery address details"); }
                if (!window.p2gConfig.Parcels.Parcels || window.p2gConfig.Parcels.Parcels.length <= 0) { reject("No parcel data provided"); }
                for (var i = 0; i < window.p2gConfig.Parcels.Parcels.length; i++) {
                    var p = window.p2gConfig.Parcels.Parcels[i];
                    if (!p.Weight || isNaN(p.Weight)) { reject("Parcel has invalid weight"); }
                    if (!p.Height || isNaN(p.Height)) { reject("Parcel has invalid height"); }
                    if (!p.Width || isNaN(p.Width)) { reject("Parcel has invalid width"); }
                    if (!p.Length || isNaN(p.Length)) { reject("Parcel has invalid length"); }
                }
                accept();
            }
            catch (e) {
                throw new Error('Unable to validate configuration settings', e);
            }
        });
    };

    var getQuotes = function () {
        return new Promise(function (accept, reject) {
            console.log("Getting Quote");

            if (window.p2gConfig.Insured) {
                window.p2gConfig.Parcels.Extras = ["Cover"];
            }

            $.ajax({
                url: 'https://www.parcel2go.com/api/quotes',
                headers: { 'Authorization': 'Bearer ' + window.p2gConfig.Token },
                method: 'POST',
                data: window.p2gConfig.Parcels,
                success: function (data) {
                    accept(data);
                },
                error: function (data) {
                    reject();
                }
            });
        });
    };

    var processQuotes = function (quotes) {
        return new Promise(function (accept, reject) {
            console.log("Processing Quotes");
            var processed = [];
            for (var i = 0; i < quotes.Quotes.length; i++) {
                var q = quotes.Quotes[i];

                //Limit by requested couriers if entered.
                if (window.p2gConfig.Couriers && window.p2gConfig.Couriers.length > 0) {
                    var skip = true;
                    for (var ii = 0; ii < window.p2gConfig.Couriers.length; ii++) {
                        if (window.p2gConfig.Couriers[ii] === q.Service.CourierName) { skip = false; break; }
                    }
                    if (skip) continue;
                }

                //Limit by collection types if entered.
                if (window.p2gConfig.Types && window.p2gConfig.Types.length > 0) {
                    var skip = true;
                    for (var ii = 0; ii < window.p2gConfig.Types.length; ii++) {
                        if (window.p2gConfig.Types[ii] === q.Service.CollectionType) { skip = false; break; }
                    }
                    if (skip) continue;
                }

                var price = q.TotalPrice;
                //Reduce the price by the contribution if set.
                if (window.p2gConfig.Contribution && !isNaN(window.p2gConfig.Contribution)) {
                    price = (price - window.p2gConfig.Contribution);
                    if (price < 0) {
                        price = 0;
                    }
                }

                var date = new Date(q.EstimatedDeliveryDate);
                if (date) {
                    var timeDiff = Math.abs(date.getTime() - new Date().getTime());
                    date = Math.ceil(timeDiff / (1000 * 3600 * 24));
                }

                processed.push({ courier: q.Service.CourierName, name: q.Service.Name, price: price, slug: q.Service.Slug, days: date, quote: q });
            }

            //Filter the results so that only the cheapest per delivery date is displayed.
            var filtered = [];
            for (var days = 1; days < 10; days++) {
                var cheapest = undefined;
                for (var i = 0; i < processed.length; i++) {
                    if (processed[i].days === days) {
                        if (!cheapest || cheapest.price > processed[i].price) {
                            cheapest = processed[i];
                        }
                    }
                }
                if (cheapest) {
                    filtered.push(cheapest);
                }
            }

            accept(filtered);
        });
    };

    var render = function (quotes) {
        return new Promise(function (accept, reject) {
            console.log("Rendering output");
            var select = $("<select></select>").addClass("form-control").append("<option val>Please select...</option>");
            for (var i = 0; i < quotes.length; i++) {
                var q = quotes[i];
                var option = $("<option></option>");
                option.val(q.slug);
                option.text(q.days + " day(s) - " + q.courier + " £" + q.price.toFixed(2));
                option.data("quote", q);
                select.append(option);
            }

            select.change(function (e) {
                var s = $("option:selected", select);
                var q = s.data("quote");
                $("#" + window.p2gConfig.OutputId).val(q.slug);
                if (window.p2gConfig.Update) {
                    window.p2gConfig.Update(q);
                }
            });

            $("#" + window.p2gConfig.RenderId).html("");
            $("#" + window.p2gConfig.RenderId).append(select);

            accept();
        });
    };

    var init = function () {
        console.log("Starting P2G Delivery Manager");
        
        validateConfig()
            .then(renderLoading)
            .then(getQuotes)
            .then(processQuotes)
            .then(render)
            .catch(function (e) { console.log("Failed to start P2G", e); });
    };

    $(function () {
        init();
    });
})();

