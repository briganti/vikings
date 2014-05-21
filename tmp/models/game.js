/* Module dependencies **************************************************************************/
var cards = require('./cards.js');

/**
 * Game model
 */
function game(gameId, name){
    this.id         = gameId;
    this.name       = name;
    this.status     = 'available';
    this.board      = [null,null,null,null,null,null,null,null,null];
    this.player     = [{id:null}, {id:null}];
    this.woodenDeck = cards.getAllCardsColor(5);
    this.turn       = Math.floor((Math.random()*2));
    this.phase      = -1;
    // 0 => player can play a spell, discard a card or play a card
    // 1 => player can discard a card or play a card
    // 2 => player must play a card
};

/** Available **/
game.prototype.isAvailable = function() {
	return this.status === 'available';
};
/** Playing **/
game.prototype.isPlaying = function() {
    return this.status === 'playing';
};
game.prototype.setPlaying = function(){
	this.status = 'playing';
    this.drawCard();
    this.phase = 0;
};
/** Over **/
game.prototype.setOver = function(){
	this.status = "over";
};

/** Get player **/
game.prototype.getPlayer = function(id) {
	if(id == this.player[0].id)
      return 0;
    else
      return 1;
}
/** Set player **/
game.prototype.setPlayer = function(id, name, deck, socketID) {
    var index = null,
        deck  = cards.getCardsFullInfo(deck),
        hand  = [];

    for(var j = 0; j < 4; j++){
        index = Math.floor((Math.random()*(deck.length)));
        hand.push(deck[index]);
        deck.remove(index);
    }

    if(this.player[0].id === null) {
        this.player[0] = {id :id, name :name, deck :deck, hand:hand, spells: [], score : 0, socketID : socketID};
    } else if(this.player[1].id === null) {
        this.player[1] = {id :id, name :name, deck :deck, hand:hand, spells: [], score : 0, socketID : socketID};
    }
}

/** Remove Player **/
game.prototype.removePlayer = function(id) {
    if(this.player[0] && this.player[0].id == id)
        this.player[0].id = null;
    else
        this.player[1].id = null;
    //Over the game
    this.setOver();

    //game can be destroyed ?
    return (this.player[0].id === null && this.player[1].id === null)
};


/* Game - Get Card key from deck ****************************************************************/
game.prototype.getCardKeyFromDeck = function(pI, id){
	var cardIndex = null;
    
    for(var i=0; i<this.player[pI].hand.length; i++) {
        if(this.player[pI].hand[i].id == id) {
            cardIndex = i;
        }
    }
    return cardIndex;
}

/* Game - Get player man score ******************************************************************/
game.prototype.getPlayerMana = function(pI) {
    var cell    = null,
        provide = null,
        mana    = {1: 0, 2: 0, 3: 0, 4: 0};
    
    //get mana from board
    for(var i=0; i < this.board.length; i++) {
        cell = this.board[i];

        if (cell !== null && cell.card.provide && cell.owner == pI) {
            for(var j=0; j < cell.card.provide.length; j++) {
                provide = cell.card.provide[j];
                if (provide.lvl > mana[provide.color]) {
                    mana[provide.color] = provide.lvl;
                }
            }
        }
    }

    //get man from bonus (spells)
    for(var i=0; i<this.player[pI].spells.length; i++) {
        switch(this.player[pI].spells[i].id) {
            case 47:
                mana[1]++;
                break;
            case 48:
                mana[2]++;
                break;
            case 49:
                mana[3]++;
                break;
            case 50:
                mana[4]++;
                break;
        }
    }
    
    return mana;
}

/* Game - Set Phase 0 : Play a spell ************************************************************/
game.prototype.setPhase0 = function(pid, data){
    var pI        = this.getPlayer(pid),
        cardIndex = this.getCardKeyFromDeck(pI, data.cardId);

	//Card found
    if(cardIndex!==null) {
        //remove card
        this.player[pI].hand.remove(cardIndex);
        //play Spell
        this.player[pI].spells.push({id: cards.getCardById(data.cardId).id, duration: cards.getCardById(data.cardId).duration});
        //set phase to play card
        this.phase = 1;
    }
}

/* Game - is spell id active for player pid *****************************************************/
game.prototype.isSpellactive = function(pI, id) {
    var result = false,
        spell = null;

    for(var i=0; i<this.player[pI].spells.length; i++) {
        spell = this.player[pI].spells[i];
        
        if(spell.id == id) {
            result = true;
            break;
        }
    }
    
    return result;
}

