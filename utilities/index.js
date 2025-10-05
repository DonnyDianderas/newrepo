const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}


 /* ****************************************
 * week5, Personal Activity: Middleware to check account type
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.accountData && 
      (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
    return next()
  } 
  req.flash("notice", "You do not have permission to access this page.")
  return res.redirect("/account/login")
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildVehicleDetail = async function(vehicle) {
  // Format price and mileage with separators and currency symbol:
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price)

  const milesFormatted = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  let detail = `
    <section id="inv-detail">
      <figure>
        <img src="${vehicle.inv_image}" 
             alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
      </figure>
      <div class="inv-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p class="price"><strong>Price:</strong> ${priceFormatted}</p>
        <p class="miles"><strong>Mileage:</strong> ${milesFormatted} miles</p>
        <p class="desc"><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p class="color"><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </section>
  `
  return detail
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Week4_task2: Validation Rules for Classification
 **************************************** */
Util.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ]
}

/* ****************************************
 * Week4_task2: Check Classification Data and Return Errors
 **************************************** */
Util.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
    })
    return
  }
  next()
}

/* ************************
 * Week4_task3: Build Classification Select List
 (Used in Add Inventory form)
 *********************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ********************************
 * Week4_task3: Validation Rules for Inventory
 ***********************************/
Util.inventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Please provide a make."),
    body("inv_model").trim().notEmpty().withMessage("Please provide a model."),
    body("inv_year")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a valid number between 1900 and 2099."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),
    body("inv_color").trim().notEmpty().withMessage("Please provide a color."),
    body("classification_id")
      .isInt({ min: 1 })
      .withMessage("Please select a valid classification."),
  ]
}

/* *******************************
 *  Week4_task3: Check Inventory Data and Return Errors
 **************************************** */
Util.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    let classificationSelect = await Util.buildClassificationList(
      req.body.classification_id
    )
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationSelect,
      errors: errors.array(),
      ...req.body, 
    })
    return
  }
  next()
}

/* *******************************
 *  Week5_Update Inventory Information (Step 2): Check Update Data and Return Errors to Edit View
 **************************************** */
Util.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  const { inv_id } = req.body  
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    let classificationSelect = await Util.buildClassificationList(
      req.body.classification_id
    )
    res.render("./inventory/edit-inventory", {
      title: `Edit ${req.body.inv_make} ${req.body.inv_model}`,  
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id, 
      ...req.body, 
    })
    return
  }
  next()
}

/* ***************************************
* WEEK5 (Task 4) Validation Rules for Account Update 
**************************************** */
Util.accountUpdateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required.")
  ]
}

/****************************************
 * Validation Rules for Password Change
 ****************************************/
Util.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters.")
      .matches(/\d/)
      .withMessage("Password must contain at least one number.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[^a-zA-Z0-9]/)
      .withMessage("Password must contain at least one special character.")
  ]
}

/****************************************
 * Check Account Update Data
 ****************************************/
Util.checkAccountData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    return res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      accountData: req.body
    })
  }
  next()
}

/****************************************
 * Check Password Change Data
 ****************************************/
Util.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    return res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      accountData: req.body
    })
  }
  next()
}
module.exports = Util

