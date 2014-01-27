var app = angular.module("TTT",[
  "firebase"]);
app.controller ('BoardCtrl', function($scope,$timeout,$firebase,$window) {


/*<FIREBASE LOGIC (creates the multiplayer "cloud")>*/

  var ref = new Firebase("https://tictactohnoshebettadont.firebaseio.com/");//this is my fb
  $scope.fbRoot = $firebase(ref);
  var initGame = function(n){
    $scope.fbRoot.$add({

        //the board's state and turns, shared by all users
        board:[['','',''],['','',''],['','','']],
        playerOnesTurn:true,
        turns:0,
        //player objects are in the cloud for access in directives, and so
        //that players can VIEW each others' properties
        playerone:{charselection:0, nameIndex:0,piece:'x', ready:false},
        playertwo:{charselection:-100,nameIndex:1,piece:'o',ready:false},
        
        //helpers to sync and assign player
        xIsAvailable:true,
        oIsAvailable:true

      });
      $scope.fbRoot.$on("change",function(){
        IDs = $scope.fbRoot.$getIndex();
        $scope.obj = $scope.fbRoot.$child(IDs[n]);
      });
  };
  //wait until everything really is loaded
  $scope.fbRoot.$on("loaded",function(value){
    IDs = $scope.fbRoot.$getIndex();

    if(IDs.length == 0){  
      //no board --> let's build one!
      initGame(0);
    }
    else{ // at least one game exists
      var last = IDs.length;
      $scope.loaded = false;
      $scope.obj = $scope.fbRoot.$child(IDs[last-1]);
      $timeout(function(){
        if(!$scope.obj.oIsAvailable){
          initGame(last);
          
        }
      },1);
    }
  });

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
  $scope.getPiece =function(){
      $timeout(function(){
        if($scope.obj.xIsAvailable){
          $scope.obj.xIsAvailable = false;
          $scope.myPiece = {val:'x'};
        }
        else if ($scope.obj.oIsAvailable){
          $scope.obj.oIsAvailable  = false;
          $scope.myPiece = {val:'o'};
        }
        $scope.obj.$save();
      },2000);
   
   };
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
    if(c=='x' && $scope.obj.playerone != undefined){
      return {backgroundPosition:$scope.obj.playerone.charselection+"px 0px"};
    }
    if(c=='o' && $scope.obj.playertwo != undefined){
      return {backgroundPosition:$scope.obj.playertwo.charselection+"px 0px"};
    }
    //style is not returned if empty cell
  }
  $scope.proceedToBoard = function(){
    $timeout(function(){
    if($scope.obj.playerone.ready && $scope.obj.playertwo.ready){
      $scope.pageToggle=2;
    }
  },4000);
    $scope.$watchCollection('[obj.playerone.ready,obj.playertwo.ready]',function(n){
      if(n[0] && n[1])
        $scope.pageToggle = 2;
    });
  }
//
/*< ! HELPERS>*/



/*<GAME LOGIC (functions for the game itself)>*/



  $scope.newGame = function(){
    
    $scope.obj.turns = 0; $scope.obj.playerOnesTurn=true;
    $scope.obj.board = [['','',''],['','',''],['','','']];
    $scope.obj.$save();

  };

  $scope.playMove = function(c,r){
    var p = $scope.obj.playerOnesTurn;
    var piece = p ? 'x' : 'o';

    //if cell is empty and the piece I got equals piece predicated on player turn...
    if(($scope.obj.board[c][r]=='') && ($scope.myPiece.val == piece)){
      $scope.obj.board[c][r] = piece;
      $scope.obj.turns++;
      $scope.obj.$save();
      endTurn(c,r,piece);
  }

  };

  function endTurn(c,r,p){
    //initialize some possible win conditions as true, and search for counter-examples
    var horWin = true, vertWin = true, diag1Win = true, diag2Win = true, bd = $scope.obj.board, catsGame = ($scope.obj.turns==9);
    for (var i = 0; i < 3; i++){
      if(bd[i][r]!=p) horWin = false;
      if(bd[c][i]!=p) vertWin = false;
      if(!(c==r && bd[i][i]==p)) diag1Win = false;
      if(!(c+r==2 && bd[i][2-i]==p)) diag2Win = false;
    }
    if(horWin || vertWin || diag1Win || diag2Win) endGame(p + ' winned!');
    else if(catsGame) endGame('cats game :(');
    else /*new turn*/ {
      $scope.obj.playerOnesTurn = !$scope.obj.playerOnesTurn;
      $scope.obj.$save();
    } 
  };
  function endGame (msg){
    //a slight delay which might not be necessary if we move that new game function
    $timeout(function(){
      alert(msg);
      $scope.newGame();
    },500);
  }
});
/*< ! GAME LOGIC>*/


/*<DIRECTIVES (functions for custom markup)>*/
app.directive('intro',function(){
  return{
    restrict:"E",
    templateUrl:"intro.html"
  } 
})
app.directive('characters',function(){
  return{
    restrict:"E",
    templateUrl:"characters.html",
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
          s.$parent.$parent.obj.$save();
        }
      };
      s.werk = function(){
        if(s.player.piece == s.$parent.myPiece.val && !s.player.ready){
          s.player.ready = true;
          s.$parent.$parent.obj.$save();

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
    templateUrl: "board.html",
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
/*< ! DIRECTIVES>*/