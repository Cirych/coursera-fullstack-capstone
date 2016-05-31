angular.module('guesser.controllers', [])

  .controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, AuthFactory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo', '{}');
    $rootScope.loggedIn = false;

    if (AuthFactory.isAuthenticated()) {
      $rootScope.loggedIn = true;
      $scope.username = AuthFactory.getUsername();
    }

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);
      $localStorage.storeObject('userinfo', $scope.loginData);

      AuthFactory.login($scope.loginData);

      $scope.closeLogin();
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

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
      $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function () {
      $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {
      console.log('Doing registration', $scope.registration);
      $scope.loginData.username = $scope.registration.username;
      $scope.loginData.password = $scope.registration.password;

      AuthFactory.register($scope.registration);
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeRegister();
      }, 1000);
    };

    $rootScope.$on('registration:Successful', function () {
      $rootScope.loggedIn = AuthFactory.isAuthenticated();
      $scope.username = AuthFactory.getUsername();
      $localStorage.storeObject('userinfo', $scope.loginData);
    });

    $ionicPlatform.ready(function () {
      var options = {
        quality: 50,
        //destinationType: Camera.DestinationType.DATA_URL,
        //sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        //encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        //popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      $scope.takePicture = function () {
        $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
        }, function (err) {
          console.log(err);
        });
        $scope.registerform.show();
      };

      var pickoptions = {
        maximumImagesCount: 1,
        width: 100,
        height: 100,
        quality: 50
      };

      $scope.pickImage = function () {
        $cordovaImagePicker.getPictures(pickoptions)
          .then(function (results) {
            for (var i = 0; i < results.length; i++) {
              console.log('Image URI: ' + results[i]);
              $scope.registration.imgSrc = results[0];
            }
          }, function (error) {
            // error getting photos
          });
      };

    });
  })
  
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
    
    .controller('HomeController', ['$scope', 'guessFactory', 'baseURL', function ($scope, guessFactory, baseURL) {
        $scope.baseURL = baseURL
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
    
    


