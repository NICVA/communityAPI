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

/* Controllers */

app.controller('AuthoriseCtrl', function($scope, $http, service) {

    $scope.authorise = function(apiKey) {
        if (apiKey.length == 40) {
            service.accessToken = apiKey;
            angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-checkmark-circled"></i> API key submitted!')
            .css({"background-color": "#3c763d", "color": "white"});
            angular.element(document.querySelector(".authoriseMessageBody")).html('<p>You are now able to make calls to the API</p>');
        }
        else {
            angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-close-circled"></i> API key not valid.')
            .css({"background-color": "#a94442", "color": "white"});
            angular.element(document.querySelector(".authoriseMessageBody")).html('<p>Make sure you submitted a valid API key</p>');
        }
    }
})

app.controller('GetOrganisationsCtrl', function($scope, $http, service) {
  
  $scope.getOrganisations = function(numOfOrgs) {
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
    }, function errorCallback(response) {
        
    });
  }
})

app.controller('GetOrganisationCtrl', function($scope, $http, service, $ionicModal, GetResourceService) {
  
    $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
        
    $scope.openModal = function(lat, lon, title) {
        $scope.map = { 
            center: { 
                latitude: lat,
                longitude: lon }, 
            zoom: 14
        };
        
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
            url: 'http://dev-d7nicva-api.pantheon.io/api/organisation?parameters[label]=' + organisationName + '&access_token=' + service.accessToken + '',
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
        
        GetResourceService.getData($scope.orgObject.constituency.uri).then(function(data) {
            $scope.orgObject.constituency = data.data.name;
        })
        
        GetResourceService.getData($scope.orgObject.council.uri).then(function(data) {
            $scope.orgObject.council = data.data.name;
        })
        
        GetResourceService.getData($scope.orgObject.electoral_area.uri).then(function(data) {
            $scope.orgObject.electoralArea = data.data.name;
        })
        
        GetResourceService.getData($scope.orgObject.ward.uri).then(function(data) {
            $scope.orgObject.ward = data.data.name;
        })
        
        $scope.openModal($scope.orgObject.geolocation.lat, $scope.orgObject.geolocation.lon, $scope.orgObject.label);

    }, function errorCallback(response) {
        
        angular.element(document.querySelector(".getOrganisationByNameNotFound")).css("display", "block");
        
        $http.get('http://dev-d7nicva-api.pantheon.io/api/organisation?pagesize=1000&fields=label&access_token=' + service.accessToken + '')
        .success(function(data) {
            var lev;
            angular.forEach(data, function(item) {
                lev = item.label.levenshtein(organisationName);
                
                if (lev >=0 && lev <= 3) $scope.didYouMean = item.label;
            });
            
            if ($scope.didYouMean.length !== 0) angular.element(document.querySelector(".didYouMeanCard")).css("display", "block");
        });
    });
  }
})

app.controller('GetOrganisationsByTaxonomyCtrl', function($scope, $http, service) {
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
            });
        });
    }
})

app.controller('GetOrganisationsNearMeCtrl', function($scope, $http, service) {
    $scope.getOrganisationsNearMe = function(noOfMiles) {
        navigator.geolocation.getCurrentPosition(success, error, options);

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
            });
        };

        function error(err) {
            //console.warn('ERROR(' + err.code + '): ' + err.message);
            
        };

        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
    }
})