// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'uiGmapgoogle-maps'])

app.config(function($ionicConfigProvider) {
  $ionicConfigProvider.navBar.alignTitle('center');
});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

/* Services */

app.service('service', function () {
    return {};
})

app.service('GetResourceService', function($http, service) {
    this.getData = function(uri) {
      return $http.get(uri + '?access_token=' + service.accessToken + '');
    };
});

app.service('ShowAlertService', function($ionicPopup) {
    this.run = function(parameter) {
        $ionicPopup.alert({
            title: parameter.title,
            template: parameter.message
        });
    };
});

app.service('LoadingService', function($ionicLoading) {
    this.run = function() {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };
    
    this.hide = function() {
        $ionicLoading.hide();
    }
});

/* Controllers */

app.controller('AuthoriseCtrl', function($scope, $http, service) {
    $scope.authorise = function(apiKey) {
        
        $http({
            method: 'GET',
            url: 'http://dev-d7nicva-api.pantheon.io/api/organisation?pagesize=1&fields=org_id&access_token=' + apiKey + '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            service.accessToken = apiKey;
            angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-checkmark-circled"></i> API key submitted!')
            .css({"background-color": "#3c763d", "color": "white"});
            angular.element(document.querySelector(".authoriseMessageBody")).html('<p>You are now able to make calls to the API</p>');
        }, function errorCallback(response) {
            switch(response.status) {
                case 401:
                    angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-close-circled"></i> API key not valid.')
                    .css({"background-color": "#a94442", "color": "white"});
                    angular.element(document.querySelector(".authoriseMessageBody")).html('<p>Make sure you submitted a valid API key.</p>');
                    break;
                case 503:
                    angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-close-circled"></i> API service is currently unavailable.')
                    .css({"background-color": "#a94442", "color": "white"});
                    angular.element(document.querySelector(".authoriseMessageBody")).html('<p>Please try again later, or contact us.</p>');
                    break;
                default:
                    angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-close-circled"></i> An unexpected error occurred.')
                    .css({"background-color": "#a94442", "color": "white"});
                    angular.element(document.querySelector(".authoriseMessageBody")).html('<p>Please try again later, or contact us.</p>');
            }
            
        });
    }
})

app.controller('GetOrganisationsCtrl', function($scope, $http, service, ShowAlertService, LoadingService, $ionicLoading) {
  
  $scope.getOrganisations = function(numOfOrgs) {
    LoadingService.run();
    
    $http({
            method: 'GET',
            url: 'http://dev-d7nicva-api.pantheon.io/api/organisation?pagesize=' + numOfOrgs + '&access_token=' + service.accessToken + '',
            headers: {
                'Content-Type': 'application/json' // $http defaults the Content-Type to JSON, so this header isn't necessarily required.
            }
    }).then(function successCallback(response) {
        $scope.organisations = [];
        angular.forEach(response.data, function(item) {
            $scope.organisations.push({
                title: item.label
            });
        });

        LoadingService.hide();
    }, function errorCallback(response) {
        LoadingService.hide();
        
        if (service.accessToken == undefined) {
            var errorObj = {
                    "title": "Error!",
                    "message": "Make sure you have authorised yourself first."
            }
                
            ShowAlertService.run(errorObj);
        }
    });
  }
})

app.controller('GetOrganisationCtrl', function($scope, $http, service, $ionicModal, GetResourceService, ShowAlertService, LoadingService) {
  
    $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
        
    $scope.openModal = function(lat, lon, title) {

        $scope.marker = {
            "id": "0",
            "coords": {
                "latitude": lat,
                "longitude": lon
            },
            "window": {
                "title": title
            }
        };
        
        $scope.map = { 
            center: { 
                latitude: $scope.marker.coords.latitude,
                longitude: $scope.marker.coords.longitude
            }, 
            zoom: 14
        };
        
        $scope.modal.show();
    };
        
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.orgImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    };
        
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
        
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
        
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });
  
    $scope.getOrganisation = function(organisationName) {
 
      $http({
            method: 'GET',
            url: 'http://dev-d7nicva-api.pantheon.io/api/organisation?parameters[label]=' + encodeURIComponent(organisationName) + '&access_token=' + service.accessToken + '',
            headers: {
                'Content-Type': 'application/json'
            }
    }).then(function successCallback(response) {
        angular.element(document.querySelector(".getOrganisationByNameNotFound")).css("display", "none");
        angular.element(document.querySelector(".didYouMeanCard")).css("display", "none");
        
        $scope.orgObject = response.data[0];
        
        if ($scope.orgObject.logo.file !== undefined) {
            $http.get($scope.orgObject.logo.file.uri + '?fields=url&access_token=' + service.accessToken + '').then(function(data) {
                $scope.orgImage = data.data.url;
            })
        }
        else {
            $scope.orgImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        }
        
        if ($scope.orgObject.constituency !== undefined) {
            GetResourceService.getData($scope.orgObject.constituency.uri).then(function(data) {
                $scope.orgObject.constituency = data.data.name;
            });
        }
        
        if ($scope.orgObject.council !== undefined) {
            GetResourceService.getData($scope.orgObject.council.uri).then(function(data) {
                $scope.orgObject.council = data.data.name;
            });
        }
        
        if ($scope.orgObject.electoral_area !== undefined) {
            GetResourceService.getData($scope.orgObject.electoral_area.uri).then(function(data) {
                $scope.orgObject.electoralArea = data.data.name;
            });
        }
        
        if ($scope.orgObject.ward !== undefined) {
            GetResourceService.getData($scope.orgObject.ward.uri).then(function(data) {
                $scope.orgObject.ward = data.data.name;
            });
        }
        
        $scope.openModal($scope.orgObject.geolocation.lat, $scope.orgObject.geolocation.lon, $scope.orgObject.label);

    }, function errorCallback(response) {
        if (service.accessToken == undefined) {
            var errorObj = {
                    "title": "Error!",
                    "message": "Make sure you have authorised yourself first."
            }
                
            ShowAlertService.run(errorObj);
        }
        else {
            LoadingService.run();
            
            angular.element(document.querySelector(".getOrganisationByNameNotFound")).css("display", "block");
            
            $http.get('http://dev-d7nicva-api.pantheon.io/api/organisation?pagesize=1000&fields=label&access_token=' + service.accessToken + '')
            .success(function(data) {
                $scope.didYouMean = [];
                angular.forEach(data, function(item) {
                    if(item.label.search(organisationName) != -1) $scope.didYouMean += '"' + item.label + '" ';
                    
                    // Old code to compare similar objects.
                    //if (item.label.levenshtein(organisationName) >=0 && item.label.levenshtein(organisationName) <= 3) $scope.didYouMean = item.label;
                });
                
                if ($scope.didYouMean !== undefined) angular.element(document.querySelector(".didYouMeanCard")).css("display", "block");
                
                LoadingService.hide();
            });
        }
    });
  }
})

