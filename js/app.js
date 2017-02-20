(function(){
    angular.module('planinxyz',['ui.router','angularGrid','ngSanitize','angular-loading-bar', 'ngAnimate'])
    .controller('galleryController', galleryController)
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }])
    .config(function($stateProvider,$urlRouterProvider) {
          
          $stateProvider
              .state('gallery',{
            url: '/gallery',
              controller:'galleryController',
              controllerAs:'vm',
            templateUrl: 'views/gallery.html'
          })
          .state('notes',{
            url: '/notes',
            templateUrl: 'views/notes.html'
          });
          $urlRouterProvider.otherwise('/gallery');
        })
    .filter('trustedURL', ['$sce',function($sce) { return $sce.trustAsHtml; }])
    .directive('autoresize', ['$window',function($window) {
        return {
            restrict: "A",
            link: function (scope, element) {
                scope.getWidth = function () {
                    return element[0].offsetWidth;
                };
                if (element) {
                    window.addEventListener("resize", function () {
                        scope.$apply();
                    }, false);
                }
                scope.$watch(scope.getWidth, function (width) {
                    element.css('height', ((3/4)*(width))+ 'px');
                });
            }
        } 
    }]);
    
    galleryController.$inject = ['$scope','$http','angularGridInstance','$window'];
    function galleryController($scope,$http,angularGridInstance,$window){
        var gallery = document.querySelector('body');
        var desc = document.querySelector('.desc');
        var tags = document.querySelector('.tags');
        Ps.initialize(gallery);
        Ps.initialize(desc);
        Ps.initialize(tags);
        var vm = this;
        vm.searchPhoto = '';
        vm.photoWidth = $window.innerWidth > 480 ? .25 * $window.innerWidth : .33 * $window.innerWidth;
        vm.photos = [];
        vm.original = [];
        vm.angularGridOptions = {
               gridWidth : vm.photoWidth,
               gutterSize : 0,
               refreshOnImgLoad : false
           }    
        vm.selectedPhoto = {};
        vm.count = 0;
        vm.per_page = 24;
        vm.showDetails = false;
        vm.getPhotos = function(){
            vm.count++ ;
            if($window.innerWidth < 480){
                vm.per_page = 36;
            }
            var photos = $http.get('https://api.dribbble.com/v1/shots/?per_page='+vm.per_page+'&page='+vm.count+'&access_token=3df6bcfc60b54b131ac04f132af615e60b0bd0b1cadca89a4761cd5d125d608f');
            photos.then(function(response){
                var tempPhotos = angular.copy(vm.photos);
                tempPhotos = tempPhotos.concat(response.data);
                vm.photos = tempPhotos;
                vm.original= tempPhotos;
                angularGridInstance.photos.refresh();
                Ps.update(gallery);
            })
            .catch(function(error){
                
            });
        }
        vm.getPhotoWidth = function(){
            return vm.photoWidth;
        }
        vm.showMeDetails = function(photo){
            vm.showDetails = true;
            vm.selectedPhoto = photo;
        }
        $scope.$watch('vm.searchPhoto', function (val) {
            val = val.toLowerCase();
            vm.photos = vm.original.filter(function (obj) {
                return obj.title.toLowerCase().indexOf(val) != -1;
            });
        });
        $window.addEventListener("keypress", function (event) {
            if(event.which === 27) {
                event.preventDefault();
                if(vm.showDetails){
                    vm.showDetails = false;        
                    }    
                }
            });
        $window.addEventListener("resize", function (event) {
                vm.photos = [];
                vm.original = [];
                vm.photoWidth = $window.innerWidth > 480 ? .25 * $window.innerWidth : .33 * $window.innerWidth;
                vm.getPhotos();
                angularGridInstance.photos.refresh();
                
            });
        
    }
})();
