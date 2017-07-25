angular.module('dendroApp.controllers')
    /**
     *  Descriptors List controller
     */
    .controller('changeLogController', function (
        $scope,
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
        filesService,
        projectsService
    ) {
        $scope.revert_to_version = function(version) {
            metadataService.revert_to_version(
                $scope.get_calling_uri(), version
            );
        };

        $scope.get_project_stats = function()
        {
            $scope.get_owner_project()
                .then(function(ownerProject)
                {
                    if(ownerProject != null)
                    {
                        filesService.get_stats(ownerProject.uri)
                            .then(function(response)
                            {
                                $scope.shared.project_stats = response.data;
                            });
                    }
                })
                .catch(function(e){
                    console.error("Unable to fetch parent project of the currently selected file.");
                    console.error(JSON.stringify(e));
                    windowService.show_popup("error", "Error", e.statusText);
                });

        };

        $scope.get_recent_changes_of_resource = function()
        {
            $scope.getting_change_log = true;

            /**INIT**/
            metadataService.get_recent_changes_of_resource(windowService.get_current_url())
                .then(function(response)
                {
                    var recent_versions = response.data;
                    for(var i = 0; i < recent_versions.length; i++)
                    {
                        recent_versions[i].thumbnail = '/images/icons/extensions/file_extension_'+ recent_versions[i].ddr.isVersionOf.ddr.fileExtension + ".png";
                    }

                    $scope.shared.recent_versions = recent_versions;
                });
        };

        $scope.get_recent_changes_of_project = function()
        {
            var getChangesOfProject = function(rootProject)
            {
                if(!err && rootProject != null)
                {
                    metadataService.get_recent_changes_of_project(rootProject.uri)
                        .then(function(response)
                        {
                            var recent_versions = response.data;
                            for(var i = 0; i < recent_versions.length; i++)
                            {
                                recent_versions[i].thumbnail = '/images/icons/extensions/file_extension_'+ recent_versions[i].ddr.isVersionOf.ddr.fileExtension + ".png";
                            }

                            $scope.shared.recent_versions = recent_versions;
                        });
                }
            };

            if($scope.showing_project_root())
            {
                getChangesOfProject($scope.get_calling_uri());
            }
            else
            {
                projectsService.get_owner_project_of_resource($scope.get_calling_uri())
                    .then(function(rootProject)
                    {
                        getChangesOfProject(rootProject);
                    });
            }
        };
    });