var app = angular.module('TTT',["ngAnimate"]);
  
app.controller ('BoardCtrl', function($scope,$timeout) {
  $scope.tog = 0;
  $scope.start = function(){
    $scope.tog++;
  };
  $scope.newGame = function(){
    turns = 0; playerOnesTurn=true;
    $scope.board = [['','',''],['','',''],['','','']];
  };
  $scope.newGame();
  var endGame = function(msg){
    $timeout(function(){alert(msg);
    $scope.newGame();},500);
  }
  $scope.playMove = function(c,r){
    var weJustClickedOn = $scope.board[c][r];
    var p = playerOnesTurn;
    if(weJustClickedOn == '') {
      var piece = p ? 'x' : 'o';
      $scope.board[c][r] = piece;
      turns++;
      endTurn(c,r,piece);
    }
  }
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
    else beginNewTurn();
  }
  function beginNewTurn(){
    playerOnesTurn = !playerOnesTurn;
  }
})
app.directive('intro',function(){
  return{
    restrict:"E",
    templateUrl:"intro.html"
  } 
})
app.directive('characters',function(){
  return{
    restrict:"E",
    templateUrl:"characters.html"
  }
})
app.directive('board',function(){
  return {
    restrict:"E",
    templateUrl: "board.html"

  }

})