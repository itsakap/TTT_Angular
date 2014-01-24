var app = angular.module('TTT',[]);
  
app.controller ('BoardCtrl', function($scope,$timeout) {
  $scope.names = [{name: "Milk"},
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
  ];
  $scope.players = [{charselection:0},{charselection:-100}];
  $scope.pageToggle = 0;
  $scope.start = function(){
    for(var i = 0; i < $scope.players.length; i++){
    }
    $scope.pageToggle++;
  };
  $scope.getStyle = function(c){
    if(c=='x'){
      return {backgroundPosition: $scope.players[0].charselection+"px 0px"}
    }
    if(c=='o'){
      return {backgroundPosition:$scope.players[1].charselection+"px 0px"}
    }
  }


  //**** BEGIN GAME LOGIC ****//


  $scope.newGame = function(){
    turns = 0; playerOnesTurn=true;
    $scope.board = [['','',''],['','',''],['','','']];
  };
  $scope.newGame();
  $scope.playMove = function(c,r){
    var weJustClickedOn = $scope.board[c][r];
    var p = playerOnesTurn;
    if(weJustClickedOn == '') {
      var piece = p ? 'x' : 'o';
      $scope.board[c][r] = piece;
      turns++;
      endTurn(c,r,piece);
    }
  };

  function endTurn(c,r,p){
    var horWin = true, vertWin = true, diag1Win = true, diag2Win = true, bd = $scope.board, catsGame = (turns==9);
    for (var i = 0; i < 3; i++){
      if(bd[i][r]!=p) horWin = false;
      if(bd[c][i]!=p) vertWin = false;
      if(!(c==r && bd[i][i]==p)) diag1Win = false;
      if(!(c+r==2 && bd[i][2-i]==p)) diag2Win = false;
    }
    if(horWin || vertWin || diag1Win || diag2Win) endGame(p + ' winned!');
    else if(catsGame) endGame('cats game :(');
    else playerOnesTurn = !playerOnesTurn; //new turn
  };
  function endGame (msg){
    $timeout(function(){alert(msg);
    $scope.newGame();},500);
  }

});
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
    scope:{
      xoffset:"="
    },
    link:function(scope){
      scope.charname = scope.charname = scope.$parent.names[Math.abs(scope.xoffset/100)].name;
      scope.carouseloff = {backgroundPosition:scope.xoffset+"px 0px"};
      scope.goLeft = function(){
        scope.xoffset -= 1300;
        scope.xoffset %= 1400;
        scope.carouseloff ={backgroundPosition:scope.xoffset + "px 0px"};
        scope.charname = scope.$parent.names[Math.abs(scope.xoffset/100)].name;

      }
      scope.goRight = function(){



        scope.xoffset -= 100;
        scope.xoffset %= 1400;
        scope.carouseloff ={backgroundPosition:scope.xoffset + "px 0px"};
        scope.charname = scope.$parent.names[Math.abs(scope.xoffset/100)].name;
      }
     
    }
  }
}
)
app.directive('board',function(){
  return {
    restrict:"E",
    templateUrl: "board.html"

  }

})
