var cards = {
    colors : [{'id':0, 'lbl':'gold'},
              {'id':1, 'lbl':'red'},
              {'id':2, 'lbl':'white'},
              {'id':3, 'lbl':'blue'},
              {'id':4, 'lbl':'green'},
              {'id':5, 'lbl':'wood'}],
				
              //Gold
    cards  : [{'id':0, 'type':0, 'top':4, 'right':4, 'bottom':7, 'left':2, 'color': 0, 'req' :[{'color':1, 'lvl':1}, {'color':2, 'lvl':1}], 'provide':[]},
              {'id':1, 'type':0, 'top':2, 'right':3, 'bottom':6, 'left':7, 'color': 0, 'req' :[{'color':1, 'lvl':1}, {'color':2, 'lvl':2}], 'provide':[]},
              {'id':2, 'type':0, 'top':6, 'right':5, 'bottom':4, 'left':5, 'color': 0, 'req' :[{'color':1, 'lvl':2}, {'color':2, 'lvl':1}], 'provide':[]},
              //Red
              {'id':3, 'type':0, 'top':2, 'right':1, 'bottom':2, 'left':6, 'color': 1, 'req' :[], 'provide':[{'color':1, 'lvl':1}]},
              {'id':4, 'type':0, 'top':4, 'right':2, 'bottom':4, 'left':3, 'color': 1, 'req' :[], 'provide':[{'color':1, 'lvl':1}]},
              {'id':5, 'type':0, 'top':2, 'right':1, 'bottom':6, 'left':1, 'color': 1, 'req' :[], 'provide':[{'color':1, 'lvl':1}]},
              {'id':6, 'type':0, 'top':3, 'right':5, 'bottom':2, 'left':1, 'color': 1, 'req' :[], 'provide':[{'color':1, 'lvl':1}]},
              {'id':7, 'type':0, 'top':1, 'right':5, 'bottom':4, 'left':1, 'color': 1, 'req' :[], 'provide':[{'color':1, 'lvl':1}]},
              {'id':8, 'type':0, 'top':3, 'right':2, 'bottom':1, 'left':7, 'color': 1, 'req' :[{'color':1, 'lvl':1}], 'provide':[{'color':1, 'lvl':2}]},
              {'id':9, 'type':0, 'top':5, 'right':1, 'bottom':3, 'left':5, 'color': 1, 'req' :[{'color':1, 'lvl':1}], 'provide':[{'color':1, 'lvl':2}]},
              {'id':10, 'type':0, 'top':6, 'right':1, 'bottom':4, 'left':3, 'color': 1, 'req' :[{'color':1, 'lvl':1}], 'provide':[{'color':1, 'lvl':2}]},
              {'id':11, 'type':0, 'top':5, 'right':6, 'bottom':2, 'left':4, 'color': 1, 'req' :[{'color':1, 'lvl':2}], 'provide':[{'color':1, 'lvl':3}]},
              //White
              {'id':12, 'type':0, 'top':1, 'right':4, 'bottom':1, 'left':5, 'color': 2, 'req' :[], 'provide':[{'color':2, 'lvl':1}]},
              {'id':13, 'type':0, 'top':5, 'right':1, 'bottom':1, 'left':3, 'color': 2, 'req' :[], 'provide':[{'color':2, 'lvl':1}]},
              {'id':14, 'type':0, 'top':1, 'right':3, 'bottom':3, 'left':5, 'color': 2, 'req' :[], 'provide':[{'color':2, 'lvl':1}]},
              {'id':15, 'type':0, 'top':6, 'right':2, 'bottom':1, 'left':1, 'color': 2, 'req' :[], 'provide':[{'color':2, 'lvl':1}]},
              {'id':16, 'type':0, 'top':6, 'right':3, 'bottom':2, 'left':2, 'color': 2, 'req' :[{'color':2, 'lvl':1}], 'provide':[{'color':2, 'lvl':2}]},
              {'id':17, 'type':0, 'top':5, 'right':3, 'bottom':3, 'left':4, 'color': 2, 'req' :[{'color':2, 'lvl':1}], 'provide':[{'color':2, 'lvl':2}]},
              {'id':18, 'type':0, 'top':6, 'right':6, 'bottom':2, 'left':3, 'color': 2, 'req' :[{'color':2, 'lvl':2}], 'provide':[{'color':2, 'lvl':3}]},
              //Blue
              {'id':19, 'type':0, 'top':2, 'right':6, 'bottom':1, 'left':2, 'color': 3, 'req' :[], 'provide':[{'color':3, 'lvl':1}]},
              {'id':20, 'type':0, 'top':3, 'right':1, 'bottom':3, 'left':5, 'color': 3, 'req' :[], 'provide':[{'color':3, 'lvl':1}]},
              {'id':21, 'type':0, 'top':5, 'right':3, 'bottom':2, 'left':1, 'color': 3, 'req' :[], 'provide':[{'color':3, 'lvl':1}]},
              {'id':22, 'type':0, 'top':1, 'right':1, 'bottom':5, 'left':4, 'color': 3, 'req' :[], 'provide':[{'color':3, 'lvl':1}]},
              {'id':23, 'type':0, 'top':2, 'right':4, 'bottom':5, 'left':1, 'color': 3, 'req' :[], 'provide':[{'color':3, 'lvl':1}]},
              {'id':24, 'type':0, 'top':6, 'right':3, 'bottom':4, 'left':5, 'color': 3, 'req' :[{'color':3, 'lvl':1}], 'provide':[{'color':3, 'lvl':2}]},
              {'id':25, 'type':0, 'top':4, 'right':5, 'bottom':3, 'left':6, 'color': 3, 'req' :[{'color':3, 'lvl':1}], 'provide':[{'color':3, 'lvl':2}]},
              {'id':26, 'type':0, 'top':3, 'right':7, 'bottom':5, 'left':2, 'color': 3, 'req' :[{'color':3, 'lvl':1}], 'provide':[{'color':3, 'lvl':2}]},
              {'id':27, 'type':0, 'top':5, 'right':4, 'bottom':8, 'left':6, 'color': 3, 'req' :[{'color':3, 'lvl':2}], 'provide':[{'color':3, 'lvl':3}]},
              //Green
              {'id':28, 'type':0, 'top':1, 'right':5, 'bottom':4, 'left':1, 'color': 4, 'req' :[], 'provide':[{'color':4, 'lvl':1}]},
              {'id':29, 'type':0, 'top':1, 'right':2, 'bottom':1, 'left':6, 'color': 4, 'req' :[], 'provide':[{'color':4, 'lvl':1}]},
              {'id':30, 'type':0, 'top':3, 'right':4, 'bottom':2, 'left':4, 'color': 4, 'req' :[], 'provide':[{'color':4, 'lvl':1}]},
              {'id':31, 'type':0, 'top':4, 'right':2, 'bottom':5, 'left':1, 'color': 4, 'req' :[], 'provide':[{'color':4, 'lvl':1}]},
              {'id':32, 'type':0, 'top':5, 'right':2, 'bottom':7, 'left':3, 'color': 4, 'req' :[{'color':4, 'lvl':1}], 'provide':[{'color':4, 'lvl':2}]},
              {'id':33, 'type':0, 'top':5, 'right':5, 'bottom':4, 'left':5, 'color': 4, 'req' :[{'color':4, 'lvl':1}], 'provide':[{'color':4, 'lvl':2}]},
              {'id':34, 'type':0, 'top':3, 'right':7, 'bottom':5, 'left':8, 'color': 4, 'req' :[{'color':4, 'lvl':2}], 'provide':[{'color':4, 'lvl':3}]},
              //Wooden
              {'id':35, 'type':0, 'top':4, 'right':1, 'bottom':2, 'left':1, 'color': 5, 'req' :[], 'provide':[]},
              {'id':36, 'type':0, 'top':2, 'right':1, 'bottom':1, 'left':4, 'color': 5, 'req' :[], 'provide':[]},
              {'id':37, 'type':0, 'top':1, 'right':4, 'bottom':1, 'left':2, 'color': 5, 'req' :[], 'provide':[]},
              {'id':38, 'type':0, 'top':1, 'right':2, 'bottom':4, 'left':1, 'color': 5, 'req' :[], 'provide':[]},
              {'id':39, 'type':0, 'top':2, 'right':1, 'bottom':3, 'left':2, 'color': 5, 'req' :[], 'provide':[]},
              {'id':40, 'type':0, 'top':2, 'right':3, 'bottom':2, 'left':1, 'color': 5, 'req' :[], 'provide':[]},
              {'id':41, 'type':0, 'top':1, 'right':2, 'bottom':2, 'left':3, 'color': 5, 'req' :[], 'provide':[]},
              {'id':42, 'type':0, 'top':3, 'right':2, 'bottom':1, 'left':2, 'color': 5, 'req' :[], 'provide':[]},
              {'id':43, 'type':0, 'top':4, 'right':4, 'bottom':4, 'left':4, 'color': 5, 'req' :[], 'provide':[]},
              //Tactics
              {'id':44, 'type':1, 'req' :[], 'target':[], 'duration': 2},
              {'id':45, 'type':1, 'req' :[], 'target':[], 'duration': -1},
              {'id':46, 'type':1, 'req' :[], 'target':[], 'duration': -1},
              //Spells
              {'id':47, 'type':2, 'req' :[], 'target':[], 'duration': 1},
              {'id':48, 'type':2, 'req' :[], 'target':[], 'duration': 1},
              {'id':49, 'type':2, 'req' :[], 'target':[], 'duration': 1},
              {'id':50, 'type':2, 'req' :[], 'target':[], 'duration': 1},
              {'id':51, 'type':2, 'req' :[], 'target':[], 'duration': 1}
              //{'id':13, 'type':3, 'req' :[{'color':1, 'lvl':1}], 'target':[{'color':1, 'lvl':1}]},
              ],
                
    starterDeckNbCards : {'creatures' : [5, 1, 1], 'tactics' : 1, 'spells' : 1}
};

