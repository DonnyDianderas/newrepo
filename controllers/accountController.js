/******************************
 *  Account Controller
 *  Unit 4, deliver login view activity
 ******************************/
const accountModel = require('../models/account-model')
const utilities = require('../utilities')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/******************************
 *  Deliver login view
 *  Unit 4, deliver login view activity
 ******************************/
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      //Payload with explicit account_type
      const payload = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_email: accountData.account_email,
        account_type: accountData.account_type 
      }

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })


      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 }) 

      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management view
 * ************************************ */
async function buildAccountHome(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-home", {
    title: "Account Management",
    nav,
    errors: null,
    accountData: res.locals.accountData,
    messages: req.flash()
  });
}

/* ****************************************
*  WEEK5 task4 Build Update Account View
* ************************************ */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav();
  const accountId = req.params.accountId;
  const accountData = await accountModel.getAccountById(accountId); 
  
  if (!accountData) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account/");
  }
  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    errors: null,
    messages: { notice: req.flash("notice") },
    accountData
  });
}

/* ****************************************
*  WEEK5 task4 Process Account Info Update 
* ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    req.flash("notice", "Your account information was successfully updated.")
    return res.redirect("/account")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    return res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      accountData: { account_firstname, account_lastname, account_email, account_id }
    })
  }
}

/* ****************************************
*  WEEK5 task4 - Process Change Password
* ************************************ */
async function changePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const passwordResult = await accountModel.updatePassword(account_id, hashedPassword)

    if (passwordResult) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Password update failed.")
      return res.render("account/update-account", {
        title: "Update Account Information",
        nav,
        errors: null,
        accountData: res.locals.accountData
      })
    }
  } catch (error) {
    req.flash("notice", "Error updating password.")
    return res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      accountData: res.locals.accountData
    })
  }
}

// Process Logout
async function logoutAccount(req, res, next) {
  try {
    res.clearCookie("jwt"); 
    req.session.destroy(); 
    res.redirect("/");
  } catch (error) {
    next(error);
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountHome, logoutAccount, buildAccountUpdate, updateAccount, changePassword }
