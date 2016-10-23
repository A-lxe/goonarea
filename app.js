(function () {
    angular.module('App', ['ngRoute'])
        .config(function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: "app.html",
                    controller: StoryCtrl,
                    controllerAs: "ctrl"
                })
                .when('/:text', {
                    templateUrl: "app.html",
                    controller: StoryCtrl,
                    controllerAs: "ctrl"
                });
        })
        .controller('StoryCtrl', ['$scope', '$rootScope', '$http', '$q', '$routeParams', '$location', '$timeout', StoryCtrl]);

    function StoryCtrl($scope, $rootScope, $http, $q, $routeParams, $location, $timeout) {
        var ctrl = this;
        ctrl.input = "";
        ctrl.currentInput = "";
        ctrl.sentenceModels = [];
        ctrl.advancedMode = false;
        ctrl.memeMode = false;
		ctrl.nsfwMode = false;
        ctrl.storyMode = false;
        ctrl.gifReady = false;
        ctrl.gifSpeed = 1000;
        ctrl.run = run;
        ctrl.makeGIF = createGIF;
        ctrl.getShareLink = getShareLink;
        ctrl.shareLink = function () {
            window.prompt("Copy: Ctrl-C Enter", getShareLinkEscaped());
        };
        ctrl.facebookShare = facebookShare;
        ctrl.twitterShare = twitterShare;

        if ($routeParams.text) {
            var inpObj = JSON.parse(unescape($routeParams.text));
            console.log(JSON.stringify(inpObj));
            ctrl.input = inpObj.text;
            ctrl.memeMode = inpObj.memeMode;
            ctrl.storyMode = inpObj.storyMode;
            ctrl.advancedMode = inpObj.advancedMode;
			ctrl.nsfwMode = inpObj.nsfwMode;
            ctrl.run();
        }

        var stopwords = ["then", "there", "this", "i", "it", "a", "a\'s", "able", "after", "afterwards", "again", "almost", "along", "also", "although", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anyways", "anywhere", "apart", "appear", "around", "as", "aside", "at", "available", "away", "awfully", "b", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "being", "below", "beside", "besides", "better", "both", "but", "by", "c", "c\'s", "cause", "causes", "co", "com", "come", "comes", "concerning", "consequently", "d", "e", "each", "edu", "eg", "especially", "et", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "f", "far", "for", "forth", "four", "from", "further", "furthermore", "g", "h", "had", "hadn\'t", "has", "hasn\'t", "have", "haven\'t", "having", "he", "he\'s", "her", "herself", "him", "himself", "his", "how", "however", "i\'d", "i\'ll", "i\'m", "i\'ve", "ie", "if", "in", "inasmuch", "inc", "insofar", "instead", "into", "is", "isn\'t", "it", "it\'d", "it\'ll", "it\'s", "its", "itself", "j", "just", "k", "kept", "know", "l", "lately", "later", "let", "let\'s", "ltd", "m", "may", "me", "might", "must", "my", "myself", "n", "namely", "nd", "o", "of", "off", "often", "oh", "ok", "okay", "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "overall", "own", "p", "per", "perhaps", "placed", "q", "que", "quite", "qv", "r", "rather", "rd", "re", "s", "said", "saw", "secondly", "self", "selves", "she", "since", "six", "so", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "sub", "such", "sup", "sure", "t", "t\'s", "th", "than", "that", "that\'s", "thats", "the", "their", "theirs", "them", "themselves", "there", "there\'s", "therefore", "theres", "these", "they", "they\'d", "they\'ll", "they\'re", "they\'ve", "third", "those", "though", "three", "thru", "thus", "to", "too", "took", "twice", "two", "u", "un", "until", "unto", "upon", "us", "use", "used", "uses", "using", "uucp", "v", "was", "wasn\'t", "we", "we\'d", "we\'ll", "we\'re", "we\'ve", "were", "weren\'t", "what", "what\'s", "when", "whence", "whenever", "where", "where\'s", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "who\'s", "whoever", "whole", "whom", "whose", "why", "will", "willing", "with", "within", "without", "won\'t", "would", "wouldn\'t", "x", "y", "you", "you\'d", "you\'ll", "you\'re", "you\'ve", "your", "yours", "yourself", "yourselves", "z", "zero", "\!", "\#", "\$", "\%", "\&", "\'", "\(", "\)", "\*", "\+", "\-", ".", ",", "/", ":", ";", "\<", "=", "\>", "\?", "@", "\[", "\]", "\^", "\_", "\`", "\{", "\|", "\}", "\~"]
        var sw = {};
        for (var i = 0; i < stopwords.length; i++) {
            sw[stopwords[i]] = true;
        }


        function run() {
            ctrl.gifReady = false;
            var text = ctrl.input;
            text = text + '.';
            text = text.replace(/(?:\r\n|\r|\n)/g, '. ');
            text = text.replace(/[^A-Za-z]+\.|;/g, '.');
            ctrl.currentInput = text;
            ctrl.sentenceModels = parseStory(text);
            parse(text, ctrl.sentenceModels).then(
                function (response) {
                    getQueries(ctrl.sentenceModels);
                    getImages(ctrl.sentenceModels).then(function (response) {
                        createGIF().then(
                            function (response) {
                                imgrRequest(response).then(
                                    function (response) {
                                        $rootScope.shareImgUrl = response.data.data.gifv;
                                    }
                                )
                            }
                        );
                    });
                }
            );
            console.log(ctrl.sentenceModels);
        }

        function parseStory(text) {
            var sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
            var out = [];

            for (var s = 0; s < sentences.length; s++) {
                if (sentences[s].charAt(0) == ' ') {
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
                for (var s = 0; s < response.data[0].result.length; s++) {
                    let parse = response.data[0].result[s];
                    let sModel = sModels[s];
                    for (var i = 0; i < parse.length; i++) {
                        if (sw[parse[i]]) {
                            parse.splice(i, 1);
                        }
                    }

                    sModel.parse = parse;
                    sModel.constParse = response.data[1].result[s];
                    // for (var i = 0; i < sModel.tokens.length; i++) {
                    //     if (sw[sModel.tokens[i]]) {
                    //         sModel.tokens.splice(i, 1);
                    //         parse.splice(i, 1);
                    //     }
                    // }
                }
            });
        }

        function getQueries(sModels) {
            if (!ctrl.advancedMode) {
                var queries = [];
                for (var s = 0; s < sModels.length; s++) {
                    queries = [];
                    var sModel = sModels[s];
                    var pos = sModel.parse;
                    var words = sModel.tokens;


                    var acceptableWords = [];

                    for (var i = 0; i < words.length; i++) {
                        var q = "";
                        if (pos[i].indexOf("VB") >= 0) {
                            q = words[i];
                        }
                        else if (pos[i].indexOf("NN") >= 0) {

                            if (i > 0 && (pos[i - 1].indexOf("JJ") >= 0 || pos[i - 1] == "CD")) {
                                q += words[i - 1] + " ";

                            }
                            q += words[i];

                        }

                        if (q != "")
						{
							if(ctrl.memeMode){
								q + " meme";
							}
							if(ctrl.nsfwMode)
							{
								
								q + " porn";
							}
                            queries.push(q);
						}

                    }
                    sModel.imageQueries = queries;
                }
            } else {
                var queries = [];
                for (var s = 0; s < sModels.length; s++) {
                    var sModel = sModels[s];
                    var sentence = sModel.constParse;

                    //Noun phrase parsing
                    var npIndex = 0;
                    var npSentence = sentence;
                    var inVB = false;
                    while (npSentence.indexOf("(NP") >= 0 || npSentence.indexOf("(VP") >= 0) {

                        //do parsing for whatever appears first. NP or VP

                        if (npSentence.indexOf("(NP") >= 0 && npSentence.indexOf("(VP") == -1) {
                            npIndex = npSentence.indexOf("NP") + 2;
                            inVB = false;
                        }
                        else if (npSentence.indexOf("(NP") < npSentence.indexOf("(VP") && npSentence.indexOf("(NP") >= 0) {
                            npIndex = npSentence.indexOf("NP") + 2;
                            inVB = false;

                        }
                        else {
                            npIndex = npSentence.indexOf("VP") + 2;
                            inVB = true;

                        }
                        var index = npIndex;
                        var phrase = "";
                        var parenCount = 1;
                        //inside the noun/verb phrase
                        while (parenCount > 0) {

                            if (npSentence[index] == ")") {
                                parenCount--;

                            }
                            else if (npSentence[index] == "(") {
                                parenCount++;
                                if (inVB) {

                                    if (npSentence.substring(index + 1, index + 4) == "NP ") {
                                        parenCount = 0;
                                        index--;
                                    }
                                    else if (npSentence.substring(index + 1, index + 4) == "NN ") {

                                        var tempStr = npSentence.substring(index);
                                        queries.push(phrase);
                                        queries.push(tempStr.substring(tempStr.indexOf(" ") + 1, tempStr.indexOf(")")) + " ")
                                        phrase = "";
                                        parenCount = 0;
                                        index--;
                                    }
                                }
                            }

                            else if (npSentence[index] == " ") {
                                var possiblePhrase = npSentence.substring(index + 1, npSentence.substring(index).indexOf(")") + index);

                                //If there are no spaces, this means it must be a word.
                                if (possiblePhrase.indexOf(" ") == -1) {
                                    phrase += possiblePhrase + " ";

                                }
                            }

                            index++;
                        }

                        if (phrase != "") {
                            if (ctrl.memeMode) {
                                phrase = phrase + "memes";
                            }

							if(ctrl.nsfwMode){
								
								phrase = phrase + "porn";
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
        }


        function getImages(sModels) {
            var promiseArray = [];
            for (var s = 0; s < sModels.length; s++) {
                var sModel = sModels[s];
                for (var i = 0; i < sModel.imageQueries.length; i++) {
                    promiseArray.push(imageRequest(sModel.imageQueries[i]));
                }
            }
            return $q.all(promiseArray).then(function (responses) {
                console.log(responses);
                var t = 0;
                for (var s = 0; s < sModels.length; s++) {
                    for (var i = 0; i < sModels[s].imageQueries.length; i++) {
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
                url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + query + '&count=1&aspect=Square' + '&size=Medium' + (ctrl.storyMode ? '&imageType=Clipart' : "") + (ctrl.nsfwMode ? '&safeSearch=Off' : ""),
                headers: {
                    'Ocp-Apim-Subscription-Key': '0556a03c473a4532b090905857709a02'
                }
            }).then(function (response) {
                    if (response.data.value[0]) {
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

        function createGIF() {
            urls = [];
            for (sent of ctrl.sentenceModels) {
                for (url of sent.images) {
                    urls.push(url);
                }
            }
            return encodeGIF(urls);
            function encodeGIF(links) {
                var encoder = new GIFEncoder();
                encoder.setSize(300, 300);
                encoder.setRepeat(0);
                encoder.setDelay(ctrl.gifSpeed);
                encoder.start();
                var imgs = [];
                for (var i = 0; i < links.length; i++) {
                    let img = new Image;
                    img.src = links[i];
                    img.i = i;
                    img.onload = function () {

                    };
                    imgs.push(img);
                }
                console.log(imgs);
                return $timeout(
                    function () {
                        var canvas = document.getElementById("canvas");
                        canvas.width = 300;
                        canvas.height = 300;
                        var context = canvas.getContext("2d");
                        for (var i = 0; i < imgs.length; i++) {
                            let img = imgs[i];
                            if (!img.complete || img.naturalWidth === 0) continue;
                            context.fillStyle = "black";
                            context.fillRect(0, 0, 300, 300);
                            context.rect(0, 0, 300, 300);
                            let width = img.width
                            let height = img.height
                            let largest_dim = Math.max(width, height);
                            if (largest_dim > 300) {
                                let dilation_factor = 300 / largest_dim;
                                width = width * dilation_factor;
                                height = height * dilation_factor;
                            }
                            let x_0 = 300 - width;
                            let y_0 = 300 - height;
                            context.drawImage(img, x_0 / 2, y_0 / 2, width, height);
                            encoder.addFrame(context);
                        }
                        encoder.finish();

                        document.getElementById('image').src = 'data:image/gif;base64,' + encode64(encoder.stream().getData());
                        ctrl.gifReady = true;
                        return encode64(encoder.stream().getData());
                    }, 3000);
            }
        }

        function getShareLink() {
            var link = "https://a-lxe.github.io/storeel" + "#/";
            link = link + JSON.stringify({
                    text: ctrl.currentInput,
                    advancedMode: ctrl.advancedMode,
                    memeMode: ctrl.memeMode,
                    storyMode: ctrl.storyMode
                });
            return link;
        }

        function getShareLinkEscaped() {
            var link = "https://a-lxe.github.io/storeel" + "#/";
            link = link + escape(JSON.stringify({
                    text: ctrl.currentInput,
                    advancedMode: ctrl.advancedMode,
                    memeMode: ctrl.memeMode,
                    storyMode: ctrl.storyMode
                }));
            return link;
        }

        function imgrRequest(query) {
            return $http({
                method: 'POST',
                url: 'https://api.imgur.com/3/image',
                headers: {
                    'Authorization': 'Client-ID 9904a80c276342f'
                },
                data: {
                    image: query
                },
                dataType: 'json'

            }).then(function (response) {
                    console.log(response);
                    return response;
                },
                function (error) {
                    console.log(error);
                });
        }

        function facebookShare() {
            console.log(getShareLink());
            FB.ui({
                method: 'share',
                name: 'Storeel',
                href: getShareLink(),
                picture: $rootScope.shareImgUrl,
                caption: 'A visual story produced by Storeel',
                description: 'Using Microsoft Cognitive APIs, Storeel takes textual stories, poetry, and 200-odd-character ' +
                'ruminations into visual adventures in conjunction with the Bing Image Search API.'
            });
        }

        function twitterShare() {
            shortenUrl(getShareLink()).then(
                function(response) {
                    console.log(response);
                    let s = "https://twitter.com/intent/tweet?" +
                        "text=" + escape("Hey come check out the visual story I made using Storeel!") + "&" +
                        "url=" + escape(response.data.data.url);
                    window.open(s);
                }
            )

        }

        function shortenUrl(url) {
            console.log(url);
            return $http(
                {
                    method: 'GET',
                    url: 'https://api-ssl.bitly.com/v3/shorten?access_token=' + 'f6e059ce201e9c2b48cabb5f0223d24ff1a261e2' + '&longUrl=' + escape(url) + ""
                }
            )
        }
    }


}());