/* Game - Set Phase 1 : Discard card and pick a wooden one **************************************/
game.prototype.setPhase1 = function(pid, data){
    var pI        = this.getPlayer(pid),
        cardIndex = this.getCardKeyFromDeck(pI, data.cardId);
	
	//card found
    if(cardIndex!==null) {
        //remove card
        this.player[pI].hand.remove(cardIndex);
        //draw Card from WD
        this.drawCardFromWoodenDeck();
        //set phase to play card
        this.phase = 2;
    }
}

 /* Game - Phase 1 : Draw a card drom wooden deck ***********************************************/
game.prototype.drawCardFromWoodenDeck = function() {
    var index = Math.floor((Math.random()*(this.woodenDeck.length)));
    
    this.player[this.turn].hand.push(this.woodenDeck[index]);
    this.woodenDeck.remove(index);
}

/* Game - Set Phase 2 : Play a creature card  ***************************************************/
game.prototype.setPhase2 = function(pid, data){

    //target cell is empty
    if(this.board[data.cellId] === null) {
        //get player
        var pI = this.getPlayer(pid),
            cardIndex = this.getCardKeyFromDeck(pI, data.cardId),
            tacticsIndex = null;

        //card found in player's hand
        if(cardIndex!==null) {
            //remove card
            this.player[pI].hand.remove(cardIndex);
            
            if(data.buffId) {
                tacticsIndex = this.getCardKeyFromDeck(pI, data.buffId);
            }

            if(tacticsIndex!==null) {
                //remove tactics
                this.player[pI].hand.remove(tacticsIndex);

                //move given card
                switch(data.buffId) {
                    case 44:
                        this.board[data.cellId] = {owner : pI, card : cards.getCardById(data.cardId), status : 'hidden', duration : 2};
                        break;
                    case 45:
                        this.board[data.cellId] = {owner : pI, card : cards.getCardById(data.cardId), status : 'leftRotation', duration : -1};
                        break;
                    case 46:
                        this.board[data.cellId] = {owner : pI, card : cards.getCardById(data.cardId), status : 'rightRotation', duration : -1};
                        break;
                }
            //move given card
            } else {
                this.board[data.cellId] = {owner : pI, card : cards.getCardById(data.cardId)};
            }
            //fight
            this.fight(pI, parseInt(data.cellId));
            
            //Swich turn
            this.endTurn();
        }
    }
}

/* Game - Fight Phase  ***************************************************************************/
game.prototype.fight = function(pI, cellid){
    //Get contiguous cells id and relative position
    var contiguousCells        = this.getContiguousCells(cellid),
        playerCardAttackValues = this.getAttackValues(this.board[cellid]);
    
    //Foreach contiguous cells
    for(var i=0; i<contiguousCells.length; i++) {
        //Get Cell data
        var foeCell = this.board[contiguousCells[i].cellid];
        
        //Cell is not empty
        if(foeCell !== null) {
            var foeCardAttackValues = this.getDefendValues(foeCell);
            
            //Fight
            if (parseInt(playerCardAttackValues[contiguousCells[i].type]) > parseInt(foeCardAttackValues[contiguousCells[i].type])) {
                foeCell.owner = pI;
            }
        }
    }
};

/* Game - Fight - Get Contiguous  ***************************************************************/
game.prototype.getContiguousCells = function(cellid){
    var result = [];
    
    //Is top cell
    if((cellid-3)>=0)
        result.push({cellid:((cellid-3)), type : 'top'});
    //is right cell
    if(cellid%3!=2)
        result.push({cellid:((cellid+1)), type : 'right'});
    //Is bottom cell
    if(cellid+3<9)
        result.push({cellid:((cellid+3)), type : 'bottom'});
    //is right cell
    if(cellid%3!=0)
        result.push({cellid:((cellid-1)), type : 'left'});

    return result;
}

/* Game - Fight - Get attacking values  ************************************************************/
game.prototype.getAttackValues = function(board) {
    console.log(board);
    var card = board.card,
        result = { 'top' : card.top, 'right': card.right, 'bottom': card.bottom, 'left': card.left};
    
    if(board.status == 'leftRotation') {
        result = { 'top' : card.right, 'right': card.bottom, 'bottom': card.left, 'left': card.top};
    } else if(board.status == 'rightRotation') {
        result = { 'top' : card.left, 'right': card.top, 'bottom': card.right, 'left': card.bottom};
    }
    
    return result;
}

