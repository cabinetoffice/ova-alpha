function getFakeDIClaimResponse (birthYear) {
  const birthYearNumber = Number(birthYear)

  const fakeJWT = {
    sub: 'urn:fdc:gov.uk:2022:56P4CMsGh_02YOlWpd8PAOI-2sVlB2nsNU7mcLZYhYw=',
    iss: 'https://identity.integration.account.gov.uk/',
    nbf: 1541493724,
    iat: 1541493724,
    exp: 1573029723,
    vot: 'P2',
    vtm: 'https://oidc.integration.account.gov.uk/trustmark',
    vc: {
      type: ['VerifiableCredential', 'VerifiableIdentityCredential'],
      credentialSubject: {
        name: [
          {
            validFrom: '2020-03-01',
            nameParts: [
              {
                value: 'Sandy',
                type: 'GivenName'
              },
              {
                value: 'Smith',
                type: 'FamilyName'
              }
            ]
          },
          {
            validUntil: '2020-03-01',
            nameParts: [
              {
                value: 'Sandy',
                type: 'GivenName'
              },
              {
                value: 'Williams',
                type: 'FamilyName'
              }
            ]
          },
          {
            validFrom: '1999-06-05',
            nameParts: [
              {
                value: 'Sandy',
                type: 'GivenName'
              },
              {
                value: 'Williams',
                type: 'FamilyName'
              }
            ]
          },
          {
            validUntil: '1999-06-05',
            nameParts: [
              {
                value: 'Sandy',
                type: 'GivenName'
              },
              {
                value: 'Murphy',
                type: 'FamilyName'
              }
            ]
          }
        ],
        birthDate: [
          {
            value: `${birthYearNumber}-01-01`
          }
        ]
      }
    }
  }

  return fakeJWT
}

module.exports = {
  getFakeDIClaimResponse
}