/* Cards - get cards by Id  **********************************************************/
cards.getCardById = function(id) {
    return this.cards[id];
}

/* Cards - get player starter library  **********************************************************/
cards.getMyStarterDeck = function() {
    //TEMP
    //return this.cards;

    var librairy = [],
        starterDeck = [],
        i =0,
        index;

    //Creatures
    while(i < this.starterDeckNbCards.creatures.length) {
        librairy = this.getAllCardsLvl(i);
        for(var j = 0; j < this.starterDeckNbCards.creatures[i]; j++){
            index = Math.floor((Math.random()*(librairy.length)));
            starterDeck.push(librairy[index].id);
            librairy.remove(index);
        }
        i++;
    }

    //Tactics
    librairy = this.getAllCardsType(1);
    for(var j = 0; j < this.starterDeckNbCards.tactics; j++){
        index = Math.floor((Math.random()*(librairy.length)));
        starterDeck.push(librairy[index].id);
        librairy.remove(index);
    }

    //Spells
    librairy = this.getAllCardsType(2);
    for(var j = 0; j < this.starterDeckNbCards.spells; j++){
        index = Math.floor((Math.random()*(librairy.length)));
        starterDeck.push(librairy[index].id);
        librairy.remove(index);
    }

    return starterDeck;
}


