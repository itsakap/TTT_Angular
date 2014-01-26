var app = angular.module('TTT',["firebase"]);
  
app.controller ('BoardCtrl', function($scope,$timeout,$firebase) {

/*<FIREBASE LOGIC>*/

  var ref = new Firebase("https://tictactohnoshebettadont.firebaseio.com/");//this is my fb
  $scope.fbRoot = $firebase(ref);

  //wait until everything really is loaded
  $scope.fbRoot.$on("loaded",function(){
    IDs = $scope.fbRoot.$getIndex();

    if(IDs.length == 0){  
      //no board --> let's build one!
      $scope.fbRoot.$add({
        board:[['','',''],['','',''],['','','']],
        playerOnesTurn:true,
        playerone:{charselection:0, nameIndex:0},
        playertwo:{charselection:-100,nameIndex:1},
        turns:0,
        xIsAvailable:true,
        oIsAvailable:true,
        names : [{name: "Milk"},
                 {name: "April Carrion"},
                 {name: "Vi Vacious"},
                 {name: "Adore Delano"},
                 {name: "Joslyn Fox"},
                 {name: "Bianca del Rio"},
                 {name: "Courtney Act"},
                 {name: "Miss Darienne Lake"},
                 {name: "Laganja Estranja"},
                 {name: "Gia Gunn"},
                 {name: "Magnolia Crawford"},
                 {name: "Trinity K. Bonet"},
                 {name: "Kelly Mantle"},
                 {name: "Ben DeLaCreme"}
                ]
      });
      $scope.fbRoot.$on("change",function(){
        IDs = $scope.fbRoot.$getIndex();
        $scope.obj = $scope.fbRoot.$child(IDs[0]);
      
      });
    }
    else{
      $scope.obj = $scope.fbRoot.$child(IDs[0]);
    }
  });

/*</FIREBASE LOGIC>*/


  $scope.pageToggle = 0;
  $scope.start = function(){
    if(($scope.obj.xIsAvailable || $scope.obj.oIsAvailable) && $scope.pageToggle ==0){
      if($scope.obj.xIsAvailable){
        $scope.obj.xIsAvailable = false;
        $scope.myPiece = 'x';
      }
      else{
        $scope.obj.oIsAvailable  = false;
        $scope.myPiece = 'o';
      }
    $scope.obj.$save();
  }
  $scope.pageToggle++;
  };

  $scope.getStyle = function(c){
    if($scope.obj.playerone != undefined || $scope.obj.playertwo != undefined) {
    if(c=='x' && $scope.obj.playerone != undefined){
      return {backgroundPosition:$scope.obj.playerone.charselection+"px 0px"};
    }
    if(c=='o' && $scope.obj.playertwo != undefined){
      return {backgroundPosition:$scope.obj.playertwo.charselection+"px 0px"};
    }
  }
    //style is not returned if empty cell
  }

//**** <GAME LOGIC> ****//


  $scope.newGame = function(){
    $scope.obj.turns = 0; $scope.obj.playerOnesTurn=true;
    $scope.obj.board = [['','',''],['','',''],['','','']];
    $scope.obj.$save();
  };
  //$scope.newGame();  // initialize the variables inside of the newGame function we just created
  $scope.playMove = function(c,r){
    var p = $scope.obj.playerOnesTurn;
    var piece = p ? 'x' : 'o';

    //if cell is empty and the piece I got equals piece predicated on player turn...
    if(($scope.obj.board[c][r]=='') && ($scope.myPiece == piece)){
      $scope.obj.board[c][r] = piece;
      $scope.obj.turns++;
      $scope.obj.$save();
      endTurn(c,r,piece);
  }
//<i might not use some of these...>
  var itIsMyTurn = function(){
    return itIsMySymbolsTurn() || (currentSymbolUnused() && iDontHaveASymbol());
  }
  var itIsMySymbolsTurn = function(){  // what is it is my turn defined as???

  }
  var currentSymbolUnused = function(){

  }
  var iDontHaveASymbol = function(){
    return !mySymbol;
  }
  var cellIsEmpty = function(c,r){
    return $scope.obj.board[c][r] == '';
  }
  };

//</i might not use some of these...>

  function endTurn(c,r,p){
    var horWin = true, vertWin = true, diag1Win = true, diag2Win = true, bd = $scope.obj.board, catsGame = ($scope.obj.turns==9);
    for (var i = 0; i < 3; i++){
      if(bd[i][r]!=p) horWin = false;
      if(bd[c][i]!=p) vertWin = false;
      if(!(c==r && bd[i][i]==p)) diag1Win = false;
      if(!(c+r==2 && bd[i][2-i]==p)) diag2Win = false;
    }
    if(horWin || vertWin || diag1Win || diag2Win) endGame(p + ' winned!');
    else if(catsGame) endGame('cats game :(');
    else {
      $scope.obj.playerOnesTurn = !$scope.obj.playerOnesTurn;
      $scope.obj.$save();
    } //new turn
  };
  function endGame (msg){
    //a slight delay which might not be necessary if we move that new game function
    $timeout(function(){
      alert(msg);
      $scope.newGame();
    },500);
  }


});
/****</GAME LOGIC>****/


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
      //$watch function for background position of spritesheets
      s.$watch('player.charselection',function(n){
        s.carouselstyle = {backgroundPosition: n +"px 0px"};
      })
      //<carousel slider buttons>
      s.slide = function(direction){
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
      };
      //</carousel slider buttons>      
    }
  }
}
)
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
