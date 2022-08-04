const express = require('express')
const router = express.Router()
// Add your routes here - above the module.exports line
const passport = require('passport')
const { Issuer, Strategy, generators, custom } = require('openid-client')
const pem2jwk = require('rsa-pem-to-jwk')
const e = require('express')

// These keys are base64 encoded in .env
const privatekey = Buffer.from(process.env.RSA_PRIVATE_KEY, 'base64').toString('utf8').replace(/\\n/gm, '\n')
const cert = Buffer.from(process.env.CERT, 'base64').toString('utf8').replace(/\\n/gm, '\n')
const jwk = pem2jwk(privatekey, { kid: '2022-06-ova-alpha', use: 'sig' }, 'private')

Issuer.discover(process.env.ISSUER_BASE_URL).then(issuer => {
  // console.log(issuer);

  const client = new issuer.FAPI1Client({
    client_id: process.env.CLIENT_ID,
    redirect_uris: [process.env.CALLBACK_URL],
    response_types: ['code'],
    token_endpoint_auth_method: 'private_key_jwt',
    id_token_signed_response_alg: 'ES256' // Great Caesar's ghost! It was this.
  }, {
    keys: [jwk]
  })

  client[custom.http_options] = function () {
    const result = {}
    result.cert = cert
    result.key = privatekey
    return result
  }

  // console.log(client);

  router.use(passport.initialize())
  router.use(passport.session())

  passport.use(
    'oidc',
    new Strategy({
      client,
      params: {
        scope: 'openid email phone',
        nonce: generators.nonce()
      },
      passReqToCallback: true,
      sessionKey: 'data'
    }, (req, tokenset, userinfo, done) => {
      /* TODO: Perform some checks */

      if (userinfo.sub) {
        console.log('sub: ', userinfo.sub, ' logged in')
        return done(null, userinfo)
      } else {
        return done('Userinfo not found. Check the logs.')
      }
    })
  )

  router.get('/login', (req, res, next) => {
    passport.authenticate('oidc')(req, res, next)
  })

  router.get('/callback', (req, res, next) => {
    passport.authenticate('oidc', {
      successRedirect: '/profile',
      successMessage: true,
      failureRedirect: '/login', /* this may go loopy */
      failureMessage: true
    })(req, res, next)
  })

  router.use((req, res, next) => {
    // console.log('req.user: ', req.user);
    res.locals.user = req.user
    next()
  })

  passport.serializeUser(function (user, cb) {
    cb(null, user)
  })

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj)
  })
})

router.post('/eligibility-one', function (req, res) {
  const formermember = req.session.data['former-member']
  if (formermember == "no") {
    res.redirect("/ineligible")
  } else {
    res.redirect("/eligibility-two")
  }
})

router.post('/eligibility-two', function (req, res) {
  ukresident = req.session.data['uk-resident']
  if (ukresident == "no") {
    res.redirect("/ineligible")
  } else {
    res.redirect("/eligibility-three")
  }
})

router.post('/eligibility-three', function (req, res) {
  const post2005 = req.session.data['post-2005']
  if(post2005 == "no") {
    res.redirect("/ineligible")
  } else {
    res.redirect("/prove_id_start")
  }
})

router.post('/ask-apply-veteran-card-answer', function (req, res) {
  const answer = req.session.data['ask-apply-veteran-card']

  if (answer === 'yes') {
    res.redirect('/start_veteran_apply_id_card')
  } else {
    res.redirect('/verify_your_identity')
  }
})

router.post('/verify-your-identity-answer', function (req, res) {
  const answer = req.session.data['verify-your-identity']

  if (answer === 'verify-identity-photo-address') {
    res.redirect('/upload_photo_passport')
  } else {
    res.redirect('/upload_photo_drivers_licence')
  }
})

router.post('/govuk-prove-id-start-answer', function (req, res) {
  const answer = req.session.data['govuk-prove-id-confirmation-check']

  if (answer === 'govuk-prove-id-confirmation-check-agree') {
    res.redirect('/govuk_prove_id_explanation')
  } else {
    res.redirect('/govuk_prove_id_start_no_confirm')
  }
})

