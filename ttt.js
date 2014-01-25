var iDontHaveASymbol = function(){
  return !mySymbol;
}
var symbolIsPlayableByThisBrowser = function() {
  return itIsMyTurn() || (currentSymbolUnused() && iDontHaveASymbol));
}
var isLegalMove = function(idx){
 return (isCellEmpty(idx) && symbolIsPlayableByThisBrowser);
}
var itIsMyTurn = function(){
  return mySymbol == currentSymbol();
}
var currentSymbolUnused = function(){
  //go through $scope.obj.board, turn into string and check if currentSymbol is in the string
  //which was previously a board
}

$scope.click = function(){
  if(isLegalMove(idx)){
    mySymbol = $scope.obj.board[idx] = currentSymbol();
    $scope.obj.xTurn = !$scope.obj.xTurn;
    $scope.obj.$save();
  }
}
//currentSymbol is predicated on xTurn
