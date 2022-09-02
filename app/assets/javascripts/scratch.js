// function getNameAtDischarge(validUntilDate, dischargeYear) {
//   let matchDistance = {};
//   matchDistance.validUntil = validUntilDate;

//   let validUntilArray = matchDistance.validUntil.split("-");
//   let validUntilYear = Number(validUntilArray[0]);
//   let yearArray = [];
//   yearArray.push(dischargeYear);
//   yearArray.push(validUntilYear);

//   yearArray.sort((a, b) => b - a);
//   let yearDiff = yearArray[0] - yearArray[1];

//   matchDistance.yearDiff = yearDiff;
//   distanceFromDischargeYear.push(matchDistance);

//   const uniqueValues = [
//     ...new Set(distanceFromDischargeYear.map((el) => JSON.stringify(el))),
//   ].map((el) => JSON.parse(el));

//   return uniqueValues
// }

// let getFakeDIClaimResponse = {
//   sub: "urn:fdc:gov.uk:2022:56P4CMsGh_02YOlWpd8PAOI-2sVlB2nsNU7mcLZYhYw=",
//   iss: "https://identity.integration.account.gov.uk/",
//   nbf: 1541493724,
//   iat: 1541493724,
//   exp: 1573029723,
//   vot: "P2",
//   vtm: "https://oidc.integration.account.gov.uk/trustmark",
//   vc: {
//     type: ["VerifiableCredential", "VerifiableIdentityCredential"],
//     credentialSubject: {
//       name: [
//         {
//           validFrom: "2020-03-01",
//           nameParts: [
//             {
//               value: "Sandy",
//               type: "GivenName",
//             },
//             {
//               value: "Smith",
//               type: "FamilyName",
//             },
//           ],
//         },
//         {
//           validUntil: "2020-03-01",
//           nameParts: [
//             {
//               value: "Sandy",
//               type: "GivenName",
//             },
//             {
//               value: "Williams",
//               type: "FamilyName",
//             },
//           ],
//         },
//         {
//           validFrom: "1999-06-05",
//           nameParts: [
//             {
//               value: "Sandy",
//               type: "GivenName",
//             },
//             {
//               value: "Williams",
//               type: "FamilyName",
//             },
//           ],
//         },
//         {
//           validUntil: "1999-06-05",
//           nameParts: [
//             {
//               value: "Sandy",
//               type: "GivenName",
//             },
//             {
//               value: "Murphy",
//               type: "FamilyName",
//             },
//           ],
//         },
//       ],
//       birthDate: [
//         {
//           value: `1950-01-01`,
//         },
//       ],
//     },
//   },
// };

// function getClaimNames(getFakeDIClaimResponse) {
//   const claimNames = getFakeDIClaimResponse.vc.credentialSubject.name;
//   //   console.log("CLAIM NAME>>>>>>>>>: ",claimNames);

//   let currentName = [];
//   let previousNames = [];
//   let nameAtDischarge = [];
//   let namesExport = [];

//   let distanceFromDischargeYear = [];
//   let dischargeYear = 1995;
//   let claimNamesCopy = [...claimNames];

//   claimNames.map((nameObj) => {
//     if (nameObj.validFrom) {
//       nameObj.nameParts.map((namePart) => {
//         currentName.push(namePart.value);
//       });
//     }

//     if (nameObj.validUntil) {
//       let mostLikelyYear;
//       let matchDistance = {};

//       for (const property in nameObj) {
//         console.log(`${property}: ${nameObj[property]}`);
//       }

//       nameObj.nameParts.map((namePart) => {
//         //   getNameAtDischarge(name.validUntil)
//         // console.log("NAME : ",name )

//         matchDistance.validUntil = nameObj.validUntil;

//         let validUntilArray = matchDistance.validUntil.split("-");
//         let validUntilYear = Number(validUntilArray[0]);
//         let yearArray = [];
//         yearArray.push(dischargeYear);
//         yearArray.push(validUntilYear);
//         //descending order
//         yearArray.sort((a, b) => b - a);
//         let yearDiff = yearArray[0] - yearArray[1];

