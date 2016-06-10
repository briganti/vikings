const cards = require('./cards.js')

class Game {

  constructor(gameId, name) {
    this.id = gameId
    this.name = name
    this.status = 'available'
    this.board = [null, null, null, null, null, null, null, null, null]
    this.player = [{ id: null }, { id: null }]
    this.woodenDeck = cards.getAllCardsColor(5)
    this.turn = Math.floor((Math.random() * 2))
    this.phase = -1
    // 0 => player can play a spell, discard a card or play a card
    // 1 => player can discard a card or play a card
    // 2 => player must play a card
  }

  /** Available **/
  isAvailable() {
    return this.status === 'available'
  }

  /** Playing **/
  isPlaying() {
    return this.status === 'playing'
  }

  setPlaying() {
    this.status = 'playing'
    this.drawCard()
    this.phase = 0
  }

  /** Over **/
  setOver() {
    this.status = 'over'
  }

  /** Get player **/
  getPlayer(id) {
    return (id === this.player[0].id) ? 0 : 1
  }

  /** Set player **/
  setPlayer(id, name, deckIds, socketID) {
    let index = null
    const deck = cards.getCardsFullInfo(deckIds)
    const hand = []

    for (let j = 0; j < 4; j++) {
      index = Math.floor((Math.random() * (deck.length)))
      hand.push(deck[index])
      deck.splice(index, 1)
    }

    if (this.player[0].id === null) {
      this.player[0] = { id, name, deck, hand, spells: [], score: 0, socketID }
    } else if (this.player[1].id === null) {
      this.player[1] = { id, name, deck, hand, spells: [], score: 0, socketID }
    }
  }

  /** Remove Player **/
  removePlayer(id) {
    if (this.player[0] && this.player[0].id === id) {
      this.player[0].id = null
    } else {
      this.player[1].id = null
    }

    // Over the game
    this.setOver()

    // game can be destroyed ?
    return (this.player[0].id === null && this.player[1].id === null)
  }


  /* Game - Get Card key from deck ****************************************************************/
  getCardKeyFromDeck(pI, id) {
    let cardIndex = null

    for (let i = 0; i < this.player[pI].hand.length; i++) {
      if (this.player[pI].hand[i].id === id) {
        cardIndex = i
      }
    }
    return cardIndex
  }

  /* Game - Get player man score ******************************************************************/
  getPlayerMana(pI) {
    let cell    = null
    let provide = null
    const mana  = { 1: 0, 2: 0, 3: 0, 4: 0 }

    // get mana from board
    for (let i = 0; i < this.board.length; i++) {
      cell = this.board[i]

      if (cell !== null && cell.card.provide && cell.owner === pI) {
        for (let j = 0; j < cell.card.provide.length; j++) {
          provide = cell.card.provide[j]
          if (provide.lvl > mana[provide.color]) {
            mana[provide.color] = provide.lvl
          }
        }
      }
    }

    // get man from bonus (spells)
    for (let i = 0; i < this.player[pI].spells.length; i++) {
      switch (this.player[pI].spells[i].id) {
        case 47:
          mana[1]++
          break
        case 48:
          mana[2]++
          break
        case 49:
          mana[3]++
          break
        case 50:
          mana[4]++
          break
        default:
      }
    }

    return mana
  }

  /* Game - Set Phase 0 : Play a spell ************************************************************/
  setPhase0(pid, data) {
    const pI = this.getPlayer(pid)
    const cardIndex = this.getCardKeyFromDeck(pI, data.cardId)

    // Card found
    if (cardIndex !== null) {
      // remove card
      this.player[pI].hand.splice(cardIndex, 1)
      // play Spell
      this.player[pI].spells.push({
        id:       cards.getCardById(data.cardId).id,
        duration: cards.getCardById(data.cardId).duration,
      })
      // set phase to play card
      this.phase = 1
    }
  }

  /* Game - is spell id active for player pid *****************************************************/
  isSpellactive(pI, id) {
    let result = false
    let spell = null

    for (let i = 0; i < this.player[pI].spells.length; i++) {
      spell = this.player[pI].spells[i]

      if (spell.id === id) {
        result = true
        break
      }
    }

    return result
  }

