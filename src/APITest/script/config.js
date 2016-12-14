var config = {
    oAuthClientId: "demo",
    oAuthScope: "public-api%20payment",
    oAuthReturnUrl: "http%3A%2F%2Fp2g-api-test.s3-website-eu-west-1.amazonaws.com%2F%23%2Ftoken%3F",
    endPoints: {
        auth: "https://www.parcel2go.com/auth",
        quotes: "https://www.parcel2go.com/api/quotes",
        countries: "https://www.parcel2go.com/api/countries",
        customer: "https://www.parcel2go.com/api/me/detail",
        deliveryAddresses: "https://www.parcel2go.com/api/me/deliveryAddresses",
        collectionAddresses: "https://www.parcel2go.com/api/me/collectionAddresses",
        order: "https://www.parcel2go.com/api/orders",
        shops: "https://www.parcel2go.com/api/dropshops/"
    }
};