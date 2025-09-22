const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/intentionalError")
const utilities = require("../utilities/")

// Route to trigger error 500
router.get("/trigger500", utilities.handleErrors(errorController.throwError))

module.exports = router
