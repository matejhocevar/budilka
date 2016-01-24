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
		.when('/dogodki/nov', {
			templateUrl: 'dogodki/dogodekEdit.html',
			controller: 'DogodekEditCtrl',
			controllerAs: 'dogodekEdit'
		})
		.when('/dogodki/:id', {
			templateUrl: 'dogodki/dogodek.html',
			controller: 'DogodekCtrl',
			controllerAs: 'dogodek'
		})
		.when('/dogodki/:id/edit', {
			templateUrl: 'dogodki/dogodekEdit.html',
			controller: 'DogodekEditCtrl',
			controllerAs: 'dogodekEdit'
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
.controller('DogodekCtrl', function($routeParams, $scope, $location, Dogodki, $mdDialog) {

	this.name = "DogodekCtrl";
	this.params = $routeParams;

	Dogodki.get({ id: $routeParams.id }).$promise.then(function(dogodek) {
		$scope.dogodek = dogodek;
	});

	$scope.showConfirm = function(ev) {
	// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.title('Ali res želiš izbrisati ta zapis?')
			.textContent('Izbris bo trajno odstranjen.')
			.ariaLabel('Izbris')
			.targetEvent(ev)
			.ok('Izbriši')
			.cancel('Prekliči');
			
		$mdDialog.show(confirm).then(function() {
			$scope.izbrisiDogodek();
		}, function(){});
	};

	$scope.izbrisiDogodek = function(){
		$scope.dogodek.$delete(function() {
			$location.path('/dogodki');
		});
	}

	$scope.urediDogodek = function(id) {
		$location.path('/dogodki/' + id + '/edit');
	};

})
.controller('DogodkiListCtrl', function($routeParams, $scope, $location, Dogodki) {

	this.name = "DogodkiListCtrl";
	this.params = $routeParams;

	$scope.allDogodki = []
	$scope.pages = [1]
	$scope.currentPage = 1
	$scope.numPerPage = 10
	$scope.maxSize = 10;

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

			$scope.dogodkiNum = getResponseHeaders("X-Total-Count");

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

})
.controller('DogodekEditCtrl', function($routeParams, $scope, $location, Dogodki, Uporabniki) {

	this.name = "DogodekEditCtrl";
	this.params = $routeParams;

	$scope.uporabniki = Uporabniki.query(); //pridobi vse uporabnike

	var now = new Date();
	$scope.minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	if($routeParams.id) {
		$scope.isNew = false;
		Dogodki.get({ id: $routeParams.id }).$promise.then(function(dogodek) {
			$scope.dogodek = dogodek;
			$scope.eventName = dogodek.name;
			$scope.eventDate = new Date(dogodek.time);
			$scope.eventTime = new Date(dogodek.time);
			$scope.eventLocation = dogodek.location;
			$scope.eventUser = dogodek.user.id;
		});
	}
	else {
		$scope.isNew = true;
		$scope.dogodek = new Dogodki();
		$scope.eventDate = new Date();
	}

	$scope.saveDogodekCheck = function(){
		if ($scope.eventName == null) {
			return false;
		}
		if ($scope.eventDate == null) {
			return false;
		}
		if ($scope.eventTime == null) {
			return false;
		}
		if ($scope.eventlocation == null) {
			return false;
		}
		if ($scope.eventUser == null) {
			return false;
		}
		return true;
	}

	$scope.saveDogodek = function() {
		$scope.dogodek.name = $scope.eventName;
		var td = new Date($scope.eventTime);
		var dd = new Date($scope.eventDate);
		dd.setHours(td.getHours());
		dd.setMinutes(td.getMinutes());
		dd.setSeconds(td.getSeconds());
		$scope.dogodek.time = dd.getTime();
		$scope.dogodek.location = $scope.eventLocation;
		
		// Uporabniki.get({ uporabnikId: $scope.eventUser }).$promise.then(function(user) {
		// 	$scope.dogodek.user = user;
		// });
		$scope.dogodek.user = null;
		if($scope.isNew) {
			Dogodki.save($scope.dogodek, function() {
				$location.path('/dogodki');
			});
		}
		else {
			Dogodki.update($scope.dogodek, function() {
				$location.path('/dogodki');
			});
		}	
	}
});