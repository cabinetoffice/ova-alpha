const NotifyClient = require("notifications-node-client").NotifyClient,
  notify = new NotifyClient(process.env.NOTIFYAPIKEY);
const express = require("express");
const router = express.Router();
// Add your routes here - above the module.exports line
const passport = require("passport");
const { Issuer, Strategy, generators, custom } = require("openid-client");
const pem2jwk = require("rsa-pem-to-jwk");
const { v4: uuidv4 } = require("uuid");
const { generateCustomUuid } = require("custom-uuid");
const validator = require("validator");

const {
  getFakeDIClaimResponse,
} = require("./assets/javascripts/fakeDIClaimJWT");

const {
  getClaimNames,
  getPreviousNames,
  getLikelyDischargeName,
} = require("./assets/javascripts/getClaimNames");

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

router.post("/sp4v1_start_veteran_verify_choice", function (req, res) {
  var answer = req.session.data["start_veteran_match_status"];

  if (!answer) {
    error = { text: "Select 'Success' or 'Fail'" };
    return res.render("eligibility-two", { error });
  }

  if (answer === "Success") {
    res.redirect("/sp4v1_start_veteran_verify");
  }

  if (answer === "Fail") {
    res.redirect("/sp4v1_start_veteran_verify");
  }
});

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
    res.redirect("/ineligible_non_resident");
  } else {
    res.redirect("/govuk_account_check");
  }
});

// router.post("/eligibility-three", function (req, res) {
//   post2005 = req.body["post-2005"];

//   if (!post2005) {
//     error = { text: "Select 'Yes' or 'No'" };
//     return res.render("eligibility-three", { error });
//   }

//   if (post2005) {
//     res.redirect("/govuk_account_check");
//   }
// });

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
    res.redirect("/govuk_create_or_sign_in");
  }
});

router.post("/govuk_account_sign_in_input", function (req, res) {
  var answer = req.session.data["govuk_question_email"];

  if (!answer) {
    error = { text: "Enter the email address you registered on GOV.UK" };
    return res.render("govuk_account_sign_in", { error });
  }

  if (answer && validator.isEmail(answer)) {
    res.redirect("/govuk_account_password");
  } else {
    error = { text: "Enter a valid email address" };
    return res.render("govuk_account_sign_in", { error });
  }
});

router.post("/govuk_account_password_input", function (req, res) {
  var answer = req.session.data["govuk_password"];

  if (!answer) {
    error = { text: "Enter the password you registered on GOV.UK" };
    return res.render("govuk_account_password", { error });
  }

  if (answer) {
    res.redirect("/govuk_account_sign_in_confirmed");
  }
});

router.post("/govuk_create_check_email_code", function (req, res) {
  var answer = req.session.data["govuk_email_code"];

  if (!answer) {
    error = { text: "Enter the 6 digit code sent to you" };
    return res.render("govuk_create_check_email", { error });
  }

  if (answer) {
    res.redirect("/govuk_account_sign_in_confirmed");
  }
});

router.post("/question_service_number_input", function (req, res) {
  var answer = req.session.data["question_service_number"];

  if (!answer) {
    error = { text: "Enter your service number" };
    return res.render("question_service_number", { error });
  }

  if (answer && answer.length === 11) {
    res.redirect("/question_enlistment_date");
  } else {
    error = {
      text: "Enter a valid service number length of 11 characters",
    };
    return res.render("question_service_number", { error });
  }
});

router.post("/question_choice_enlistment_date", function (req, res) {
  let enlistmentYear = req.session.data["enlistment-year-year"];
  let dischargeYear = req.session.data["discharge-year-year"];

  if (!enlistmentYear) {
    error = { text: "Enter a value for the year" };
    return res.render("question_enlistment_date", { error });
  }

  if (
    dischargeYear &&
    enlistmentYear &&
    validator.isBefore(dischargeYear, enlistmentYear)
  ) {
    error = { text: "Enlistment year can not be before discharge year" };
    return res.render("question_enlistment_date", { error });
  }

  if (
    enlistmentYear &&
    validator.isAfter(enlistmentYear, "1939") &&
    validator.isBefore(enlistmentYear)
  ) {
    res.redirect("/question_discharge_date");
  } else {
    error = { text: "Enter a valid year" };
    return res.render("question_enlistment_date", { error });
  }
});

