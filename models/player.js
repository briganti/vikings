const cards = require('./cards.js')

class Player {

  constructor(id, name) {
    const librairy = cards.getMyStarterDeck()

    this.id = id
    this.name = name
    this.librairy = librairy
    this.socketID = null
    this.timeOutId = null
    this.type = 'guest'
    this.gameID = -1
    this.status = 'disconnected'
    this.room = 'available'
    this.deck = librairy.slice(0)
    this.cardInStraight = []
  }

  /* Get public profile ***************************************************************************/
  getPublicProfile() {
    return {
      id:     this.id,
      name:   this.name,
      status: this.status,
    }
  }

  /* Set player available *************************************************************************/
  setAvailable() {
    this.gameID = ''
    this.status = 'available'
  }

  /* Is player available? *************************************************************************/
  isAvailable() {
    return this.status === 'available'
  }

  /* Set player playing **************************************************************************/
  setPlaying(gId) {
    this.gameID = gId
    this.status = 'playing'
  }

  /* Is player playing? ***************************************************************************/
  isPlaying() {
    return this.status === 'playing'
  }

  /* Set player disconnected **********************************************************************/
  setDisconnected() {
    this.status = 'disconnected'
    this.socketID = null
  }

  /* Is player disconnected? **********************************************************************/
  isDisconnected() {
    return this.status === 'disconnected'
  }

  /* Set player left ******************************************************************************/
  setLeft() {
    this.status = 'left'
  }

  /* Get a random card as a price *****************************************************************/
  getAPrice() {
    const gift = cards.getARandomCard(this.librairy)
    if (gift) {
      this.librairy.push(gift)
    }
    return gift
  }
}

module.exports = Player
