
(function () {
    angular.module('App', [])
        .controller('MainCtrl', ['$scope', '$http', MainCtrl]);
    
    function MainCtrl($scope, $http) {
	var ctrl = this;
	ctrl.test = [];
	ctrl.input = "";


	ctrl.makeEntityRequest = function() {
	    $http({
		method: 'POST',
		url: 'https://api.projectoxford.ai/entitylinking/v1.0/link',
		headers: {
		    'Content-type': 'text/plain',
		    'Ocp-Apim-Subscription-Key': '60ce5dfbd38a44ceaadc7750680638ab'
		},
		data: {
		    body: ctrl.input
		}
	    }).then(function(response) {
		for(var i = 0; i < response.data.entities.length; i ++) {
		    ctrl.test.push(response.data.entities[i]);
		}
		console.log(response);
		console.log(ctrl.test);
	    });
	}

	ctrl.test2 = [];
	ctrl.input2 = "";
	ctrl.makeParseRequest = function() {
	    $http({
		method: 'POST',
		url: 'https://api.projectoxford.ai/linguistics/v1.0/analyze',
		headers: {
		    'Content-type': 'application/json',
		    'Ocp-Apim-Subscription-Key': 'be825782db9342778ddc2ead7bed20ce'
		},
		data: {
		    "language" : "en",
		    "analyzerIds" : ["4fa79af1-f22c-408d-98bb-b7d7aeef7f04", "22a6b758-420f-4745-8a3c-46835a67c0d2"],
		    "text" : "Hi, Tom! How are you today?" 
		}
	    }).then(function(response) {
		console.log(response);
	    });
	}
    }
})();
