(function () {
    angular.module('App', [])
        .controller('MainCtrl', ['$scope', '$http', MainCtrl])
        .controller('StoryCtrl', ['$scope', '$http', StoryCtrl]);

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

    function StoryCtrl($scope, $http) {
        var ctrl = this;
        ctrl.input = "";
        ctrl.sentenceModels = [];

        var stopwords = ["a", "a\'s", "able", "about", "above", "according", "accordingly", "across", "actually", "after", "afterwards", "again", "against", "ain\'t", "all", "allow", "allows", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anyways", "anywhere", "apart", "appear", "appreciate", "appropriate", "are", "aren\'t", "around", "as", "aside", "ask", "asking", "associated", "at", "available", "away", "awfully", "b", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "believe", "below", "beside", "besides", "best", "better", "between", "beyond", "both", "brief", "but", "by", "c", "c\'mon", "c\'s", "came", "can", "can\'t", "cannot", "cant", "cause", "causes", "certain", "certainly", "changes", "clearly", "co", "com", "come", "comes", "concerning", "consequently", "consider", "considering", "contain", "containing", "contains", "corresponding", "could", "couldn\'t", "course", "currently", "d", "definitely", "described", "despite", "did", "didn\'t", "different", "do", "does", "doesn\'t", "doing", "don\'t", "done", "down", "downwards", "during", "e", "each", "edu", "eg", "eight", "either", "else", "elsewhere", "enough", "entirely", "especially", "et", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "f", "far", "few", "fifth", "first", "five", "followed", "following", "follows", "for", "former", "formerly", "forth", "four", "from", "further", "furthermore", "g", "get", "gets", "getting", "given", "gives", "go", "goes", "going", "gone", "got", "gotten", "greetings", "h", "had", "hadn\'t", "happens", "hardly", "has", "hasn\'t", "have", "haven\'t", "having", "he", "he\'s", "hello", "help", "hence", "her", "here", "here\'s", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "hi", "him", "himself", "his", "hither", "hopefully", "how", "howbeit", "however", "i", "i\'d", "i\'ll", "i\'m", "i\'ve", "ie", "if", "ignored", "immediate", "in", "inasmuch", "inc", "indeed", "indicate", "indicated", "indicates", "inner", "insofar", "instead", "into", "inward", "is", "isn\'t", "it", "it\'d", "it\'ll", "it\'s", "its", "itself", "j", "just", "k", "keep", "keeps", "kept", "know", "knows", "known", "l", "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "let\'s", "like", "liked", "likely", "little", "look", "looking", "looks", "ltd", "m", "mainly", "many", "may", "maybe", "me", "mean", "meanwhile", "merely", "might", "more", "moreover", "most", "mostly", "much", "must", "my", "myself", "n", "name", "namely", "nd", "near", "nearly", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "no", "nobody", "non", "none", "noone", "nor", "normally", "not", "nothing", "novel", "now", "nowhere", "o", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "on", "once", "one", "ones", "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "p", "particular", "particularly", "per", "perhaps", "placed", "please", "plus", "possible", "presumably", "probably", "provides", "q", "que", "quite", "qv", "r", "rather", "rd", "re", "really", "reasonably", "regarding", "regardless", "regards", "relatively", "respectively", "right", "s", "said", "same", "saw", "say", "saying", "says", "second", "secondly", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sensible", "sent", "serious", "seriously", "seven", "several", "shall", "she", "should", "shouldn\'t", "since", "six", "so", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specified", "specify", "specifying", "still", "sub", "such", "sup", "sure", "t", "t\'s", "take", "taken", "tell", "tends", "th", "than", "thank", "thanks", "thanx", "that", "that\'s", "thats", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "there\'s", "thereafter", "thereby", "therefore", "therein", "theres", "thereupon", "these", "they", "they\'d", "they\'ll", "they\'re", "they\'ve", "think", "third", "this", "thorough", "thoroughly", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "twice", "two", "u", "un", "under", "unfortunately", "unless", "unlikely", "until", "unto", "up", "upon", "us", "use", "used", "useful", "uses", "using", "usually", "uucp", "v", "value", "various", "very", "via", "viz", "vs", "w", "want", "wants", "was", "wasn\'t", "way", "we", "we\'d", "we\'ll", "we\'re", "we\'ve", "welcome", "well", "went", "were", "weren\'t", "what", "what\'s", "whatever", "when", "whence", "whenever", "where", "where\'s", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "who\'s", "whoever", "whole", "whom", "whose", "why", "will", "willing", "wish", "with", "within", "without", "won\'t", "wonder", "would", "would", "wouldn\'t", "x", "y", "yes", "yet", "you", "you\'d", "you\'ll", "you're", "you\'ve", "your", "yours", "yourself", "yourselves", "z", "zero", "\!", "\#", "\$", "\%", "\&", "\'", "\(", "\)", "\*", "\+", "\-", ".", "/", ":", ";", "\<", "=", "\>", "\?", "@", "\[", "\]", "\^", "\_", "\`", "\{", "\|", "\}", "\~"]
        var sw = {};
        for (var i = 0; i < stopwords.length; i++) {
            sw[stopwords[i]] = true;
        }

        ctrl.run = function() {
            ctrl.sentenceModels = parseStory(ctrl.input);
            for(var i = 0; i < ctrl.sentenceModels.length; i ++) {
                var sModel = ctrl.sentenceModels[i];
                console.log(ctrl.sentenceModels);
                parse(ctrl.sentenceModels[i]).then(
                    function(response) {
                        console.log(ctrl.sentenceModels);
                        getQueries(sModel);
                        getImages(sModel);
                    }
                )
            }
        };

        function parseStory(text) {
            var sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
            var out = [];

            for(var s = 0; s < sentences.length; s ++) {
                var sModel = {
                    text: sentences[s],
                    tokens: sentences[s].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(' ')
                };
                for(var i = 0; i < sModel.tokens.length; i ++) {
                    if(sw[sModel.tokens[i]]) {
                        sModel.tokens.splice(i,1);
                    }
                }
                out.push(sModel);
            }
            return out;
        }

        function parse(sModel) {
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
                    "text": sModel.text
                }
            }).then(function(response) {
                var parse = response.data[0].result[0];
                for(var i = 0; i < parse.length; i ++) {
                    if(sw[parse[i]]) {
                        parse.splice(i, 1);
                    }
                }
                sModel.parse = parse;
            });
        }

        function getQueries(sModel) {
            sModel.imageQueries = sModel.tokens;
        }

        function getImages(sModel) {
            for(var i = 0; i < sModel.imageQueries.length; i ++) {
                $http({
                    method: 'GET',
                    url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + sModel.imageQueries[i] + '&count=1',
                    headers: {
                        'Ocp-Apim-Subscription-Key': 'fbf87f6b84754136a4dfb72943c2f17e'
                    }
                }).then(function (response) {
                    sModel.images[i] = response.data.value[0].contentUrl;
                });
            }
        }
    }
})();
