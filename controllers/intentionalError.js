async function throwError(req, res, next) {
  try {
    // code to throw intentional error
    throw new Error("Intentional 500 error triggered for testing.")
  } catch (err) {
    next(err) // to the error handling middleware
  }
}

module.exports = { throwError };
