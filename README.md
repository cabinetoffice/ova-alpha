# Mission 674 Alpha

This is a fork of the [GOV.UK Prototype Kit site](https://govuk-prototype-kit.herokuapp.com/docs) integrated with [GOV.UK Sign In](https://docs.sign-in.service.gov.uk/)

It requires [passport.js](https://www.passportjs.org/) and [node-openid-client](https://github.com/panva/node-openid-client), which is the only node.js library certified for the OpenID [Financial-Grade API Spec](https://fapi.openid.net/).

It won't do much unless you [register your service](https://docs.sign-in.service.gov.uk/integrate-with-integration-environment/manage-your-service-s-configuration/) with GOV.UK Sign In as a Relying Party.  You'll also need to [generate keys](https://docs.sign-in.service.gov.uk/integrate-with-integration-environment/generate-a-key/) you can transform into a JWK.

I've done this by generating a public/private keypair and certificate in the normal way (and _not_ the way the Sign In docs recommend, because their method yields headers not understood by `rsa-pem-to-jwk`.  [This might be a n00b problem, and there could easily be a better way to create a JWK]).

```
openssl genrsa -out private_rsa.pem 2048
openssl req -new -key private_rsa.pem -out csr
# answer annoying questions ...
openssl x509 -in csr -out cert.pem -req -signkey private_rsa.pem -days 365
```

You'll have a self-signed x509 certificate (`cert.pem`) and a corresponding private key (`private_rsa.pem`). You can add these as environment variables (e.g. in `.env`).  But they will need to be `base64` encoded so line breaks, etc, don't give you hassle:

```
echo RSA_PRIVATE_KEY=$(base64 private_rsa.pem) >> .env
echo CERT=$(base64 cert.pem) >> .env
```

You can now push your application to [Gov PaaS](https://www.cloud.service.gov.uk/) or similar.

Any problems, contact <chris.fryer@digital.cabinet-office.gov.uk>