//         matchDistance.yearDiff = yearDiff;
//         distanceFromDischargeYear.push(matchDistance);
//         let uniqueDateValues = [
//           ...new Set(distanceFromDischargeYear.map((el) => JSON.stringify(el))),
//         ].map((el) => JSON.parse(el));

//         //ascending order
//         uniqueDateValues.sort(
//           (objA, objB) => Number(objA.yearDiff) - Number(objB.yearDiff)
//         );
//         console.log("UNIQUE--------", uniqueDateValues);
//         mostLikelyYear = Number(uniqueDateValues[0].validUntil.split("-")[0]);
//         console.log("Most Likely year: ", mostLikelyYear);

//         let upperLikelyRange = dischargeYear + 5;
//         let lowerLikelyRange = dischargeYear - 5;

//         if (
//           mostLikelyYear === dischargeYear ||
//           mostLikelyYear <= upperLikelyRange ||
//           mostLikelyYear >= lowerLikelyRange
//         ) {
//           // console.log("Hello:", claimNamesCopy)

//           claimNamesCopy.map((el) => {
//             // console.log(el.validFrom)
//             if (
//               el.validFrom &&
//               el.validFrom === uniqueDateValues[0].validUntil
//             ) {
//               console.log("EL: ", el);
//             }
//           });
//           // TODO:
//         }

//         // Don't touch this
//         previousNames.push(namePart.value);
//       });
//     }
//     // console.log("UNIQUE--------",uniqueDateValues)
//   });

//   namesExport.push(currentName.join(" "));
//   namesExport.push(previousNames.join(" "));

//   return namesExport;
// }

// getClaimNames(getFakeDIClaimResponse);

// function getClaimNames(getFakeDIClaimResponse) {
//   const claimNames = getFakeDIClaimResponse.vc.credentialSubject.name;
//   //   console.log("CLAIM NAME>>>>>>>>>: ",claimNames);

//   let currentName = [];
//   let previousNames = [];
//   let nameAtDischarge = [];
//   let namesExport = [];
//   let objYearArray = [];
//   let distanceFromDischargeYear = [];
//   let dischargeYear = 1995;
//   let claimNamesCopy = [...claimNames];
//   let testNameArray = [];

//   claimNames.map(
//     (nameObj) => {
//       if (nameObj.validFrom) {
//         nameObj.nameParts.map((namePart) => {
//           currentName.push(namePart.value);
//         });
//       }

//       if (nameObj.validUntil) {
//         // console.log("@@@@@@@@@@@@:", nameObj)
//         objYearArray.push(nameObj.validUntil);
//         // console.log("objYearArray~~~~~~~:", objYearArray)
//         let mostLikelyYear;
//         let matchDistance = {};

//         for (const property in nameObj) {
//           // console.log(`${property}: ${nameObj[property]}`);
//         }

//         nameObj.nameParts.map((namePart) => {
//           //   getNameAtDischarge(name.validUntil)
//           // console.log("NAME : ",name )

//           matchDistance.validUntil = nameObj.validUntil;

//           let validUntilArray = matchDistance.validUntil.split("-");
//           let validUntilYear = Number(validUntilArray[0]);
//           let yearArray = [];
//           yearArray.push(dischargeYear);
//           yearArray.push(validUntilYear);
//           //descending order
//           yearArray.sort((a, b) => b - a);
//           let yearDiff = yearArray[0] - yearArray[1];

//           matchDistance.yearDiff = yearDiff;
//           distanceFromDischargeYear.push(matchDistance);
//           let uniqueDateValues = [
//             ...new Set(
//               distanceFromDischargeYear.map((el) => JSON.stringify(el))
//             ),
//           ].map((el) => JSON.parse(el));

//           //ascending order
//           let uniqueOrderedDateValues = uniqueDateValues.sort(
//             (objA, objB) => Number(objA.yearDiff) - Number(objB.yearDiff)
//           );
//           // console.log("UNIQUE ORDERD DATES--------",uniqueOrderedDateValues)
//           mostLikelyYear = Number(
//             uniqueOrderedDateValues[0].validUntil.split("-")[0]
//           );
//           // console.log("Most Likely year: ", mostLikelyYear)

//           let upperLikelyRange = dischargeYear + 5;
//           let lowerLikelyRange = dischargeYear - 5;

