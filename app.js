(function () {
    angular.module('App', [])
        .controller('MainCtrl', ['$scope', '$http', MainCtrl])
        .controller('StoryCtrl', ['$scope', '$http', '$q', StoryCtrl]);

    function MainCtrl($scope, $http) {
        var ctrl = this;
        ctrl.test = [];
        ctrl.input = "";


        ctrl.makeEntityRequest = function () {
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
            }).then(function (response) {
                for (var i = 0; i < response.data.entities.length; i++) {
                    ctrl.test.push(response.data.entities[i]);
                }
                console.log(response);
                console.log(ctrl.test);
            });
        }

        ctrl.test2 = [];
        ctrl.input2 = "";
        ctrl.makeParseRequest = function () {
            $http({
                method: 'POST',
                url: 'https://api.projectoxford.ai/linguistics/v1.0/analyze',
                headers: {
                    'Content-type': 'application/json',
                    'Ocp-Apim-Subscription-Key': 'be825782db9342778ddc2ead7bed20ce'
                },
                data: {
                    "language": "en",
                    "analyzerIds": ["4fa79af1-f22c-408d-98bb-b7d7aeef7f04", "22a6b758-420f-4745-8a3c-46835a67c0d2"],
                    "text": ctrl.input2
                }
            }).then(function (response) {
                console.log(response);
            });
        }

        ctrl.images = [];
        ctrl.imageInput = "";
        ctrl.makeImageRequest = function () {
            ctrl.images = [];
            $http({
                method: 'GET',
                url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + ctrl.imageInput,
                headers: {
                    'Ocp-Apim-Subscription-Key': 'fbf87f6b84754136a4dfb72943c2f17e'
                }
            }).then(function (response) {
                for (var i = 0; i < response.data.value.length; i++) {
                    ctrl.images.push(response.data.value[i].contentUrl);
                }
                console.log(response);
            });
        }
    }

    function StoryCtrl($scope, $http, $q) {
        var ctrl = this;
        ctrl.input = "";
        ctrl.sentenceModels = [];
        ctrl.memeMode = false;

        var stopwords = ["a", "a\'s", "able", "about", "above", "according", "accordingly", "across", "actually", "after", "afterwards", "again", "against", "ain\'t", "all", "allow", "allows", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anyways", "anywhere", "apart", "appear", "appreciate", "appropriate", "are", "aren\'t", "around", "as", "aside", "ask", "asking", "associated", "at", "available", "away", "awfully", "b", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "believe", "below", "beside", "besides", "best", "better", "between", "beyond", "both", "brief", "but", "by", "c", "c\'mon", "c\'s", "came", "can", "can\'t", "cannot", "cant", "cause", "causes", "certain", "certainly", "changes", "clearly", "co", "com", "come", "comes", "concerning", "consequently", "consider", "considering", "contain", "containing", "contains", "corresponding", "could", "couldn\'t", "course", "currently", "d", "definitely", "described", "despite", "did", "didn\'t", "different", "do", "does", "doesn\'t", "doing", "don\'t", "done", "down", "downwards", "during", "e", "each", "edu", "eg", "eight", "either", "else", "elsewhere", "enough", "entirely", "especially", "et", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "f", "far", "few", "fifth", "first", "five", "followed", "following", "follows", "for", "former", "formerly", "forth", "four", "from", "further", "furthermore", "g", "get", "gets", "getting", "given", "gives", "go", "goes", "going", "gone", "got", "gotten", "greetings", "h", "had", "hadn\'t", "happens", "hardly", "has", "hasn\'t", "have", "haven\'t", "having", "he", "he\'s", "hello", "help", "hence", "her", "here", "here\'s", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "hi", "him", "himself", "his", "hither", "hopefully", "how", "howbeit", "however", "i", "i\'d", "i\'ll", "i\'m", "i\'ve", "ie", "if", "ignored", "immediate", "in", "inasmuch", "inc", "indeed", "indicate", "indicated", "indicates", "inner", "insofar", "instead", "into", "inward", "is", "isn\'t", "it", "it\'d", "it\'ll", "it\'s", "its", "itself", "j", "just", "k", "keep", "keeps", "kept", "know", "knows", "known", "l", "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "let\'s", "like", "liked", "likely", "little", "look", "looking", "looks", "ltd", "m", "mainly", "many", "may", "maybe", "me", "mean", "meanwhile", "merely", "might", "more", "moreover", "most", "mostly", "much", "must", "my", "myself", "n", "name", "namely", "nd", "near", "nearly", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "no", "nobody", "non", "none", "noone", "nor", "normally", "not", "nothing", "novel", "now", "nowhere", "o", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "on", "once", "one", "ones", "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "p", "particular", "particularly", "per", "perhaps", "placed", "please", "plus", "possible", "presumably", "probably", "provides", "q", "que", "quite", "qv", "r", "rather", "rd", "re", "really", "reasonably", "regarding", "regardless", "regards", "relatively", "respectively", "right", "s", "said", "same", "saw", "say", "saying", "says", "second", "secondly", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sensible", "sent", "serious", "seriously", "seven", "several", "shall", "she", "should", "shouldn\'t", "since", "six", "so", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specified", "specify", "specifying", "still", "sub", "such", "sup", "sure", "t", "t\'s", "take", "taken", "tell", "tends", "th", "than", "thank", "thanks", "thanx", "that", "that\'s", "thats", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "there\'s", "thereafter", "thereby", "therefore", "therein", "theres", "thereupon", "these", "they", "they\'d", "they\'ll", "they\'re", "they\'ve", "think", "third", "this", "thorough", "thoroughly", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "twice", "two", "u", "un", "under", "unfortunately", "unless", "unlikely", "until", "unto", "up", "upon", "us", "use", "used", "useful", "uses", "using", "usually", "uucp", "v", "value", "various", "very", "via", "viz", "vs", "w", "want", "wants", "was", "wasn\'t", "way", "we", "we\'d", "we\'ll", "we\'re", "we\'ve", "welcome", "well", "went", "were", "weren\'t", "what", "what\'s", "whatever", "when", "whence", "whenever", "where", "where\'s", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "who\'s", "whoever", "whole", "whom", "whose", "why", "will", "willing", "wish", "with", "within", "without", "won\'t", "wonder", "would", "would", "wouldn\'t", "x", "y", "yes", "yet", "you", "you\'d", "you\'ll", "you're", "you\'ve", "your", "yours", "yourself", "yourselves", "z", "zero", "\!", "\#", "\$", "\%", "\&", "\'", "\(", "\)", "\*", "\+", "\-", ".", ",", "/", ":", ";", "\<", "=", "\>", "\?", "@", "\[", "\]", "\^", "\_", "\`", "\{", "\|", "\}", "\~"]
        var sw = {};
        for (var i = 0; i < stopwords.length; i++) {
            sw[stopwords[i]] = true;
        }

        ctrl.run = function () {
            var text = ctrl.input;
            text = text.replace(/(?:\r\n|\r|\n)/g, '. ');
            text = text.replace(/[^A-Za-z]+\.|;/g, '.');
            console.log(text);
            ctrl.sentenceModels = parseStory(text);
            parse(text, ctrl.sentenceModels).then(
                function (response) {
                    getQueries(ctrl.sentenceModels);
                    getImages(ctrl.sentenceModels);
                }
            );
            console.log(ctrl.sentenceModels);
        };

        ctrl.makeGIF = createGIF;

        function parseStory(text) {
            var sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
            var out = [];

            for (var s = 0; s < sentences.length; s++) {
                if(sentences[s].charAt(0) == ' ') {
                    sentences[s] = sentences[s].substring(1);
                }
                var sModel = {
                    text: sentences[s],
                    tokens: sentences[s].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(' '),
                    parse: [],
                    images: []
                };
                out.push(sModel);
            }
            return out;
        }

        function parse(text, sModels) {
            return $http({
                method: 'POST',
                url: 'https://api.projectoxford.ai/linguistics/v1.0/analyze',
                headers: {
                    'Content-type': 'application/json',
                    'Ocp-Apim-Subscription-Key': 'be825782db9342778ddc2ead7bed20ce'
                },
                data: {
                    "language": "en",
                    "analyzerIds": ["4fa79af1-f22c-408d-98bb-b7d7aeef7f04", "22a6b758-420f-4745-8a3c-46835a67c0d2"],
                    "text": text
                }
            }).then(function (response) {
                for(var s = 0; s < response.data[0].result.length; s++) {
                    var parse = response.data[0].result[s];
                    var sModel = sModels[s];
                    for (var i = 0; i < parse.length; i++) {
                        if (sw[parse[i]]) {
                            parse.splice(i, 1);
                        }
                    }
                    for (var i = 0; i < sModel.tokens.length; i++) {
                        if (sw[sModel.tokens[i]]) {
                            sModel.tokens.splice(i, 1);
                            parse.splice(i, 1);
                        }
                    }
                    sModel.parse = parse;
                    sModel.constParse = response.data[1].result[s];
                }
            });
        }

        function getQueries(sModels) {
            
				var queries = [];
				for(var s = 0; s < sModels.length; s ++) {
					var sModel = sModels[s];
					var sentence = sModel.constParse;
					
					//Noun phrase parsing
					var npIndex = 0;
					var npSentence = sentence; 
					var inVB = false;
					while(npSentence.indexOf("(NP")>=0 || npSentence.indexOf("(VP")>= 0){
						
						//do parsing for whatever appears first. NP or VP
						
						if(npSentence.indexOf("(NP")>=0 && npSentence.indexOf("(VP") == -1){
							npIndex = npSentence.indexOf("NP")+2;
							inVB = false;
						}
						else if(npSentence.indexOf("(NP") < npSentence.indexOf("(VP") && npSentence.indexOf("(NP") >= 0){
							npIndex = npSentence.indexOf("NP")+2;
							inVB = false;
							
						}
						else {
							npIndex = npSentence.indexOf("VP")+2;
							inVB = true;
							
						}
						var index = npIndex;
						var phrase = "";
						var parenCount = 1;
						//inside the noun/verb phrase
						while(parenCount > 0){
							
							if(npSentence[index] ==")"){
								parenCount--;
							
							}
							else if(npSentence[index] == "("){
								parenCount++;
								if(inVB){
									
									if(npSentence.substring(index+1, index+4) == "NP "){
										parenCount = 0;
										index--;
									}
									else if(npSentence.substring(index+1, index+4) == "NN "){
										
										var tempStr = npSentence.substring(index);
										queries.push(phrase);
										queries.push(tempStr.substring(tempStr.indexOf(" ") + 1, tempStr.indexOf(")") ) + " ")
										phrase = "";
										parenCount = 0;
										index--;
									}
								}
							}
							
							else if(npSentence[index]== " "){
								var possiblePhrase = npSentence.substring(index+1, npSentence.substring(index).indexOf(")") + index);
								
								//If there are no spaces, this means it must be a word.
								if(possiblePhrase.indexOf(" ") == -1){
									phrase += possiblePhrase + " ";
									
								}
							}
							
							index++;
						}

						if(phrase!= ""){
							if(ctrl.memeMode) {
								phrase = phrase + "memes";
							}
						
						queries.push(phrase);
						}

						//remove everything before the noun/verb phrase
						npSentence = npSentence.substring(index);
						
					}
					
					
					
					sModel.imageQueries = queries;
					
					queries = [];
				}
				
				
            }
        

        function getImages(sModels) {
            var promiseArray = [];
            for(var s = 0; s < sModels.length; s ++) {
                var sModel = sModels[s];
                for (var i = 0; i < sModel.imageQueries.length; i++) {
                    promiseArray.push(imageRequest(sModel.imageQueries[i]));
                }
            }
            return $q.all(promiseArray).then(function (responses) {
                console.log(responses);
                var t = 0;
                for(var s = 0; s < sModels.length; s ++) {
                    for(var i = 0; i < sModels[s].imageQueries.length; i ++) {
                        sModels[s].images[i] = responses[t];
                        t++;
                    }
                }
            });
        }

        function imageRequest(query) {
            var promise = $q.defer();
            $http({
                method: 'GET',
                url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + query + '&count=1',
                headers: {
                    'Ocp-Apim-Subscription-Key': '0556a03c473a4532b090905857709a02'
                }
            }).then(function (response) {
                if(response.data.value[0]) {
                    promise.resolve(response.data.value[0].contentUrl);
                } else {
                    promise.resolve("");
                }
                },
                function (error) {
                    promise.resolve("");
                });
            return promise.promise;
        }

        // Returns a random integer between min (included) and max (excluded)
        // Using Math.round() will give you a non-uniform distribution!
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function createGIF(){
            urls = [];
            for (sent of ctrl.sentenceModels){
                for (url of sent.images){
                    urls.push(url);
                }
            }
            encodeGIF(urls);
            function encodeGIF(links){
                var encoder = new GIFEncoder();
                encoder.setRepeat(0);
                encoder.setDelay(500);
                encoder.start();
                for (var i=0;i<links.length;i++){
                    $http.get(links[i].replace(/http/g, 'https'), {responseType:'blob'})
                        .then(function(results){
                            var data = results.data;
                            var blob = new Blob(
                                [data],
                                {type: "image/png"}
                            );
                            var canvas = document.createElement("canvas");
                            canvas.width = image.width;
                            canvas.height = image.height;
                            canvas.getContext("2d").drawImage(image, 0, 0);
                            encoder.addFrame(canvas);
                        });
                }
                encoder.finish();
                document.getElementById('image').src = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
            }
        }
		
		
    }
})();