router.post(
  '/sp4v1_apply_behalf_someone_else_radio_answer',
  function (req, res) {
    const answer = req.session.data.sp4v1_apply_behalf_someone_else_radio

    // console.log("ANSWER: ", answer);

    if (answer === 'sp4v1_apply_behalf_someone_else_radio_yes') { res.redirect('/sp4v1_behalfOf_question_name_service') }

    if (answer === 'sp4v1_apply_behalf_someone_else_radio_no') { res.redirect('/sp4v1_question_name') }

    if (!answer) res.redirect('/sp4v1_apply_behalf_someone_else_radio_error')
  }
)

router.post('/mod_access_email_radio_answer', function (req, res) {
  const answer = req.session.data.mod_access_email_radio

  if (
    answer === 'mod_access_email_radio_yes' ||
    answer === 'mod_access_email_radio_no'
  ) {
    res.redirect('/mod_request_info_you_someone_else_radio')
  } else {
    res.redirect('/mod_access_email_radio_error')
  }
})

router.post('/mod_prove_id_to_continue_radio_answer', function (req, res) {
  const answer = req.session.data.mod_prove_id_to_continue_radio

  if (answer === 'mod_prove_id_to_continue_radio_sign_up') { res.redirect('/mod_prove_id_start') }

  if (answer === 'mod_prove_id_to_continue_radio_another_way') { res.redirect('/verify_your_identity') }

  if (!answer) res.redirect('/mod_prove_id_to_continue_error')
})

router.post(
  '/sp4v1_verify_vet_prove_id_to_continue_radio_answer',
  function (req, res) {
    const answer =
      req.session.data.sp4v1_verify_vet_prove_id_to_continue_radio

    if (answer === 'sp4v1_verify_vet_prove_id_to_continue_radio_apply_veteran') { res.redirect('/sp4v1_verify_vet_prove_id_start') }

    if (answer === 'sp4v1_verify_vet_prove_id_to_continue_radio_prove_veteran') { res.redirect('/sp4v1_verify_vet_verify_your_identity') }

    if (!answer) res.redirect('/sp4v1_verify_vet_prove_id_to_continue_error')
  }
)

router.post('/mod_prove_id_gov_acc_answer', function (req, res) {
  const answer = req.session.data.mod_prove_id_gov_acc_radio

  if (answer === 'mod_prove_id_gov_acc_radio_govuk_account') { res.redirect('/create_govuk_acc') }

  if (answer === 'mod_prove_id_gov_acc_radio_govuk_verify') { res.redirect('/postoffice_prove_id_start') }

  if (!answer) res.redirect('/mod_prove_id_gov_acc_error')
})

router.post('/sp4v1_behalfOf_prove_id_gov_acc_answer', function (req, res) {
  const answer = req.session.data.sp4v1_behalfOf_prove_id_gov_acc_radio

  if (answer === 'sp4v1_behalfOf_prove_id_gov_acc_radio_govuk_account') { res.redirect('/sp4v1_behalfOf_create_govuk_acc') }

  if (answer === 'sp4v1_behalfOf_prove_id_gov_acc_radio_govuk_verify') {
    res.redirect(
      'https://www.postoffice.co.uk/identity/in-branch-verification-service'
    )
  }

  if (!answer) res.redirect('/sp4v1_behalfOf_prove_id_gov_acc_error')
})

router.post('/sp4v1_verify_vet_prove_id_gov_acc_answer', function (req, res) {
  const answer = req.session.data.sp4v1_verify_vet_prove_id_gov_acc_radio

  if (answer === 'sp4v1_verify_vet_prove_id_gov_acc_radio_govuk_account') { res.redirect('/sp4v1_verify_vet_create_govuk_acc') }

  if (answer === 'sp4v1_verify_vet_prove_id_gov_acc_radio_govuk_verify') {
    res.redirect(
      'https://www.postoffice.co.uk/identity/in-branch-verification-service'
    )
  }

  if (!answer) res.redirect('/sp4v1_verify_vet_prove_id_gov_acc_error')
})

