// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('guesser', ['ionic', 'ngCordova', 'guesser.controllers', 'guesser.services'])

  .run(function ($ionicPlatform, $rootScope, $ionicLoading, $cordovaSplashscreen, $timeout) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      /*
      $timeout(function () {
                  $cordovaSplashscreen.hide();
              }, 2000);*/
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    $rootScope.$on('loading:show', function () {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner> Loading ...'
      });
    });

    $rootScope.$on('loading:hide', function () {
      $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function () {
      console.log('Loading ...');
      $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function () {
      console.log('Loaded');
      $rootScope.$broadcast('loading:hide');
    });

  })

  .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
/*
    $httpProvider.interceptors.push(function ($rootScope) {
      return {
        request: function (config) {
          $rootScope.$broadcast('loading:show');
          return config;
        },
        response: function (response) {
          $rootScope.$broadcast('loading:hide');
          return response;
        },
        responseError: function (rejection) {
          if (rejection.status === 404) {
            console.log('404 Error!');
            $rootScope.resourceError = true;
          }
        }
      }
    });
*/
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/sidebar.html',
        controller: 'AppCtrl'
      })

      .state('app.home', {
        url: '/home',
        views: {
          'mainContent': {
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
          }
        }
      })

      .state('app.aboutus', {
        url: '/aboutus',
        views: {
          'mainContent': {
            templateUrl: 'templates/aboutus.html',
          }
        }
      })

      .state('app.newguess', {
        url: '/newguess',
        views: {
          'mainContent': {
            templateUrl: 'templates/newguess.html',
            controller: 'NewGuessController'
          }
        }
      })

      .state('app.guessdetails', {
        url: '/guess/:id',
        views: {
          'mainContent': {
            templateUrl: 'templates/guessdetails.html',
            controller: 'GuessDetailController'
          }
        }
      });




    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
  });
