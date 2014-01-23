var app = angular.module('TTT',["ngRoute"]);
  
app.controller ('BoardCtrl', function($scope,$timeout) {
  var names = ["Milk","April Carrion","Vi Vacious", "Adore Delano", "Joslyn Fox","Bianca del Rio", "Courtney Act", "Miss Darienne Lake", "Laganja Estranja", "Gia Gunn", "Magnolia Crawford", "Trinity K. Bonet", "Kelly Mantle", "Ben DeLaCreme"];

  $scope.players = [{charselection:0},{charselection:-256}];


  $scope.pageToggle = 0;
  $scope.xoo = {ass:"yeah"};

  $scope.start = function(){
    for(var i = 0; i < $scope.players.length; i++){
      console.log($scope.players[i].charselection);
    }
    $scope.pageToggle++;
  };

  $scope.newGame = function(){
    turns = 0; playerOnesTurn=true;
    $scope.board = [['','',''],['','',''],['','','']];
  };
  $scope.newGame();
  var endGame = function(msg){
    $timeout(function(){alert(msg);
    $scope.newGame();},500);
  };
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
      scope.carouseloff = {backgroundPosition:scope.xoffset+"px 0px"};
      scope.goLeft = function(){
        scope.xoffset += 256;
        scope.xoffset -= 3584;
        scope.xoffset %= 3584;
        scope.$watch('xoffset',function(oldVal,newVal){
          scope.carouseloff = {backgroundPosition:newVal + "px 0px"};
      });
      }
      scope.goRight = function(){
        
        scope.xoffset -= 256;
        scope.xoffset %= -3584;
        
        scope.$watch('xoffset',function(oldVal,newVal){
        scope.carouseloff = {backgroundPosition:newVal + "px 0px"};
        
      });
      }
      scope.$watch('xoffset',function(oldVal,newVal){
        scope.carouseloff = {backgroundPosition:newVal + "px 0px"};
        
        
      });
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
app.directive('bgpos',function(){
  return{
    restrict:"C",
    link:function(scope,element,attrs){
      element[0].style.backgroundPosition = "-256px 0px"
        console.log(element[0].style.backgroundPosition);
        console.log(scope,element,attrs);
    }
  }
})