app.controller('GetOrganisationsByTaxonomyCtrl', function($scope, $http, service, LoadingService, ShowAlertService) {
    $scope.taxonomyTypes = [
        { text: "Council", value: "council" },
        { text: "Constituency", value: "constituency" },
        { text: "Electoral Area", value: "electoral_area" },
        { text: "Ward", value: "ward" }
    ];

    $scope.data = {
        selectedType: ''
    };
    
    $scope.getOrganisationsByTaxonomy = function(taxonomyTerm, taxonomyType) {
        angular.element(document.querySelector(".getOrganisationByTaxnomyNotFound")).css("display", "none");
        LoadingService.run();
        
        $http.get('http://dev-d7nicva-api.pantheon.io/api/taxonomy_term?parameters[name]=' + taxonomyTerm + '&pagesize=1&access_token=' + service.accessToken + '')
        .success(function(data) {
            $http.get('http://dev-d7nicva-api.pantheon.io/api/organisation?pagesize=1000&parameters[' + taxonomyType + '][id]=' + data[0].tid + '&access_token=' + service.accessToken + '')
            .success(function(data) {
                $scope.organisationsByTaxonomy = [];
                angular.forEach(data, function(item) {
                    $scope.organisationsByTaxonomy.push({
                        title: item.label
                    });
                });
                
                LoadingService.hide();
            }).error(function() {
                LoadingService.hide();
                angular.element(document.querySelector(".getOrganisationByTaxnomyNotFound")).css("display", "block");
            });
        }).error(function(error) {
            LoadingService.hide();
            
            if (service.accessToken == undefined) {
                var errorObj = {
                        "title": "Error!",
                        "message": "Make sure you have authorised yourself first."
                }
                    
                ShowAlertService.run(errorObj);
            }
            else {
                angular.element(document.querySelector(".getOrganisationByTaxnomyNotFound")).css("display", "block");
            }
        });
    }
})

app.controller('GetOrganisationsNearMeCtrl', function($scope, $http, $ionicPopup, service, ShowAlertService, LoadingService) {
    
    $scope.getOrganisationsNearMe = function(noOfMiles) {
        LoadingService.run();
        
        function success(pos) {
            $http.get('http://dev-d7nicva-api.pantheon.io/api/organisation?fields=label,geolocation&pagesize=1000&access_token=' + service.accessToken + '')
            .success(function(data) {
                $scope.organisationsNearMe = [];
                angular.forEach(data, function(item) {
                    if (google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude), 
                        new google.maps.LatLng(item.geolocation.lat, item.geolocation.lon)) < (noOfMiles * 1609.344)) {
                            $scope.organisationsNearMe.push({
                                title: item.label
                            });
                    }
                });
                
                LoadingService.hide();
            }).error(function(error) {
                LoadingService.hide();
                
                if (service.accessToken == undefined) {
                    var errorObj = {
                            "title": "Error!",
                            "message": "Make sure you have authorised yourself first."
                    }
                        
                    ShowAlertService.run(errorObj);
                }
            });
        };

        function error(err) {
            LoadingService.hide();
            
            var errorObj = {
                "title": "Error!",
                "message": "(Error Code " + err.code + "): " + err.message + ". Make sure your location services are switched on."
            }
            ShowAlertService.run(errorObj);
        };

        var options = {
            enableHighAccuracy: true,
            timeout: 5000
        };
        
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
})