router.post('/mod_someone_else_name_answer', function (req, res) {
  const answer = req.session.data.mod_someone_else_name_radio

  if (answer === 'mod_prove_id_gov_acc_radio_govuk_account') { res.redirect('/create_govuk_acc') }

  if (answer === 'mod_prove_id_gov_acc_radio_govuk_verify') { res.redirect('/verify_your_identity') }

  if (!answer) res.redirect('/mod_prove_id_gov_acc_error')
})

router.post(
  '/sp4v1_behalfOf_apply_question_id_choice_answer',
  function (req, res) {
    const answer = req.session.data.question_id_choice

    if (answer === 'question_id_choice_physical_card') { res.redirect('/sp4v1_behalfOf_apply_application_complete') }

    if (answer === 'question_id_choice_digital_card') { res.redirect('/sp4v1_behalfOf_apply_application_complete') }

    if (answer === 'question_id_choice_both') { res.redirect('/sp4v1_behalfOf_apply_application_complete') }

    if (!answer) res.redirect('/sp4v1_behalfOf_apply_question_ID_choice_error')
  }
)

router.post(
  '/sp4v1_verify_vet_apply_question_id_choice_answer',
  function (req, res) {
    const answer = req.session.data.sp4v1_verify_vet_apply_question_id_choice

    if (answer === 'sp4v1_verify_vet_apply_question_id_choice_physical_card') { res.redirect('/sp4v1_verify_vet_apply_application_complete') }

    if (answer === 'sp4v1_verify_vet_apply_question_id_choice_digital_card') { res.redirect('/sp4v1_verify_vet_apply_application_complete') }

    if (answer === 'sp4v1_verify_vet_apply_question_id_choice_both') { res.redirect('/sp4v1_verify_vet_apply_application_complete') }

    if (!answer) res.redirect('/sp4v1_verify_vet_apply_application_complete')
  }
)

router.post('/question_id_choice_answer', function (req, res) {
  const answer = req.session.data.question_id_choice

  if (answer === 'question_id_choice_physical_card') { res.redirect('/application_complete') }

  if (answer === 'question_id_choice_digital_card') { res.redirect('/application_complete') }

  if (answer === 'question_id_choice_both') { res.redirect('/application_complete') }

  if (!answer) res.redirect('/question_id_choice_error')
})

router.post(
  '/sp4v1_behalfOf_relationship_to_radio_answer',
  function (req, res) {
    const answer = req.session.data.sp4v1_apply_behalfOf_relationship_to_radio

    if (answer) res.redirect('/sp4v1_behalfOf_question_email')

    if (!answer) res.redirect('/sp4v1_behalfOf_relationship_to_radio_error')
  }
)

router.post(
  '/sp4v1_behalfOf_prove_veteran_id_radio_answer',
  function (req, res) {
    const answer = req.session.data.sp4v1_behalfOf_prove_veteran_id_radio

    if (answer === 'sp4v1_behalfOf_prove_veteran_id_radio_govuk_account') { res.redirect('/sp4v1_behalfOf_prove_id_start') }

    if (answer === 'sp4v1_behalfOf_prove_veteran_id_radio_govuk_verify') { res.redirect('/sp4v1_behalfOf_id_verification_radio') }

    if (!answer) res.redirect('/sp4v1_behalfOf_prove_veteran_id_radio_error')
  }
)

router.post(
  '/sp4v1_behalfOf_id_verification_radio_answer',
  function (req, res) {
    const answer = req.session.data.sp4v1_behalfOf_id_verification_radio

    if (answer) res.redirect('/sp4v1_upload_photo')

    if (!answer) res.redirect('/sp4v1_behalfOf_id_verification_radio_error')
  }
)

module.exports = router
