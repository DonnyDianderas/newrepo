const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)

    if (!data || data.length === 0) {
      req.flash("notice", "No inventory items found for this classification.")
      return res.redirect("/inv")
    }

    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      messages: req.flash("notice"),
      classification_name: "" 
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build inventory detail view by inv_id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId
    const vehicleData = await invModel.getVehicleById(inv_id)

    if (!vehicleData) {
      return next({ status: 404, message: "Vehicle not found" })
    }

    let nav = await utilities.getNav()
    const vehicleHTML = await utilities.buildVehicleDetail(vehicleData)

    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      content: vehicleHTML,
      messages: req.flash("notice"),
      classification_name: "" 
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Deliver Inventory Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      messages: req.flash("notice"),
      classification_name: "" 
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Render Add Classification Form
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      messages: req.flash("notice"),
      classification_name: "" 
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body

  try {
    const result = await invModel.addClassification(classification_name)

    if (result) {
      let nav = await utilities.getNav()
      req.flash("notice", "Classification added successfully.")
      return res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        messages: req.flash("notice"),
        classification_name: "" 
      })
    } else {
      let nav = await utilities.getNav()
      req.flash("error", "Sorry, adding classification failed.")
      return res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: [{ msg: "Adding classification failed" }],
        classification_name, 
        messages: req.flash("error")
      })
    }
  } catch (error) {
    console.error("addClassification error: " + error)
    let nav = await utilities.getNav()
    req.flash("error", "Error adding classification.")
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: [{ msg: "Error adding classification" }],
      classification_name, 
      messages: req.flash("error")
    })
  }
}

module.exports = invCont






