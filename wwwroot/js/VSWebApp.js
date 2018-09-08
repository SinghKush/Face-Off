var myVSPingApp = angular.module("myVSPingApp", []);
myVSPingApp.controller("myController", myControllerFunc);

console.log("angular initialized");
function myControllerFunc($scope, $http) {
    console.log("controller");
    $scope.response = null; //Holds the API response

    $scope.activeTable = "VisualSearch"; //Tracks which information is displayed in the main table
    $scope.activeEmotion = 0;
    $scope.player = 0;
    $scope.score = 0;
    $scope.delta = 0;
   

    $scope.searchFromImg = function () {//Handles sending and recieving API queries of an uploaded image
        var dataURI = window.localStorage.getItem("face.png"); //Selects image (currently we only handle one file at a time)
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        var img = new Blob([new Uint8Array(array)], { type: 'image/png' });

       
        if (img === null) {//Terminates if an image isnt selected
            return;
        }
        //restarts the json checkbox if the user clicks search
        if ($scope.showJSONChecked) {
            $scope.showJSONChecked = !$scope.showJSONChecked;
        }
        
       
        $scope.response = null; //Clears previous response
        
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
                    console.log($scope.response);
                    if ($scope.activeEmotion == 0) {
                        $scope.delta = vsResponse[0].faceAttributes.emotion.happiness;
                    } else if ($scope.activeEmotion == 1) {
                        $scope.delta = vsResponse[0].faceAttributes.emotion.anger + 0.5 * vsResponse[0].faceAttributes.emotion.contempt;
                    } else if ($scope.activeEmotion == 2) {
                        $scope.delta = vsResponse[0].faceAttributes.emotion.sadness + 0.5 * vsResponse[0].faceAttributes.emotion.neutral;
                    } else if ($scope.activeEmotion == 3) {
                        $scope.delta = vsResponse[0].faceAttributes.emotion.surprise + 0.5 * vsResponse[0].faceAttributes.emotion.fear;
                    }
                    $scope.score += $scope.delta;
                    if ($scope.player == 1) {
                        document.querySelector("#p1score").innerHTML = parseInt($scope.score * 10);
                    } else {
                        document.querySelector("#p2score").innerHTML = parseInt($scope.score * 10);
                    }
                    document.querySelector("#deltascorevalue").innerHTML = parseInt($scope.delta * 10);
                    document.querySelector("#deltascore").style.visibility = "visible";
                    setTimeout(function () { document.querySelector("#deltascore").style.visibility = "hidden" }, 1000);
                }
            });
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
    };
    $scope.startGame = function () {
        $scope.score = 0;
        for (var i = 0; i < 10; i++) {
            setTimeout($scope.runOneGame, i * 2000);
        }
    }
}