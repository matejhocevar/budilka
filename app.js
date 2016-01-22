app = angular.module('prpoFrontEnd', ['ngRoute', 'ngAnimate','ngMaterial','ngResource','prpoFrontEnd.services'])
.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {

		$routeProvider
		.when('/', {
			templateUrl: 'first.html',
			controller: 'FirstCtrl',
			controllerAs: 'first'
		})
		.when('/dogodki', {
			templateUrl: 'dogodki/dogodkiList.html',
			controller: 'DogodkiListCtrl',
			controllerAs: 'dogodkiList'
		})
		.otherwise({
			redirectTo: '/'
		});

		$locationProvider.html5Mode(false);
		$locationProvider.hashPrefix('!');
	}])
.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log, $location) {

	$scope.toggleLeft = buildDelayedToggler('left');
	/*
	 * Supplies a function that will continue to operate until the
	 * time is up.
	 */
	 function debounce(func, wait, context) {
		var timer;
		return function debounced() {
			var context = $scope,
			args = Array.prototype.slice.call(arguments);
			$timeout.cancel(timer);
			timer = $timeout(function() {
				timer = undefined;
				func.apply(context, args);
			}, wait || 10);
		};
	 }
	/**
	 * Build handler to open/close a SideNav; when animation finishes
	 * report completion in console
	 */
	 function buildDelayedToggler(navID) {
		return debounce(function() {$mdSidenav(navID).toggle()}, 200);
	 }
	})
.controller('FirstCtrl', ['$routeParams', function($routeParams) {

	this.name = "FirstCtrl";
	this.params = $routeParams;

}])
.controller('DogodkiListCtrl', function($routeParams, $scope, $location, Dogodki) {

	this.name = "DogodkiListCtrl";
	this.params = $routeParams;

	$scope.allDogodki = []
	$scope.pages = [1]
	$scope.currentPage = 1
	$scope.numPerPage = 5
	$scope.maxSize = 5;

	$scope.whatClassIsIt= function(someValue){
		if(someValue==$scope.pages[0])
			return "left"
		else if(someValue==$scope.pages[$scope.pages.length-1])
			return "right";
		else
			return "middle";
	}

	$scope.loadFunction = function(page) {
		
		var start = (page-1)*$scope.numPerPage;

		var dogodki = Dogodki.query();

		Dogodki.query({page: start, recordNum: $scope.numPerPage}, function(dogodki, getResponseHeaders) {

			// $scope.dogodkiNum = 50;
			$scope.dogodkiNum = getResponseHeaders("X-Total-Count");
			console.log("Vseh dogodkov je: " + $scope.dogodkiNum);
			
			if($scope.allDogodki.length == 0) {
				for(i = 0; i<$scope.dogodkiNum; i++) {
					if(i>= start && i<start+$scope.numPerPage) {
						$scope.allDogodki.push(dogodki[i-start]);
					} else {
						$scope.allDogodki.push(i.toString());
					}
				}
				$scope.dogodki = $scope.allDogodki.slice(0, $scope.numPerPage);
			}

			for (i=0;i<dogodki.length;i++) {
				if(typeof $scope.allDogodki[start+i] === 'string') {
					$scope.allDogodki[start+i] = dogodki[i];
				}
			}

			if($scope.pages.length == 1 && $scope.dogodkiNum > $scope.numPerPage){
				for(i=2; i<= Math.ceil($scope.dogodkiNum/$scope.numPerPage);i++){
					$scope.pages.push(i);
				}
			}

			$scope.currentPage=page;
		});
	}

	$scope.$watch("currentPage + numPerPage", function() {
		var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
		$scope.loadFunction($scope.currentPage)
		$scope.dogodki = $scope.allDogodki.slice(begin, end);
	});

});