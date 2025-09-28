const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* Build inventory by classification view */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      req.flash("notice", "No inventory items found for this classification.");
      return res.redirect("/inv");
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      classification_name: ""
    });
  } catch (error) {
    next(error);
  }
};

/* Build inventory detail view */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) {
      return next({ status: 404, message: "Vehicle not found" });
    }

    let nav = await utilities.getNav();
    const vehicleHTML = await utilities.buildVehicleDetail(vehicleData);

    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      content: vehicleHTML,
      classification_name: ""
    });
  } catch (error) {
    next(error);
  }
};

/* Build inventory management view */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/* Render Add Classification form */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classification_name: ""
    });
  } catch (error) {
    next(error);
  }
};

/* Process Add Classification */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  try {
    const result = await invModel.addClassification(classification_name);

    if (result) {
      req.flash("notice", "Classification added successfully.");
      let nav = await utilities.getNav();
      return res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null
      });
    } else {
      req.flash("error", "Sorry, adding classification failed.");
      let nav = await utilities.getNav();
      return res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: [{ msg: "Adding classification failed" }],
        classification_name
      });
    }
  } catch (error) {
    console.error("addClassification error: " + error);
    req.flash("error", "Error adding classification.");
    let nav = await utilities.getNav();
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: [{ msg: "Error adding classification" }],
      classification_name
    });
  }
};

/* Render Add Inventory form */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationSelect,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/* Process Add Inventory */
invCont.addInventory = async function (req, res, next) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      let classificationSelect = await utilities.buildClassificationList(classification_id);
      return res.render("./inventory/add-inventory", {
        title: "Add New Inventory Item",
        nav,
        classificationSelect,
        errors: errors.array(),
        ...req.body
      });
    }

    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    );

    if (result) {
      req.flash("notice", "Inventory item added successfully.");
      let nav = await utilities.getNav();
      return res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null
      });
    } else {
      req.flash("error", "Sorry, adding inventory item failed.");
      let nav = await utilities.getNav();
      let classificationSelect = await utilities.buildClassificationList(classification_id);
      return res.render("./inventory/add-inventory", {
        title: "Add New Inventory Item",
        nav,
        classificationSelect,
        errors: [{ msg: "Adding inventory item failed" }],
        ...req.body
      });
    }
  } catch (error) {
    console.error("addInventory error: " + error);
    req.flash("error", "Error adding inventory item.");
    let nav = await utilities.getNav();
    let classificationSelect = await utilities.buildClassificationList(classification_id);
    return res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationSelect,
      errors: [{ msg: "Error adding inventory item" }],
      ...req.body
    });
  }
};

module.exports = invCont;