  /* Game - Set Phase 1 : Discard card and pick a wooden one **************************************/
  setPhase1(pid, data) {
    const pI = this.getPlayer(pid)
    const cardIndex = this.getCardKeyFromDeck(pI, data.cardId)

    // card found
    if (cardIndex !== null) {
      // remove card
      this.player[pI].hand.splice(cardIndex, 1)
      // draw Card from WD
      this.drawCardFromWoodenDeck()
      // set phase to play card
      this.phase = 2
    }
  }

  /* Game - Phase 1 : Draw a card drom wooden deck ***********************************************/
  drawCardFromWoodenDeck() {
    const index = Math.floor((Math.random() * (this.woodenDeck.length)))

    this.player[this.turn].hand.push(this.woodenDeck[index])
    this.woodenDeck.splice(index, 1)
  }

  /* Game - Set Phase 2 : Play a creature card  ***************************************************/
  setPhase2(pid, data) {
    // target cell is empty
    if (this.board[data.cellId] === null) {
      // get player
      const pI = this.getPlayer(pid)
      const cardIndex = this.getCardKeyFromDeck(pI, data.cardId)
      let tacticsIndex = null

      // card found in player's hand
      if (cardIndex !== null) {
        // remove card
        this.player[pI].hand.splice(cardIndex, 1)

        if (data.buffId) {
          tacticsIndex = this.getCardKeyFromDeck(pI, data.buffId)
        }

        if (tacticsIndex !== null) {
          // remove tactics
          this.player[pI].hand.splice(tacticsIndex, 1)

          // move given card
          switch (data.buffId) {
            case 44:
              this.board[data.cellId] = {
                owner:    pI,
                card:     cards.getCardById(data.cardId),
                status:   'hidden',
                duration: 2,
              }
              break
            case 45:
              this.board[data.cellId] = {
                owner:    pI,
                card:     cards.getCardById(data.cardId),
                status:   'leftRotation',
                duration: -1,
              }
              break
            case 46:
              this.board[data.cellId] = {
                owner:    pI,
                card:     cards.getCardById(data.cardId),
                status:   'rightRotation',
                duration: -1,
              }
              break
            default:
          }
        // move given card
        } else {
          this.board[data.cellId] = { owner: pI, card: cards.getCardById(data.cardId) }
        }
        // fight
        this.fight(pI, parseInt(data.cellId, 10))

        // Swich turn
        this.endTurn()
      }
    }
  }

  /* Game - Fight Phase  *************************************************************************/
  fight(pI, cellid) {
    // Get contiguous cells id and relative position
    const contiguousCells        = this.getContiguousCells(cellid)
    const playerCardAttackValues = this.getAttackValues(this.board[cellid])

    // Foreach contiguous cells
    for (let i = 0; i < contiguousCells.length; i++) {
      // Get Cell data
      const foeCell = this.board[contiguousCells[i].cellid]

      // Cell is not empty
      if (foeCell !== null) {
        const foeCardAttackValues = this.getDefendValues(foeCell)

        // Fight
        if (
          parseInt(playerCardAttackValues[contiguousCells[i].type], 10) >
          parseInt(foeCardAttackValues[contiguousCells[i].type], 10)
        ) {
          foeCell.owner = pI
        }
      }
    }
  }

  /* Game - Fight - Get Contiguous  ***************************************************************/
  getContiguousCells(cellid) {
    const result = []

    // Is top cell
    if ((cellid - 3) >= 0) {
      result.push({ cellid: (cellid - 3), type: 'top' })
    }
    // is right cell
    if (cellid % 3 !== 2) {
      result.push({ cellid: (cellid + 1), type: 'right' })
    }
    // Is bottom cell
    if (cellid + 3 < 9) {
      result.push({ cellid: (cellid + 3), type: 'bottom' })
    }
    // is right cell
    if (cellid % 3 !== 0) {
      result.push({ cellid: (cellid - 1), type: 'left' })
    }

    return result
  }

  /* Game - Fight - Get attacking values  ********************************************************/
  getAttackValues(board) {
    const card = board.card
    let result = { top: card.top, right: card.right, bottom: card.bottom, left: card.left }

    if (board.status === 'leftRotation') {
      result = { top: card.right, right: card.bottom, bottom: card.left, left: card.top }
    } else if (board.status === 'rightRotation') {
      result = { top: card.left, right: card.top, bottom: card.right, left: card.bottom }
    }

    return result
  }

/* Game - Fight - Get defending values  *********************************************************/
  getDefendValues(board) {
    const card = board.card
    let result = { top: card.bottom, right: card.left, bottom: card.top, left: card.right }

    if (board.status === 'leftRotation') {
      result = { top: card.left, right: card.bottom, bottom: card.right, left: card.top }
    } else if (board.status === 'rightRotation') {
      result = { top: card.right, right: card.top, bottom: card.left, left: card.bottom }
    }

    return result
  }

