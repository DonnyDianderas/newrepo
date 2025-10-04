const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");

// Route: Build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route: Build inventory detail view by vehicle id
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInventoryId)
);

// Route: Inventory Management View
router.get(
  "/",
  utilities.handleErrors(invController.buildManagement)
);

// Week 5 Update Inventory Information (Step 1)Route: Edit Inventory Item by ID
router.get(
  "/edit/:invId",
  utilities.handleErrors(invController.buildEditInventoryView)
);

// Route: Add Classification Form
router.get(
  "/add-classification",
  utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classification_name: ""
    });
  })
);

// Route: Process Add Classification form submission
router.post(
  "/add-classification",
  utilities.classificationRules(),
  utilities.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route: Add Inventory Form
router.get(
  "/add-inventory",
  utilities.handleErrors(async (req, res) => {
    let nav = await utilities.getNav();
    let classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationSelect,
      errors: null
    });
  })
);

// Route: Process Add Inventory form submission
router.post(
  "/add-inventory",
  utilities.inventoryRules(),
  utilities.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route: Return inventory in JSON by classification_id
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// week 5: Process the inventory update
router.post("/update/", utilities.handleErrors(invController.updateInventory));

// W5 Team Activity - Show delete confirmation view
router.get(
  "/delete/:invId",
  utilities.handleErrors(invController.buildDeleteInventoryView)
);

// W5 Team Activity- Process the actual deletion
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;
