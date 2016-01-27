// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'uiGmapgoogle-maps'])

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

app.service('GetTermService', function($http) {
    this.getData = function(uri) {
      return $http.get(uri + '?access_token=06f56b2135780a41a8e669188b18ea1b81d7a968');
    };
});

/* Controllers */

app.controller('AuthoriseCtrl', function($scope, $http, service) {
  
    // API key functionality
    $scope.authorise = function(apiKey) {
        if (apiKey.length == 40) {
            service.accessToken = apiKey;
            angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-checkmark-circled"></i> API key submitted!')
            .css({"background-color": "#3c763d", "color": "white"});
            angular.element(document.querySelector(".authoriseMessageBody")).html('<p>You are now able to make calls to the API</p>');
        }
        else {
            angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-checkmark-circled"></i> API key not valid.')
            .css({"background-color": "#a94442", "color": "white"});
            angular.element(document.querySelector(".authoriseMessageBody")).html('<p>Make sure you submitted a valid API key</p>');
        }
    }
  
    // Access token functionality
    /*$scope.authorise = function(user) {
    $http({
            method: 'POST',
            url: 'http://dev-d7nicva-api.pantheon.io/oauth2/token',
            data: {
                grant_type: 'password',
                client_id: 'lociid_app',
                username: user.username,
                password: user.password
            },
            headers: {
                'Content-Type': 'application/json' // Supposedly $http defaults the Content-Type to JSON, so this header may not be required.
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            
            service.accessToken = response.data.access_token;
            angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-checkmark-circled"></i> Authorisation successful!')
            .css({"background-color": "#3c763d", "color": "white"});
            angular.element(document.querySelector(".authoriseMessageBody")).html(response.data.access_token + '</p><p>Refresh Token: ' + response.data.refresh_token + '</p>');
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            
            angular.element(document.querySelector(".authoriseMessageHeader")).html('<i class="icon ion-close-circled"></i> Authorisation unsuccessful')
            .css({"background-color": "#a94442", "color": "white"});
            angular.element(document.querySelector(".authoriseMessageBody")).html('<p>' + response.data.error_description + '</p>');
        });
    }*/
})

app.controller('GetOrganisationsCtrl', function($scope, $http, service) {
  
  $scope.getOrganisations = function(numOfOrgs) {
    $http({
            method: 'GET',
            url: 'http://dev-d7nicva-api.pantheon.io/api/organisation?pagesize=' + numOfOrgs + '&access_token=' + service.accessToken + '',
            headers: {
                'Content-Type': 'application/json' // Supposedly $http defaults the Content-Type to JSON, so this header may not be required.
            }
    }).then(function successCallback(response) {
        /*for(var i=0; i < response.data.length; i++) {
            $scope.organisations.push({
                title: response.data[i].label
            });
        }*/
        $scope.organisations = [];
        angular.forEach(response.data, function(item) {
            $scope.organisations.push({
                title: item.label
            });
        });

        // Dropdown functionality
        /*
         * if given group is the selected group, deselect it
         * else, select the given group
         */
        /*$scope.toggleGroup = function(group) {
            if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
            } else {
            $scope.shownGroup = group;
            }
        };
        $scope.isGroupShown = function(group) {
            return $scope.shownGroup === group;
        };*/
    }, function errorCallback(response) {
        
    });
  }
})

app.controller('GetOrganisationCtrl', function($scope, $http, service, $ionicModal, GetTermService) {
  
  $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
   });
        
    $scope.openModal = function(lat, lon, title) {
        $scope.modal.show();

        $scope.map = { 
            center: { 
                latitude: lat,
                longitude: lon }, 
            zoom: 14
        };
        
        $scope.marker = 
            {
            "id": "0",
            "coords": {
                "latitude": lat,
                "longitude": lon
            },
            "window": {
                "title": title
            }
            };
  
        // Old Google Maps code
        /*$scope.initialise = function() {
            var myLatlng = new google.maps.LatLng(lat, lon);
            var mapOptions = {
                center: myLatlng,
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
                
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: 'Hello World!'
            });

            $scope.map = map;
        };
        
        google.maps.event.addDomListener(document.getElementById("map"), 'load', $scope.initialise());*/
    };
        
    $scope.closeModal = function() {
        $scope.modal.hide();
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
                'Content-Type': 'application/json' // Supposedly $http defaults the Content-Type to JSON, so this header may not be required.
            }
    }).then(function successCallback(response) {
        var orgObject = response.data[0];
        
        $scope.openModal(orgObject.geolocation.lat, orgObject.geolocation.lon, orgObject.label);
        $scope.name = orgObject.label;
        $scope.summary = orgObject.about.value;
        $scope.address = {
            addressLine1: orgObject.address.thoroughfare,
            addressLine2: orgObject.address.locality,
            postcode: orgObject.address.postal_code,
            administrativeArea: orgObject.address.administrative_area,
            country: orgObject.address.country
        };
        
        GetTermService.getData(orgObject.constituency.uri).then(function(data) {
            $scope.constituency = data.data.name;
        })
        
        GetTermService.getData(orgObject.council.uri).then(function(data) {
            $scope.council = data.data.name;
        })
        
        GetTermService.getData(orgObject.electoral_area.uri).then(function(data) {
            $scope.electoralArea = data.data.name;
        })
        
        GetTermService.getData(orgObject.ward.uri).then(function(data) {
            $scope.ward = data.data.name;
        })
        
        $scope.email = orgObject.email;
        $scope.facebook = orgObject.facebook.url;
        $scope.openingHours = (orgObject.opening_hours == null || !orgObject.opening_hours.value) ? 'Not available' : orgObject.opening_hours.value;
        $scope.phone = orgObject.phone;
        $scope.services = orgObject.services.value;
        $scope.twitter = (orgObject.twitter == null) ? 'Not available' : orgObject.twitter;
        $scope.url = orgObject.url;
        $scope.website = (orgObject.website == null) ? 'Not available' : orgObject.website.url;
        
    }, function errorCallback(response) {
        
    });
  }
})

app.controller('CreateOrganisationCtrl', function($scope, $http, service) {

  $scope.createOrganisation = function(organisation) {
    $http({
            method: 'POST',
            url: 'http://dev-d7nicva-api.pantheon.io/api/organisation?access_token=' + service.accessToken + '',
            data: {
                        type: 'organisation',
                        title: organisation.name,
                        body:{
                            und:[
                                {
                                    value: organisation.summary,
                                    summary:"",
                                    format:"filtered_html",
                                    safe_value:"",
                                    safe_summary:""
                                }
                            ]
                        }
                    },
            headers: {
                'Content-Type': 'application/json' // Supposedly $http defaults the Content-Type to JSON, so this header may not be required.
            }
    }).then(function successCallback(response) {
        angular.element(document.querySelector(".createOrganisationCard")).css("display", "block");
        angular.element(document.querySelector(".createOrganisationMessage")).html('<i class="icon ion-checkmark-circled"></i> Status: 200. POST request was successful.')
        .css({"background-color": "#3c763d", "color": "white"});
        $scope.organisation = null;
    }, function errorCallback(response) {
        angular.element(document.querySelector(".createOrganisationCard")).css("display", "block");
        angular.element(document.querySelector(".createOrganisationMessage")).html('<i class="icon ion-close-circled"></i> ' + response.data.form_errors.title)
        .css({"background-color": "#a94442", "color": "white"});
    });
  }
})