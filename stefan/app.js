
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
		    "text" : ctrl.input2
		}
	    }).then(function(response) {
		
		//words
		var sentWords = ctrl.input2.split(" ");
		
		//flatten the parts of speech
		var sent = [];
		var pos = [];
		var sentences = response.data
		for(var i = 0; i<resonse.data.length; i++){
			sent = sentences[i];
			for(var l = 0; j<sent.length; j++)
				pos.push(sent[j]);
		}
		//reservoir sample the words:
		
		var count = 0;
		
		//filter for just nouns and verbs
		var acceptableWords = [];
		for(int i = 0; i<sentWords.length; i++){
			if(words[i].search("NN") || words[i].search("VB"))
				acceptableWords.push(sentWords[i]);
		}
		//Randomly generate the number of samples
		var numSamples = getRandomInt(1, acceptableWords.length);
		var sample = reservoirSample(acceptableWords, numSamples);
		
		console.log(response);
		
	    });
		
		
	}
    }
})();

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function reservoirSample(array, resSize){
	var count = 0;
	var reservoir = [];
	if(array.length <= resSize)
		return array;
	
	//fill the first k values in the reservoir
	for(int i = 0; i<resSize; i++){
		count++;
		reservoir.push(array[i]);
		
	}
	
	for (int i = resSize; i<array.length; i++){
		count++;
		var randomNum = getRandomInt(0, count/resSize);
		if (randomNum == 0){
			var resIndex = getRandomInt(0, resSize);
			reservoir[resIndex] = array[i];
		}
	}
	
	return array;
}