/* Cards - get all given level cards ************************************************************/
cards.getAllCardsLvl = function(lvl) {
    var cards = [];
    //Parcours de la collection
    for(var i = 0; i < this.cards.length; i++){
        //Creature
        if(this.cards[i].type==0 && this.cards[i].color != 5 ){
            //No requires
            if(lvl==0 && this.cards[i].req.length ==0) {
                cards.push(this.cards[i]);
            //Lvl superieur a 1
            } else if (lvl > 0 && this.cards[i].req.length ==1) {
                //Card has the same lvl
                if(this.cards[i].req[0].lvl == lvl)
                    cards.push(this.cards[i]);
            }
        }
    }
    return cards;
}


/* Cards - get all given type cards *************************************************************/
cards.getAllCardsType = function(type) {
    var cards = [];

    for(var i = 0; i < this.cards.length; i++){
        if(this.cards[i].type==type){
            cards.push(this.cards[i]);
        }
    }
    return cards;
}


/* Cards - get all given color cards ************************************************************/
cards.getAllCardsColor = function(color) {
    var cards = [];
    
    for(var i = 0; i < this.cards.length; i++){
        if(this.cards[i].color==color){
            cards.push(this.cards[i]);
        }
    }
    return cards;
}

/* Cards - get cards info from deck/library (array of id)***********************************************/
cards.getCardsFullInfo = function(deck) {
    var result = [];
    //Parcours de la collection
    for(var i = 0; i < deck.length; i++){
        result.push(this.cards[deck[i]]);
    }
    return result;

}

/* Cards - get cards data from deck (array of id) ***********************************************/
cards.getCardsFromDeck = function(deck) {
    var result = [];
    //Parcours de la collection
    for(var i = 0; i < deck.length; i++){
        result.push(this.cards[deck[i].id]);
    }
    return result;
}

module.exports = cards;