  /* Game - End Turn  *****************************************************************************/
  setScores() {
    let cell

    this.player[0].score = 0
    this.player[1].score = 0

    for (let i = 0; i < this.board.length; i++) {
      cell = this.board[i]
      if (cell) {
        this.player[cell.owner].score++
      }
    }
  }

  /* Game - End Turn  *****************************************************************************/
  endTurn() {
    // clear Spells effects
    this.clearSpellsEffects(this.turn)
    // clearStatus
    this.clearCardStatusOnBoard()
    // set Scores
    this.setScores()

    if (this.isGameOver()) {
      this.turn = 'over'
    } else {
      // set turn and reinit phase
      this.turn = (this.turn + 1) % 2
      this.phase = 0

      // draw a Card
      this.drawCard()
    }
  }

  /* Game - Is Game Over  *************************************************************************/
  isGameOver() {
    let gameOver = true

    for (let i = 0, ln = this.board.length; i < ln; i++) {
      if (this.board[i] == null) {
        gameOver = false
      }
    }

    return gameOver
  }

  /* Game - get winner  ***************************************************************************/
  getWinner() {
    return (this.player[0].score > this.player[1].score) ? 0 : 1
  }

  /* Game - Clear Cards Status on board  **********************************************************/
  clearCardStatusOnBoard() {
    let cell

    for (let i = 0; i < this.board.length; i++) {
      cell = this.board[i]

      if (cell != null && cell.status) {
        switch (this.board[i].duration) {
          // remove card effect
          case 1:
            this.board[i] = { owner: cell.owner, card: cell.card }
            break
          default:
            this.board[i].duration--
        }
      }
    }
  }

  /* Game - Clear Spells Effects  *****************************************************************/
  clearSpellsEffects(pI) {
    let spell = null

    for (let i = 0; i < this.player[pI].spells.length; i++) {
      spell = this.player[pI].spells[i]

      switch (spell.duration) {
        case 1:
          this.player[pI].spells.splice(i, 1)
          i--
          break
        default:
          spell.duration--
      }
    }
  }

  /* Game - Draw a card From player deck  *********************************************************/
  drawCard() {
    const index = Math.floor((Math.random() * (this.player[this.turn].deck.length)))
    this.player[this.turn].hand.push(this.player[this.turn].deck[index])
    this.player[this.turn].deck.splice(index, 1)
  }

  /* Game - Export Game info **********************************************************************/
  exportGame(you) {
    const foe = (you + 1) % 2

    const gameExported = {
      id:         this.id,
      playerId:   you,
      opponentId: foe,
      player:     {
        name:  this.player[you].name,
        hand:  this.player[you].hand,
        deck:  this.player[you].deck.length,
        mana:  this.getPlayerMana(you),
        score: this.player[you].score,
      },
      opponent: {
        name:  this.player[foe].name,
        hand:  this.exportFoeDeck(you, foe),
        deck:  this.player[foe].deck.length,
        mana:  this.getPlayerMana(foe),
        score: this.player[foe].score,
      },
      woodendeck: this.woodenDeck.length,
      board:      this.exportBoard(you),
      phase:      this.phase,
      turn:       this.turn,
    }

    return gameExported
  }

  /** Export Board */
  exportBoard(you) {
    // Clone board
    const board = []
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] !== null) {
        board.push(JSON.parse(JSON.stringify(this.board[i])))
      } else {
        board.push(null)
      }
    }

    // Set board for user
    for (let i = 0; i < board.length; i++) {
      if (board[i] !== null && board[i].owner !== you && board[i].status === 'hidden') {
        board[i].card = { id: 100, type: 0 }
      }
    }

    return board
  }

  /** Export Deck */
  exportFoeDeck(you, foe) {
    if (this.isSpellactive(you, 51)) {
      return this.player[foe].hand
    }

    const result = []
    for (let i = 0; i < this.player[foe].hand.length; i++) {
      result.push(null)
    }
    return result
  }
}

module.exports = Game
