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
    // add: build the classification list
    let classificationSelect = await utilities.buildClassificationList()

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationSelect //Added so it gets sent to the view
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build Edit Inventory View
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
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
    })
  }
}

/* ***************************
 *  Build Delete Inventory View
 * ************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId);
    let nav = await utilities.getNav();

    const itemData = await invModel.getVehicleById(inv_id);
    if (!itemData) {
      req.flash("error", "Vehicle not found.");
      return res.redirect("/inv");
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process Delete Inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);

    const deleteResult = await invModel.deleteInventoryById(inv_id);

    if (deleteResult) {
      req.flash("success", "Vehicle deleted successfully.");
      return res.redirect("/inv");
    } else {
      req.flash("error", "Unable to delete vehicle.");
      return res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;








