const express = require('express')
const uuid    = require('node-uuid')
const main    = require('../models/main.js')

const router = new express.Router()

// Login route
router.post('/auth/guest', (req, res) => {
  // User has not given a name
  if (!req.body.username) {
    res.json(200, { err: 'User name is required' })
  // User's name is less than 3 characters
  } else if (!req.body.username.match(/^[a-zA-Z0-9\-_]{3,}$/)) {
    res.json(200, { err: 'User name must have at least 3 alphanumeric characters' })
  } else {
    const oUser = {
      id:   uuid.v1(),
      name: req.body.username,
      role: {
        bitMask: 2,
        title:   'user',
      },
    }

    // Save user in server session
    req.session.user = oUser
    // Save user on client side
    res.cookie('user', JSON.stringify(oUser))

    main.setPlayer(oUser.id, oUser.name)
    res.json(200, oUser)
  }
})

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('user')
  req.session.destroy(() => {
    res.redirect('/')
  })
})

// App templates route
router.get('/partials/*', (req, res) => {
  res.render('./${req.url}')
})

// App route
router.get('/*', (req, res) => {
  res.render('app')
})

module.exports = router
