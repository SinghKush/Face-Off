﻿var myVSPingApp = angular.module("myVSPingApp", []);
myVSPingApp.controller("myController", myControllerFunc);
myVSPingApp.filter('decodeURI', function ($window) {//Decodes URI's for readability
    return $window.decodeURI;
});
myVSPingApp.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeFunc = scope.$eval(attrs.customOnChange);
            element.bind('change', function (event) {
                var files = event.target.files;
                onChangeFunc(files);
            });
            element.bind('click', function () {
                element.val('');
            });
        }
    };
});
console.log("angular initialized");
function myControllerFunc($scope, $http) {
    console.log("controller");
    $scope.response = null; //Holds the API response
    $scope.parsedJson = ""; //Holds the response after being parsed into a "pretty" string
    $scope.msg; //Holds the Loading/Error indicator
    $scope.url; //Holds the Query URL
    $scope.market = "en-US"; //Holds the query market
    $scope.site = null; //Holds the specific domain to search within
    $scope.showJSONChecked = false; //Holds state of the checkbox
    $scope.visibility = { //Holds the visibility status of different elements of the page
        "ImageResults": false,
        "Tags": false,
        "JSON": false,
        "RadioButtons": false
    };
    $scope.activeTable = "VisualSearch"; //Tracks which information is displayed in the main table
    $scope.activeEmotion = "happiness";
    $scope.score = 0;
    $scope.setVisibility = function (visibility) {//Function to set visibility
        visibility['ImageResults'] = visibility;
        visibility['Tags'] = visibility;
        visibility['JSON'] = visibility;
        visibility['RadioButtons'] = visibility;
    };

    $scope.searchFromImg = function () {//Handles sending and recieving API queries of an uploaded image
        var dataURI = window.localStorage.getItem("face.png"); //Selects image (currently we only handle one file at a time)
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        var img = new Blob([new Uint8Array(array)], { type: 'image/png' });

        $scope.url = null; //Clears URL box
        if (img === null) {//Terminates if an image isnt selected
            return;
        }
        //restarts the json checkbox if the user clicks search
        if ($scope.showJSONChecked) {
            $scope.showJSONChecked = !$scope.showJSONChecked;
        }
        var domainToFilterResultsTo = $scope.site;//Sets a site to specify results from if it exists
        var knowledgeRequestPayload = //Creates the body of the request
            {
                knowledgeRequest: {
                    filters: {
                        site: domainToFilterResultsTo
                    }
                },
                imageInfo: {
                    cropArea: { top: 0, left: 0, right: 1.0, bottom: 1.0 },
                    url: null
                }
            };
        $scope.msg = "Loading..."; //Updates loading indicator
        $scope.response = null; //Clears previous response
        $scope.setVisibility(false); //Hides elements with unloaded information

        var formData = new FormData(); //Creates new form object to send to API
        formData.append("image", img); //Add image to request
        //formData.append("knowledgeRequest", JSON.stringify(knowledgeRequestPayload)); Add body to request
        console.log("Ready to send request");
        var requestPayloadFormData = formData;
        $http(//Sends post request to the server
            {
                url: '/api/Search', //Sends data to the search controller, not directly to the endpoint
                method: 'POST', //Specifices the use of a post request
                data: requestPayloadFormData,
                headers: { 'Content-Type': undefined }, //Manually add headers
                transformRequest: angular.identity
            }
        ).then(
            function (webapiresponse) { //on success
                if (webapiresponse) {
                    var vsResponse = webapiresponse.data; //Recieve response information
                    $scope.response = vsResponse; //Save information to update the page
                    $scope.parsedJson = getJsonParsed(vsResponse); //Parse response into string
                    $scope.setVisibility(true); //Makes loaded elements visible again
                    $scope.msg = null; //Clear loading 
                    console.log($scope.response);
                    $scope.score = $scope.score + pscope.response.faceAttributes.emotion.$scope.activeEmotion;
                    console.log($scope.score);
                }
            },
            function (webapiresponse) { //on failure
                $scope.msg = "Service Error"; //Update loading indicator
            });
    };
    $scope.getVisualSearchResults = function (actionType) {//Isolates part of the response for different tables
        if ($scope.response === null || $scope.response.length === 0) //If there's no response return an empty array
            return [];

        var vs = $scope.response.faceAttributes.emotion.find(t => t.actionType === actionType);
        if (vs === undefined) {//If there are no action types, return an empty array
            return [];
        }
        if ($scope.response) {
            $scope.parsedJson = getJsonParsed($scope.response);
        }
        return vs.data.value;
    };
    $scope.copyToClipboard = function (name) {//Handles copying the JSON response to the clipboard
        var copyElement = document.createElement("textarea"); //Creates a copy element
        copyElement.style.position = 'fixed';
        copyElement.style.opacity = '0';
        copyElement.textContent = '' + $scope.parsedJson;
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(copyElement);
        copyElement.select();
        document.execCommand('copy');
        body.removeChild(copyElement);
    };
    var varCounter = 0;
    var intervalId = null;
    $scope.runOneGame = function () {
        video = document.querySelector("#videoElement");
        preview = document.querySelector("#preview");
        preview.getContext('2d').drawImage(video, 0, 0, 160, 120);
        var image_url = preview.toDataURL('image/png');
        localStorage.setItem("face.png", image_url);
        $scope.searchFromImg();
        setTimeout(1000);
    };
    $scope.startGame = function () {
        for (var i = 0; i < 10; i++) {
            setTimeout($scope.runOneGame, i * 1000);
        }
    }
}
function getJsonParsed(json) { //Parses the JSON into a string object
    var out = JSON.stringify({ json }, null, "\t");
    return out;
}
function handleFileSelect(selector) {
    var f = document.getElementById(selector).files[0]; // FileList object   
    var reader = new FileReader();

    // Capture the file information.
    reader.onload = (function (theFile) {
        return function (e) {
            var fileOutput = document.getElementById('thumbnail');

            if (fileOutput.childElementCount > 0) {
                fileOutput.removeChild(fileOutput.lastChild);  // Remove the current pic, if it exists
            }

            // Render thumbnail.
            var span = document.createElement('span');
            span.innerHTML = ['<img class="actualImage" src="', e.target.result,
                '" title="', escape(theFile.name), '"/>'].join('');
            fileOutput.insertBefore(span, null);
        };
    })(f);
    reader.readAsDataURL(f);
   
}