angular.module('prpoFrontEnd.services', [])
.factory('Dogodki', function($resource) {
	return $resource('http://localhost:8080/budilka-rest/v1/dogodki/:dogodekId', { dogodekId: '@dogodekId' }, {
		update: {
			method: 'PUT'
		}
	});
})