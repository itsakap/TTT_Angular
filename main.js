// main.js*/

/*CONTENTS:*/
  /*

  FIREBASE LOGIC
  HELPERS
  GAME LOGIC
  DIRECTIVES

  */
/*!CONTENTS*/


var app = angular.module("TTT",[
  "firebase"]);

app.factory("GameCreator", ["$q","$firebase",function($q, $firebase){
  var deferred = $q.defer();
  //note that you can navigate to folders
  var ref = new Firebase("https://tictactohnoshebettadont.firebaseio.com/");//this is my fb
  $firebase(ref).$on("loaded",function(value){
    var games = $firebase(ref);
    //get keys for all games
    var IDs = games.$getIndex();
    //function for creating a new game
    var initGame = function(n){
      //add a new game to the list of games
      games.$add({
          //the board's state and turns, shared by all users
          board:[['','',''],['','',''],['','','']],
          playerOnesTurn:true,
          turns:0,
          //player objects are in the cloud for access in directives, and so
          //that players can VIEW each others' properties
          playerone:{charselection:0, nameIndex:0,piece:'x', ready:false,won:false},
          playertwo:{charselection:-100,nameIndex:1,piece:'o',ready:false,won:false},
          //helpers to sync and assign player
          xIsAvailable:false,
          oIsAvailable:true
      });
      //my opponent did something.  His/her actions need to appear on my screen.
      games.$on("change",function(){  
        deferred.resolve( games.$child(games.$getIndex()[n]) );
      });
    };
    var n = IDs.length;
    //if no games, then build a game
    if(n == 0){
      initGame(n);
    }
    //else, find out if either a game is available, or a new game needs to be built
    else{
      //if last - 1 has a spot, put me in that game, else create me a new game
      var checkThisGame = games.$child(IDs[n-1]);
      checkThisGame.$on('loaded',function(){
        if(checkThisGame.oIsAvailable == true){
          checkThisGame.oIsAvailable = false;
          checkThisGame.$save();
          deferred.resolve(checkThisGame);
        }
        else{
          initGame(n);
        }
      });
    }    
  });
  return deferred.promise;
}])
 
