app.directive('dogodekSummery', function() { 
	return { 
		restrict: 'E', 
		scope: { 
			dogodek: '=' 
		}, 
		templateUrl: 'dogodki/dogodekSummery.html' 
	}; 
});