router.post("/question_choice_discharge_date", function (req, res) {
  let dischargeYear = req.session.data["discharge-year-year"];
  let enlistmentYear = req.session.data["enlistment-year-year"];

  if (!dischargeYear) {
    error = { text: "Enter a value for the year" };
    return res.render("question_discharge_date", { error });
  }

  if (
    dischargeYear &&
    validator.isBefore(dischargeYear) && // is before today
    validator.isAfter(dischargeYear, "1939") &&
    (validator.isAfter(dischargeYear, enlistmentYear) ||
      dischargeYear === enlistmentYear)
  ) {
    // set up DI claim names
    let birthYear = Number(req.session.data["enlistment-year-year"]) - 20;
    req.session.data["birthYear"] = birthYear;

    // Identity claim set up
    const distinctClaimNames = getClaimNames(getFakeDIClaimResponse(birthYear)); // All the names

    // Set up session storage for current & previous names
    req.session.data["current_DI_name"] = distinctClaimNames[0];
    let previousNames = getPreviousNames(distinctClaimNames);
    req.session.data["previous_DI_names"] = previousNames;

    previousNames.forEach((name, index) => {
      req.session.data[`previous_DI_name_${index + 1}`] = name;
    });

    if (
      getLikelyDischargeName(getFakeDIClaimResponse(birthYear), dischargeYear)
    ) {
      req.session.data["likely_discharge_name"] = getLikelyDischargeName(
        getFakeDIClaimResponse(birthYear),
        dischargeYear
      );
      console.log(
        "likely_discharge_name----: ",
        req.session.data["likely_discharge_name"]
      );

      // let copyPreviousNames = [...previousNames];
      // copyPreviousNames.unshift(req.session.data["likely_discharge_name"]);

      // let uniquePrevNames = [...new Set(copyPreviousNames)];
      // req.session.data["likely_ordered_previous_names"] = uniquePrevNames;

      // previousNames.unshift(req.session.data["likely_discharge_name"]);

      // let uniquePrevNames = [...new Set(previousNames)];
      // req.session.data["likely_ordered_previous_names"] = uniquePrevNames;
    }

    console.log(
      "Likely Name Returned~~~~~~:",
      getLikelyDischargeName(getFakeDIClaimResponse(birthYear), dischargeYear)
    );

    console.log("SESSION!!!!!!!!!!!!!: ", req.session.data);

    res.redirect("/question_name_from_DI");
  } else {
    error = { text: "Enter a valid year" };
    return res.render("question_discharge_date", { error });
  }
});

router.post("/question_name_from_DI", function (req, res) {
  let nameAtDischarge = req.session.data["name_at_discharge"];

  if (!nameAtDischarge) {
    error = { text: "Select a name" };
    return res.render("question_name_from_DI", { error });
  }

  if (nameAtDischarge) {
    console.log("NEW!!!---:", req.session.data);
    return res.redirect("/question_NIN");
  }
});

router.post("/question_NIN_input", function (req, res) {
  var answer = req.session.data["national_insurance_number"];
  const regexUse = new RegExp(process.env.NIN_REGEX);

  if (!answer) {
    error = { text: "Enter your national insurance number" };
    return res.render("question_NIN", { error });
  }

  if (answer) {
    answer = answer.replace(/ /g, "");
  }

  if (answer === "QQ123456C" || (answer && regexUse.test(answer))) {
    res.redirect("/question_served_with");
  } else {
    error = { text: "Enter a National Insurance number in the correct format" };
    return res.render("question_NIN", { error });
  }
});

router.post("/question_id_route", function (req, res) {
  let answer = req.body["id_choice"];

  if (!answer) {
    error = { text: "Choose your preferred card format" };
    return res.render("question_id_type", { error });
  }

  if (answer) {
    res.redirect("/govuk_use_photo");
  }
});

router.post("/govuk_use_photo", function (req, res) {
  let answer = req.body["govuk_user_photo"];

  if (!answer) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("govuk_use_photo", { error });
  }

  if (answer === "yes") {
    res.redirect("/govuk_use_address");
  }

  if (answer === "no") {
    res.redirect("/govuk_update_details_sign_in_photo");
  }
});

router.post("/govuk_use_address_choice", function (req, res) {
  let answer = req.body["govuk_user_address"];

  if (!answer) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("govuk_use_address", { error });
  }

  if (answer == "yes") {
    res.redirect("/govuk_use_email");
  }

  if (answer == "no") {
    res.redirect("/govuk_update_details_sign_in_address");
  }
});

router.post("/govuk_use_email", function (req, res) {
  let answer = req.body["govuk_user_email"];

  if (!answer) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("govuk_use_email", { error });
  }

  if (answer === "yes") {
    res.redirect("/govuk_vetcard_comms");
  }

  if (answer === "no") {
    res.redirect("/govuk_update_details_sign_in_email");
  }
});

router.post("/govuk_vetcard_comms", function (req, res) {
  let answer = req.body["govuk_comms_choice"];

  if (!answer) {
    error = { text: "Select 'Yes' or 'No'" };
    return res.render("govuk_vetcard_comms", { error });
  }

  if (answer === "Yes") {
    res.redirect("/govuk_vetcard_communications_preference");
  }

  if (answer === "No") {
    res.redirect("/vetcard_account_summary_extra");
  }
});

