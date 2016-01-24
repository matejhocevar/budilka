angular.module('prpoFrontEnd.services', [])
.factory('Dogodki', function($resource) {
	return $resource('http://localhost:8080/budilka-rest/v1/dogodki/:id', { id: '@id' }, {
		update: {
			method: 'PUT'
		},
		save: {
			method: 'POST'
		}
	});
})
.factory('Uporabniki', function($resource) {
	return $resource('http://localhost:8080/budilka-rest/v1/uporabniki/:id', { id: '@id' }, {
		update: {
			method: 'PUT'
		},
		save: {
			method: 'POST'
		}
	});
});