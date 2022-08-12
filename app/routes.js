const express = require('express')
const router = express.Router()
// Add your routes here - above the module.exports line
const passport = require('passport')
const { Issuer, Strategy, generators, custom } = require('openid-client')
const pem2jwk = require('rsa-pem-to-jwk')
const e = require('express')

// These keys are base64 encoded in .env
// const privatekey = Buffer.from(process.env.RSA_PRIVATE_KEY, 'base64').toString('utf8').replace(/\\n/gm, '\n')
// const cert = Buffer.from(process.env.CERT, 'base64').toString('utf8').replace(/\\n/gm, '\n')
// const jwk = pem2jwk(privatekey, { kid: '2022-06-ova-alpha', use: 'sig' }, 'private')

// Issuer.discover(process.env.ISSUER_BASE_URL).then(issuer => {
//   // console.log(issuer);

//   const client = new issuer.FAPI1Client({
//     client_id: process.env.CLIENT_ID,
//     redirect_uris: [process.env.CALLBACK_URL],
//     response_types: ['code'],
//     token_endpoint_auth_method: 'private_key_jwt',
//     id_token_signed_response_alg: 'ES256' // Great Caesar's ghost! It was this.
//   }, {
//     keys: [jwk]
//   })

//   client[custom.http_options] = function () {
//     const result = {}
//     result.cert = cert
//     result.key = privatekey
//     return result
//   }

//   // console.log(client);

//   router.use(passport.initialize())
//   router.use(passport.session())

//   passport.use(
//     'oidc',
//     new Strategy({
//       client,
//       params: {
//         scope: 'openid email phone',
//         nonce: generators.nonce()
//       },
//       passReqToCallback: true,
//       sessionKey: 'data'
//     }, (req, tokenset, userinfo, done) => {
//       /* TODO: Perform some checks */

//       if (userinfo.sub) {
//         console.log('sub: ', userinfo.sub, ' logged in')
//         return done(null, userinfo)
//       } else {
//         return done('Userinfo not found. Check the logs.')
//       }
//     })
//   )

//   router.get('/login', (req, res, next) => {
//     passport.authenticate('oidc')(req, res, next)
//   })

//   router.get('/callback', (req, res, next) => {
//     passport.authenticate('oidc', {
//       successRedirect: '/profile',
//       successMessage: true,
//       failureRedirect: '/login', /* this may go loopy */
//       failureMessage: true
//     })(req, res, next)
//   })

//   router.use((req, res, next) => {
//     // console.log('req.user: ', req.user);
//     res.locals.user = req.user
//     next()
//   })

//   passport.serializeUser(function (user, cb) {
//     cb(null, user)
//   })

//   passport.deserializeUser(function (obj, cb) {
//     cb(null, obj)
//   })
// })

router.post('/eligibility-one', function (req, res) {
  const formermember = req.body['former-member']

  if (!formermember) {
    error = { text: "Select 'Yes' or 'No'" }
    return res.render('eligibility-one', {error}) // relative URL, for reasons unknown
  }

  if (formermember == "no") {
    res.redirect("/ineligible")
  } else {
    res.redirect("/eligibility-two")
  }
})

router.post('/eligibility-two', function (req, res) {
  ukresident = req.body['uk-resident']

  if (!ukresident) {
    error = { text: "Select 'Yes' or 'No'" }
    return res.render('eligibility-two', {error}) 
  }

  if (ukresident == "no") {
    res.redirect("/ineligible")
  } else {
    res.redirect("/govuk_create_or_sign_in")
  }
})


/* This is as far as I got before going on leave. Sorry. */
router.post("/question_id_form", function (req, res){
  res.send("This is where the journey comes to a screeching halt. Sorry. Please see the <a href='https://drive.google.com/file/d/1DRK4h-TRTeDHjioJRtVo3V6MJVeZTwJ3/view'>TO BE flow, in particular, the 'Verification delivery' part.")
})

module.exports = router
