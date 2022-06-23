const express = require('express')
const router = express.Router()
// Add your routes here - above the module.exports line
const { auth, requiresAuth } = require('express-openid-connect');
router.use(
  auth({
    authRequired: false,
    idpLogout: true,
    routes: {
        login: false,
        callback: '/callback', // I think this is a dummy URL
     },
    authorizationParams: {
        scope: 'openid email profile',
    }
  })
);
// requiresAuth checks authentication.
router.get('/login', (req, res) => res.oidc.login(
  { returnTo: '/profile' }
));
router.use((req, res, next) => {
  res.locals.user = req.oidc.user;
  res.locals.userProfile = JSON.stringify(req.oidc.user);
  next();
});
router.get('/profile', requiresAuth());

module.exports = router
