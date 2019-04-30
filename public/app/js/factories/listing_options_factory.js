/**
 * Created by Filipe on 01/09/2014.
 */
angular.module("dendroApp.factories")
    .factory("listings", function ($http)
    {
        return {
            getListing: function ($scope, uri, limit, page, filters, change, callback)
            {
                if (filters)
                {
                    let params = this.parseParams(filters);
                    params.new_listing = change;
                    params.limit = limit;
                    params.offset = page;
                    $http({
                        method: "GET",
                        url: uri,
                        params: params,
                        contentType: "application/json",
                        headers: {Accept: "application/json"}
                    }).then(function (response)
                    {
                        if (response.data !== null && response.data !== undefined)
                        {
                            $scope.deposits = response.data.deposits;
                            callback(response.data, change);
                        }
                    }).catch(function (error)
                    {
                        if (error != null)
                        {
                            $scope.show_popup("error", "Error", error.message);
                        }
                    });
                }
            },
            parseParams: function (params)
            {
                let search = {};
                for (item in params)
                {
                    if (params[item].value !== null && params[item].value !== "")
                    {
                        if (params[item].type === "dropdown")
                        {
                            search[params[item].key] = params[item].selected;
                        }
                        else
                        {
                            search[params[item].key] = params[item].value;
                        }
                    }
                }
                return search;
            }
        };
    });