/* Game - Fight - Get defending values  *********************************************************/
game.prototype.getDefendValues = function(board) {
    var card = board.card,
        result = { 'top' : card.bottom, 'right': card.left, 'bottom': card.top, 'left': card.right};
    
    if(board.status == 'leftRotation') {
        result = { 'top' : card.left, 'right': card.bottom, 'bottom': card.right, 'left': card.top};
    } else if(board.status == 'rightRotation') {
        result = { 'top' : card.right, 'right': card.top, 'bottom': card.left, 'left': card.bottom};
    }
    
    return result;
}

/* Game - End Turn  *****************************************************************************/
game.prototype.setScores = function() {
    var cell;

    this.player[0].score = 0;
    this.player[1].score = 0;

    for(i=0; i<this.board.length; i++) {
        cell = this.board[i];
        if(cell) {
            this.player[cell.owner].score++;
        }
    }
}

/* Game - End Turn  *****************************************************************************/
game.prototype.endTurn = function() {

    //clear Spells effects
    this.clearSpellsEffects(this.turn);
    //clearStatus
    this.clearCardStatusOnBoard();
    //set Scores
    this.setScores();

    if(this.isGameOver()) {
        this.turn = 'over';
    }else {
        //set turn and reinit phase
        this.turn  = (this.turn+1)%2;
        this.phase = 0;

        //draw a Card
        this.drawCard();
    }    
}

/* Game - Is Game Over  *************************************************************************/
game.prototype.isGameOver = function(){
    var gameOver = true;
    
    for(var i = 0, ln = this.board.length; i < ln; i++) {
        if(this.board[i] == null) {
            gameOver = false;
        }
    }

    return gameOver;
}

/* Game - get winner  ***************************************************************************/
game.prototype.getWinner = function(){
    if(this.player[0].score > this.player[1].score) {
        return 0;
    } else {
        return 1;
    }
}

/* Game - Clear Cards Status on board  **********************************************************/
game.prototype.clearCardStatusOnBoard = function(){
    var cell;
    
    for(var i=0; i<this.board.length; i++) {
        cell = this.board[i];
        
        if (cell != null && cell.status) {
            switch (this.board[i].duration) {
                //remove card effect
                case 1 :
                    this.board[i] = {owner : cell.owner, card : cell.card};
                    break;
                default :
                    this.board[i].duration--;
            }
        }
    }
}

/* Game - Clear Spells Effects  *****************************************************************/
game.prototype.clearSpellsEffects = function(pI){
    var spell = null;
    
    for(var i=0; i<this.player[pI].spells.length; i++) {
        spell = this.player[pI].spells[i];
        
        switch (spell.duration) {
            case 1 :
                this.player[pI].spells.remove(i);
                i--;
                break;
            default :
                spell.duration--;
        }
    }
}

/* Game - Draw a card From player deck  *********************************************************/
game.prototype.drawCard = function() {
    index = Math.floor((Math.random()*(this.player[this.turn].deck.length)));
    this.player[this.turn].hand.push(this.player[this.turn].deck[index]);
    this.player[this.turn].deck.remove(index);
}


/* Game - Export Game info **********************************************************************/
game.prototype.exportGame = function(you) {
    var foe = (you+1)%2;
  
    var gameExported = {    
        id : this.id,
        playerId : you,
        opponentId : foe,
        player : {
            name  : this.player[you].name,
            hand  : this.player[you].hand,
            deck  : this.player[you].deck.length,
            mana  : this.getPlayerMana(you),
            score : this.player[you].score
        },
        opponent : {
            name : this.player[foe].name,
            hand : this.exportFoeDeck(you, foe),
            deck : this.player[foe].deck.length,
            mana  : this.getPlayerMana(foe),
            score : this.player[foe].score
        },
        
        woodendeck : this.woodenDeck.length,
        board      : this.exportBoard(you),
        phase      : this.phase,
        turn       : this.turn
    };

	return gameExported;
};

/**
 * Export Board 
 */
game.prototype.exportBoard = function(you) {
  //Clone board
  var board = [];
  for(var i=0; i<this.board.length; i++) {
    if(this.board[i]!== null)
      board.push(JSON.parse(JSON.stringify(this.board[i])));
    else
      board.push(null);
  }
   
  //set board for user
  for(var i=0; i<board.length; i++) {
    if(board[i] !== null && board[i].owner != you && board[i].status == 'hidden') {
      board[i].card = {id:100, type:0};
    }
  }
  
  return board;
}
/**
 * Export Deck
 */
game.prototype.exportFoeDeck = function(you, foe) {
	if(this.isSpellactive(you, 51)) {
		return this.player[foe].hand;
	} else {
        var result = [];
        for(var i = 0; i < this.player[foe].hand.length; i++) {
            result.push(null);
        }
		return result;
	}
}


module.exports = game;