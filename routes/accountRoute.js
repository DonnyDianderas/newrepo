// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/") 
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

/* ****************************************
*  Login & Registration
* ************************************ */

// Route to build the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build the register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request 
router.post(
  "/login",
  regValidate.loginRules(),          
  regValidate.checkLoginData,       
  utilities.handleErrors(accountController.accountLogin)
)

/* ****************************************
*  Logout
* ************************************ */

// w5: Personal activity, Route to log out the user .
router.get("/logout", utilities.handleErrors(accountController.logoutAccount));

/* ****************************************
*  Account Management
* ************************************ */

// Default account management view (protected with checkLogin)
router.get(
  "/",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountHome)
)

/* ****************************************
*  Account Update week 5 Personal actuvity task4
* ************************************ */

// Account Update View
router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountUpdate) 
)

// Process Account Info Update
router.post(
  "/update-info",
  utilities.accountUpdateRules(), 
  utilities.checkAccountData, 
  utilities.handleErrors(accountController.updateAccount)
)

// Process Password Update
router.post(
  "/change-password",
  utilities.passwordRules(), 
  utilities.checkPasswordData, 
  utilities.handleErrors(accountController.changePassword) 
)

module.exports = router;