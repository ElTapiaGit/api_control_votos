const express = require('express');
const router = express.Router(); 
const {requestPasswordReset, resetPassword, signup, signin, logout, forgotPassword,getAllUsers  ,updateUser,deleteUser } = require("../controllers/auth");
const {sendEmail ,listAllEmails} = require("../controllers/correoControllers");


const {isAuthenticated, isAdmin} = require("../middleware/auth");
const {errorHandler} = require("../middleware/error");



router.post('/registrarse', signup );
router.get('/usuarios1', getAllUsers  );
router.put('/usuario/:userId', updateUser );
router.delete('/usuario/:userId', deleteUser );
router.post('/login', signin );
router.post('/restablecer', forgotPassword );
router.get('/cerrarsesion', logout );
router.post('/send', sendEmail);
router.get ('/correos', listAllEmails);
router.post('/request-password-reset', requestPasswordReset);
router.put('/reset-password/:token', resetPassword);







module.exports = router;