//           if (
//             mostLikelyYear === dischargeYear ||
//             mostLikelyYear <= upperLikelyRange ||
//             mostLikelyYear >= lowerLikelyRange
//           ) {
//             console.log("Hello:", claimNamesCopy);
//             // console.log("OBJ YEAR ARRAY:", objYearArray)
//             claimNamesCopy.map((obj) => {
//               console.log("OBJ:", obj);
//               // if(Number(obj.validUntil.validUntil.split("-")[0])) === mostLikelyYear) {
//               //     testNameArray.push(namePart.value);
//               //     console.log(testNameArray)
//               // }
//             });
//           }
//         });

//         // Don't touch this
//         previousNames.push(namePart.value);
//       }
//     }
//     // console.log("UNIQUE--------",uniqueDateValues)
//   );

//   namesExport.push(currentName.join(" "));
//   namesExport.push(previousNames.join(" "));

//   return namesExport;
// }

let claimNames = ["Sandy Smith", "Sandy Williams", "Sandy Murphy"];

function getPreviousNames(claimNames) {
  return claimNames.slice(1, claimNames.length);
}

function displayPreviousDIClaimNames(claimNames) {
  let previousNames = getPreviousNames(claimNames);
  let previousNamesHtml = [];

  let radioElementCurrent = `<div class="govuk-radios__item">
              <input
                class="govuk-radios__input"
                id="current_DI_name"
                name="current_DI_name"
                type="radio"
                value="govuk-verify"
                aria-describedby="current_DI_name_item_hint"
              />
              <label class="govuk-label govuk-radios__label" for="current_DI_name">
                {{data["current_DI_name"]}}
              </label>
              <div
                id="current_DI_name_item_hint"
                class="govuk-hint govuk-radios__hint"
              >
                We believe this is the most current verified name we have on record for you.
              </div>`;

  for (let index = 0; index < previousNames.length; index++) {
    let radioElementPrevious = `<div class="govuk-radios__item">
              <input
                class="govuk-radios__input"
                id="previous_DI_name_${index + 1}"
                name="previous_DI_name_${index + 1}"
                type="radio"
                value="govuk-verify"
                aria-describedby="previous_DI_name_${index + 1}_item_hint"
              />
              <label class="govuk-label govuk-radios__label" for="previous_DI_name_${
                index + 1
              }">
                {{data["previous_DI_name_${index + 1}"]}}
              </label>
              <div
                id="previous_DI_name_${index + 1}_item_hint"
                class="govuk-hint govuk-radios__hint"
              >
                We believe this was is an older name you had previously used.
              </div>`;

    previousNamesHtml.push(radioElementPrevious);
  }
  return previousNamesHtml;
}

displayPreviousDIClaimNames(claimNames);

// function getNameAtDischarge(validUntilDate) {
//   let matchDistance = {};
//   matchDistance.validUntil = validUntilDate;

//   let validUntilArray = matchDistance.validUntil.split("-");
//   let validUntilYear = Number(validUntilArray[0]);
//   let yearArray = [];
//   yearArray.push(dischargeYear);
//   yearArray.push(validUntilYear);
//   //descending order
//   yearArray.sort((a, b) => b - a);
//   let yearDiff = yearArray[0] - yearArray[1];

//   matchDistance.yearDiff = yearDiff;
//   distanceFromDischargeYear.push(matchDistance);
//   let uniqueDateValues = [
//     ...new Set(distanceFromDischargeYear.map((el) => JSON.stringify(el))),
//   ].map((el) => JSON.parse(el));

//   //ascending order
//   uniqueDateValues.sort(
//     (objA, objB) => Number(objA.yearDiff) - Number(objB.yearDiff)
//   );
//   console.log("UNIQUE--------", uniqueDateValues);
//   let mostLikelyYear = Number(uniqueDateValues[0].validUntil.split("-")[0]);
//   console.log(mostLikelyYear);

//   let upperLikelyRange = dischargeYear + 5;
//   let lowerLikelyRange = dischargeYear - 5;

//   if (
//     mostLikelyYear === dischargeYear ||
//     mostLikelyYear <= upperLikelyRange ||
//     mostLikelyYear >= lowerLikelyRange
//   ) {
//   }
// }