app.controller ('BoardCtrl', function($scope,$timeout,GameCreator,$window) {
  GameCreator.then(function(returnedData){
    /*<FIREBASE LOGIC (creates the multiplayer "cloud")>*/
    returnedData.$on('loaded',function(){
      $scope.game = returnedData;
      var piece;
      if(returnedData.oIsAvailable == true){
        piece = 'x';
      }
      else {
        piece = 'o';
      }
      $scope.myPiece = {
        val:piece
      };

      $window.onbeforeunload = function (event) {
        //delete this game from the firebase I/O
        returnedData.$remove();
        return null;
      }
    /*< ! FIREBASE LOGIC>*/

    /*<HELPERS (functions for UX)>*/

      $scope.pageToggle = 0;
      $scope.names =["Milk",
                     "April Carrion",
                     "Vi Vacious",
                     "Adore Delano",
                     "Joslyn Fox",
                     "Bianca del Rio",
                     "Courtney Act",
                     "Miss Darienne Lake",
                     "Laganja Estranja",
                     "Gia Gunn",
                     "Magnolia Crawford",
                     "Trinity K. Bonet",
                     "Kelly Mantle",
                     "Ben DeLaCreme"
                    ];

      $scope.start = function(){
        //"bind" this window to a player
        if($scope.pageToggle ==0){
          $scope.pageToggle++;
        }
        else {
          //shouldn't happen
          $scope.pageToggle = 2;
        }
      };

      $scope.getStyle = function(c){
        //verify that we have added this player's scope to the turn.
        if(c=='x' && $scope.game.playerone != undefined){
          return {backgroundPosition:$scope.game.playerone.charselection+"px 0px"};
        }
        if(c=='o' && $scope.game.playertwo != undefined){
          return {backgroundPosition:$scope.game.playertwo.charselection+"px 0px"};
        }
        //style is not returned if empty cell
      };
      $scope.proceedToBoard = function(){
        $timeout(function(){
          if($scope.game.playerone.ready && $scope.game.playertwo.ready){
            $scope.pageToggle=2;
          }
        },4000);
        $scope.$watchCollection('[game.playerone.ready,game.playertwo.ready]',function(n){
          if(n[0] && n[1]){
            $scope.pageToggle = 2;
            $scope.$watchCollection('[game.playerone.won,game.playertwo.won]',function(k){
            if(k[0] || k[1]){
              $scope.game.winner = k[0] ? $scope.game.playerone : $scope.game.playertwo;
              $scope.game.$save();
              $scope.pageToggle = 3;
              k[0] = k[1] = false; //this should keep firebase from janking the app
          }
        });
          }
        });
      };
      $scope.werkAgain = function(){
        //reset all of the shit and start a new game
        $scope.newGame();
      };
      /*< ! HELPERS>*/


     /*<GAME LOGIC (functions for the game itself)>*/



      $scope.newGame = function(){
        if($scope.game.turns != 0){
          $scope.game.turns = 0; $scope.game.playerOnesTurn=true;
          $scope.game.board = [['','',''],['','',''],['','','']];
          $scope.game.playerone.won = false;
          $scope.game.playertwo.won = false;
          $scope.game.winner = null;
          $scope.game.$save();
        }
        $timeout(function(){
          $scope.pageToggle = 2;
        },1000);
        

      };

      $scope.playMove = function(c,r){
        var p = $scope.game.playerOnesTurn;
        var piece = p ? 'x' : 'o';

        //if cell is empty and the piece I got equals piece predicated on player turn...
        if(($scope.game.board[c][r]=='') && ($scope.myPiece.val == piece)){
          $scope.game.board[c][r] = piece;
          $scope.game.turns++;
          $scope.game.$save();
          endTurn(c,r,piece);
        }
      };

      function endTurn(c,r,p){
        //initialize some possible win conditions as true, and search for counter-examples
        var horWin = true, vertWin = true, diag1Win = true, diag2Win = true, bd = $scope.game.board, catsGame = ($scope.game.turns==9);
        for (var i = 0; i < 3; i++){
          if(bd[i][r]!=p) horWin = false;
          if(bd[c][i]!=p) vertWin = false;
          if(!(c==r && bd[i][i]==p)) diag1Win = false;
          if(!(c+r==2 && bd[i][2-i]==p)) diag2Win = false;
        }
        if(horWin || vertWin || diag1Win || diag2Win) endGame(p);
        else if(catsGame) endGame('cats game :(');
        else /*new turn*/ {
          $scope.game.playerOnesTurn = !$scope.game.playerOnesTurn;
          $scope.game.$save();
         
        } 
      };
      function endGame (msg){
        //a slight delay which might not be necessary if we move that new game function
        //include logic for segueing to win page
        $timeout(function(){
          msg == 'x' ? $scope.game.playerone.won = true : $scope.game.playertwo.won = true;
          $scope.game.$save();
          //$scope.newGame();
        },500);
      }
    });
  });
});
/*< ! GAME LOGIC>*/


/*<DIRECTIVES (functions for custom markup)>*/
app.directive('intro',function(){
  return{
    restrict:"E",
    templateUrl:"partials/intro.html"
  } 
})
app.directive('characters',function(){
  return{
    restrict:"E",
    templateUrl:"partials/characters.html",
    scope:{player:"=",charname:"@"},
    link:function(s){

      //we can initialize the style of the opposite carousel to be a little opaque!

      //$watch function for background position of spritesheets
      s.$watch('player.charselection',function(n){
        s.carouselstyle = {backgroundPosition: n +"px 0px"};
      })

      //<carousel slider buttons>
      s.slide = function(direction){
        if(s.player.piece == s.$parent.myPiece.val){
          //new background position for sprite sheet
          var newPosition = (direction=='left') ? 1300 : 100;
          //new index in name array
          var newIndex = newPosition / 100;
          //traverse the sprite and possibly wrap around it.
          s.player.charselection -= newPosition; s.player.charselection %= 1400;
          //traverse and possibly wrap around name array
          s.player.nameIndex += newIndex; s.player.nameIndex %=14;
          //send data to cloud
          s.$parent.$parent.game.$save();
        }
      };
      s.werk = function(){
        if(s.player.piece == s.$parent.myPiece.val && !s.player.ready){
          s.player.ready = true;
          s.$parent.$parent.game.$save();

          s.$parent.$parent.proceedToBoard();
          //SOUND EFFECT
        }
      }
      //</carousel slider buttons>      
    }
  }
})
app.directive('board',function(){
  return {
    restrict:"E",
    templateUrl: "partials/board.html",
    link:function(s){
      s.click = function(c,r){
        s.$parent.playMove(c,r);
      }
      s.sty = function(c){
        return s.$parent.getStyle(c);
      }
    }
  }
})
app.directive('winner',function(){
  return{
    restrict:"E",
    templateUrl:"partials/winner.html",

    link:function($scope,e,a){

    }
  }
})
//< ! DIRECTIVES>