router.post("/govuk_vetcard_communications_preference", function (req, res) {
  let answer = req.body["communications_choice"];

  if (answer === "_unchecked") {
    error = { text: "Select at least one option" };
    return res.render("govuk_vetcard_communications_preference", { error });
  }

  if (answer) {
    res.redirect("/vetcard_account_summary_extra");
  }
});

router.post("/govuk_vetcard_acc_summary_choice", function (req, res) {
  let answer = req.session.data["id_choice"];
  let matchStatus = req.session.data["start_veteran_match_status"];

  if (matchStatus === "Fail") {
    res.redirect("/vetcard_application_complete_match_fail");
  }

  if (answer === "Physical card") {
    res.redirect("/vetcard_application_complete_card_only");
  }

  if (answer === "Digital card") {
    res.redirect("/vetcard_application_complete_digital_only");
  }

  if (answer === "Physical and Digital") {
    res.redirect("/vetcard_application_complete_card_digital");
  }
});

router.post("/vetcard_account_summary_choice", function (req, res) {
  let id_choice = req.session.data["id_choice"];
  let full_name = req.session.data["full_name"];
  let postal_address = req.session.data["postal_address"];
  let emailAddress = req.session.data["govuk_question_email"];
  let serviceNumber = req.session.data["question_service_number"];

  let matchStatus = req.session.data["start_veteran_match_status"];

  let personalisation = {
    full_name: full_name.toString(),
    postal_address: postal_address.toString(),
    submission_reference: uuidv4(),
    service_number: serviceNumber.toString(),
  };

  if (!id_choice) {
    id_choice = "Physical card";
  }

  if (matchStatus === "Fail") {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_UNHAPPY_PATH_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        emailAddress.toString(),
        {
          personalisation: personalisation,
          reference: uuidv4(),
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data));

    res.redirect("/vetcard_application_complete_match_fail");
    return false;
  }

  if (id_choice === "Physical card") {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_CARD_ONLY_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        emailAddress.toString(),
        {
          personalisation: personalisation,
          reference: uuidv4(),
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data));

    res.redirect("/vetcard_application_complete_card_only");
  }

  if (id_choice === "Digital card") {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_DIGITAL_ONLY_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        emailAddress.toString(),
        {
          personalisation: personalisation,
          reference: uuidv4(),
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data));

    res.redirect("/vetcard_application_complete_digital_only");
  }

  if (id_choice === "Physical and Digital") {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_CARD_AND_DIGITAL_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        emailAddress.toString(),
        {
          personalisation: personalisation,
          reference: uuidv4(),
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data));

    res.redirect("/vetcard_application_complete_card_digital");
  }
});

router.post("/question_served_with", function (req, res) {
  let answer = req.body["branch-served-with"];

  if (!answer) {
    error = { text: "Select an option" };
    return res.render("question_served_with", { error });
  }

  if (answer) {
    res.redirect("/question_id_type");
  }
});

router.post("/vetcard_communications_choice", function (req, res) {
  let answer = req.body["vetcard_comms_choice"];

  if (!answer) {
    error = { text: "Select an option" };
    return res.render("vetcard_communications_choice", { error });
  }

  if (answer) {
    res.redirect("/vetcard_account_summary_extra");
  }
});

// The URL here needs to match the URL of the page that the user is on
// when they type in their email address
router.post("/notify_email_address_page", function (req, res) {
  let id_choice = req.session.data["id_choice"];
  let full_name = req.session.data["full_name"];
  let postal_address = req.session.data["postal_address"];

  let personalisation = {
    full_name: full_name.toString(),
    postal_address: postal_address.toString(),
    submission_reference: uuidv4(),
    service_number: generateCustomUuid("123456789ABC", 11), // ⇨ 'B5B66992471'
  };

  if (!req.body.emailAddress) {
    error = { text: "Enter a valid email address" };
    return res.render("notify_email_address_page", { error });
  }

  if (!id_choice) {
    id_choice = "Physical card";
  }

  if (id_choice === "Physical card") {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_CARD_ONLY_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        req.body.emailAddress,
        {
          personalisation: personalisation,
          reference: uuidv4(),
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data));

    res.redirect("/confirmation_page");
  }

  if (id_choice === "Digital card") {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_DIGITAL_ONLY_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        req.body.emailAddress,
        {
          personalisation: personalisation,
          reference: uuidv4(),
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data));

    res.redirect("/confirmation_page");
  }

  if (id_choice === "Physical and Digital") {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_CARD_AND_DIGITAL_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        req.body.emailAddress,
        {
          personalisation: personalisation,
          reference: uuidv4(),
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data));

    res.redirect("/confirmation_page");
  }
});

module.exports = router;
