angular.module('dendroApp.controllers')

/**
 * new project controller
 */
    .controller('metricsController',

        function ($scope,
                  $http,
                  $filter,
                  $q,
                  $log,
                  $sce,
                  focus,
                  preview,
                  $localStorage,
                  $timeout,
                  metadataService,
                  windowService,
                  metricsService) {

            $scope.projectfilter = {
                type: "text",
                label: "Project",
                key: "project",
                value: "",
            };

            $scope.init = function () {
                //$scope.loadData();
                //$scope.loadDeposits();
                $scope.startDeposits();
            };

            $scope.loadData = function () {
                function getStats (uri)
                {
                    metricsService.get_stats(uri)
                        .then(function (response)
                        {
                            let statsData = response.data;
                            $scope.data[0].push(statsData.folders_count);
                        });
                }
                if ($scope.check_project_root())
                {
                    getStats($scope.get_calling_uri());
                }
                else
                {
                    $scope.get_owner_project()
                        .then(function (ownerProject)
                        {
                            if (ownerProject != null)
                            {
                                getStats(ownerProject.uri);
                            }
                        })
                        .catch(function (e)
                        {
                            console.log("error", "Unable to fetch parent project of the currently selected file.");
                            console.log("error", JSON.stringify(e));
                            windowService.show_popup("error", "Error", e.statusText);
                        });
                }

            };


            $scope.check_project_root = function ()
            {
                if ($scope.shared.selected_file != null)
                {
                    return false;
                }
                return $scope.shared.is_project_root;
            };



            $scope.updateData = function () {
                $scope.data = $scope.data.map(function (data) {
                    return data.map(function (y) {
                        y = y + Math.random() * 10 - 5;
                        return parseInt(y < 0 ? 0 : y > 100 ? 100 : y);
                    });
                });
            };

            $scope.parseFilter = function(){
                let search = {};
                for(item in $scope.search){
                    if($scope.search[item].value !== null && $scope.search[item].value !== "")
                        search[$scope.search[item].key] = $scope.search[item].value;
                }
                return search;
            };

            $scope.startDeposits = function () {
                let url = $scope.get_current_url();
                url += "deposits/latest";
                const params = $scope.parseFilter();

                $http({
                    method: "GET",
                    url: url,
                    params: params,
                    contentType: "application/json",
                    headers: {"Accept": "application/json"}
                }).then(function(response){
                    let deposits = response.data;
                    $scope.deposits = deposits;
                }).catch(function(error){
                    console.log(error);
                });
            };


            $scope.loadDeposits = function () {
                function getDeposits (uri)
                {
                    metricsService.get_deposits(uri)
                        .then(function (response)
                        {
                            let deposistsData = response.data;
                        });
                }
                if ($scope.check_project_root())
                {
                    getDeposits($scope.get_calling_uri());
                }
                else
                {
                    $scope.get_owner_project()
                        .then(function (ownerProject)
                        {
                            if (ownerProject != null)
                            {
                                getDeposits(ownerProject.uri);
                            }
                        })
                        .catch(function (e)
                        {
                            console.log("error", "Unable to fetch parent project of the currently selected file.");
                            console.log("error", JSON.stringify(e));
                            windowService.show_popup("error", "Error", e.statusText);
                        });
                }

            };



            //Chart Block
            $scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
            $scope.data = [
                [1, 4, 3]
            ];
            $scope.colors = [
                { // grey
                    backgroundColor: 'rgba(148,159,177,0.2)',
                    pointBackgroundColor: 'rgba(148,159,177,1)',
                    pointHoverBackgroundColor: 'rgba(148,159,177,1)',
                    borderColor: 'rgba(148,159,177,1)',
                    pointBorderColor: '#fff',
                    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
                },
                { // dark grey
                    backgroundColor: 'rgba(77,83,96,0.2)',
                    pointBackgroundColor: 'rgba(77,83,96,1)',
                    pointHoverBackgroundColor: 'rgba(77,83,96,1)',
                    borderColor: 'rgba(77,83,96,1)',
                    pointBorderColor: '#fff',
                    pointHoverBorderColor: 'rgba(77,83,96,0.8)'
                }
            ];
        });