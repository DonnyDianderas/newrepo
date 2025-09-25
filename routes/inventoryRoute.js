// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/") //task3: Import utilities to apply error handling to my routes

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Task3: Route to build inventory detail view by vehicle id
router.get("/detail/:invId", 
  utilities.handleErrors(invController.buildByInventoryId));

/* ***************************
 *  WEEK 04: TASK1: Route to build Vehicle Management View
 * ************************** */
router.get("/", utilities.handleErrors(invController.buildManagement));


module.exports = router;