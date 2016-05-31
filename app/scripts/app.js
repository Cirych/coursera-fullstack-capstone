'use strict';

angular.module('guesser', ['ui.router', 'ngResource', 'ngDialog'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            // route for the home page
            .state('app', {
                url: '/',
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'HeaderController'
                    },
                    'content': {
                        templateUrl: 'views/home.html',
                        controller: 'HomeController'
                    },
                    'footer': {
                        templateUrl: 'views/footer.html',
                    }
                }
            })

            // route for the aboutus page
            .state('app.aboutus', {
                url: 'aboutus',
                views: {
                    'content@': {
                        templateUrl: 'views/aboutus.html'
                    }
                }
            })

            // route for the new guess page
            .state('app.newguess', {
                url: 'newguess',
                views: {
                    'content@': {
                        templateUrl: 'views/newguess.html',
                        controller: 'NewGuessController'
                    }
                }
            })

            // route for the guessdetail page
            .state('app.guessdetails', {
                url: 'guess/:id',
                views: {
                    'content@': {
                        templateUrl: 'views/guessdetails.html',
                        controller: 'GuessDetailController'
                    }
                }
            })

        $urlRouterProvider.otherwise('/');
    })
    ;
