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

/* ***************************
 *  Week 04: Task2 - Add Classification View
 * ************************** */
router.get(
  "/add-classification",
  utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      messages: req.flash(), 
      errors: null
    })
  })
);

// Route to process the Add Classification form submission (POST)
router.post(
  "/add-classification",
  utilities.classificationRules(), 
  utilities.checkClassificationData,
  utilities.handleErrors(invController.addClassification));

module.exports = router;