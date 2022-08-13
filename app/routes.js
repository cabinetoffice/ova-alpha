const express = require("express");
const router = express.Router();
// Add your routes here - above the module.exports line
const passport = require("passport");
const { Issuer, Strategy, generators, custom } = require("openid-client");
const pem2jwk = require("rsa-pem-to-jwk");
const e = require("express");

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

router.post("/eligibility-one", function (req, res) {
  const formermember = req.body["former-member"];

  if (!formermember) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("eligibility-one", { error }); // relative URL, for reasons unknown
  }

  if (formermember == "no") {
    res.redirect("/ineligible");
  } else {
    res.redirect("/eligibility-two");
  }
});

router.post("/eligibility-two", function (req, res) {
  ukresident = req.body["uk-resident"];

  if (!ukresident) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("eligibility-two", { error });
  }

  if (ukresident == "no") {
    res.redirect("/ineligible");
  } else {
    res.redirect("/govuk_create_or_sign_in");
  }
});

/* This is as far as I got before going on leave. Sorry. */
router.post("/question_id_form", function (req, res) {
  res.send(
    "This is where the journey comes to a screeching halt. Sorry. Please see the <a href='https://drive.google.com/file/d/1DRK4h-TRTeDHjioJRtVo3V6MJVeZTwJ3/view'>TO BE flow, in particular, the 'Verification delivery' part."
  );
});

router.post("/govuk_account_check", function (req, res) {
  var answer = req.session.data["gov_uk_account_check"];

  if (!answer) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("govuk_account_check", { error });
  }

  if (answer == "yes") {
    res.redirect("/govuk_account_sign_in");
  } else {
    res.redirect("/govuk_account_sign_in");
  }
});

router.post("/question_id_choice_route", function (req, res) {
  let answer = req.body["id_choice"];

  if (!answer) {
    error = { text: "Please choose your preferred card format" };
    return res.render("question_id_choice", { error });
  }

  if (answer) {
    res.redirect("/govuk_use_photo");
  }
});

router.post("/govuk_use_photo", function (req, res) {
  let answer = req.body["govuk_user_photo"];
  console.log("PHOTO ANSWER: ", answer);
 
  if (!answer) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("govuk_use_photo", { error });
  }

  if (answer) {
    res.redirect("/govuk_use_address");
  }
});

router.post("/govuk_use_address", function (req, res) {
  let answer = req.body["govuk_user_address"];

  if (!answer) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("govuk_use_address", { error });
  }

  if (answer) {
    res.redirect("/govuk_use_email");
  }
});

router.post("/govuk_use_email", function (req, res) {
  let answer = req.body["govuk_user_email"];

  if (!answer) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("govuk_use_email", { error });
  }

  if (answer) {
    res.redirect("/govuk_vetcard_communications_check");
  }
});

router.post("/govuk_vetcard_communications_check", function (req, res) {
  let answer = req.body["communications_choice"];

  if (answer === "_unchecked") {
    error = { text: "Please select an option" };
    return res.render("govuk_vetcard_communications_check", { error });
  }

  if (answer) {
    res.redirect("/govuk_vetcard_account_summary");
  }
});

router.post("/question_served_with", function (req, res) {
  let answer = req.body["branch-served-with"];

  if (!answer) {
    error = { text: "Please select an option" };
    return res.render("question_served_with", { error });
  }

  if (answer) {
    res.redirect("/vetcard_communications_choice");
  }
});

router.post("/vetcard_communications_choice", function (req, res) {
  let answer = req.body["vetcard_comms_choice"];

  if (!answer) {
    error = { text: "Please select an option" };
    return res.render("vetcard_communications_choice", { error });
  }

  if (answer) {
    res.redirect("/vetcard_account_summary_extra");
  }
});

module.exports = router;
