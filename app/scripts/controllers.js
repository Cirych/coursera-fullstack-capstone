'use strict';

angular.module('guesser')

    .controller('NewGuessController', ['$scope', '$state', '$rootScope', 'guessFactory', function ($scope, $state, $rootScope, guessFactory) {

        $scope.newguess = {
            guessName: "",
            description: "",
            options: []
        };


        $scope.addNewOption = function (option) {
            if (option && $scope.newguess.options.indexOf(option) === -1) $scope.newguess.options.push(option);
            $scope.newOption = "";
        };

        $scope.addNewOptionOnEnter = function (event) {
            if (event.charCode == 13) $scope.addNewOption($scope.newOption);
        }

        $scope.deleteOption = function (option) {
            console.log(option);
            $scope.newguess.options.splice(option, 1);
        }

        $scope.newGuess = function () {
            var savedGuess = guessFactory.save($scope.newguess)
                .$promise.then(
                function (response) {
                    $state.go('app.guessdetails', { id: response._id });
                },
                function (response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                }
                );
        };
    }])

    .controller('GuessDetailController', ['$scope', '$state', '$stateParams', '$localStorage', 'guessFactory', 'commentFactory', function ($scope, $state, $stateParams, $localStorage, guessFactory, commentFactory) {
        $scope.guess = {};
        $scope.showGuess = false;
        $scope.message = "Loading ...";
        $scope.answer = {};
        $scope.voted = false;
        $scope.win = false;
        var userId = $localStorage.getObject('Token', '{}').userId;

        $scope.guess = guessFactory.get({
            id: $stateParams.id
        })
            .$promise.then(
            function (response) {
                $scope.guess = response;
                $scope.showGuess = true;
                var userVoted = response.voters.filter(function (item) { return item.voterId == userId });
                if (userVoted.length !== 0) {
                    $scope.voted = true;
                    $scope.answer.index = userVoted[0].voterChoice;
                    $scope.win = userVoted[0].voterChoice == response.selectedAnswer;
                };
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );

        $scope.choice = function () {
            guessFactory.update({ id: $stateParams.id, answer: $scope.answer.index });
            $scope.voted = true;
            if ($scope.answer.index == $scope.guess.selectedAnswer)
                $scope.win = true;
        }

        $scope.mycomment = {
            comment: ""
        };

        $scope.submitComment = function () {

            commentFactory.save({ id: $stateParams.id }, $scope.mycomment);

            $state.go($state.current, {}, { reload: true });

            $scope.commentForm.$setPristine();

            $scope.mycomment = {
                comment: ""
            };
        }
    }])

    .controller('HomeController', ['$scope', 'guessFactory', function ($scope, guessFactory) {
        $scope.showGuess = false;
        $scope.message = "Loading ...";

        $scope.winners = function (guess) {
            return guess.voters.filter(function (item) { return item.voterChoice == guess.selectedAnswer }).length;
        }

        $scope.guess = guessFactory.query({})
            .$promise.then(
            function (response) {
                $scope.guesses = response;
                $scope.showGuess = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );
    }])


    .controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', function ($scope, $state, $rootScope, ngDialog, AuthFactory) {

        $rootScope.loggedIn = false;
        $scope.username = '';

        if (AuthFactory.isAuthenticated()) {
            $rootScope.loggedIn = true;
            $scope.username = AuthFactory.getUsername();
        }

        $scope.openLogin = function () {
            ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller: "LoginController" });
        };

        $scope.logOut = function () {
            AuthFactory.logout();
            $rootScope.loggedIn = false;
            $scope.username = '';
        };

        $rootScope.$on('login:Successful', function () {
            $rootScope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
        });

        $rootScope.$on('registration:Successful', function () {
            $rootScope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
        });

        $scope.stateis = function (curstate) {
            return $state.is(curstate);
        };

    }])

    .controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {

        $scope.loginData = $localStorage.getObject('userinfo', '{}');

        $scope.doLogin = function () {
            if ($scope.rememberMe)
                $localStorage.storeObject('userinfo', $scope.loginData);

            AuthFactory.login($scope.loginData);

            ngDialog.close();

        };

        $scope.openRegister = function () {
            ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller: "RegisterController" });
        };

    }])

    .controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {

        $scope.register = {};
        $scope.loginData = {};

        $scope.doRegister = function () {
            AuthFactory.register($scope.registration);
            ngDialog.close();

        };
    }])
    ;