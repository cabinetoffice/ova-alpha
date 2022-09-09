function getClaimNames (getFakeDIClaimResponse) {
  const claimNames = getFakeDIClaimResponse.vc.credentialSubject.name

  const currentName = []
  const previousNames = []
  const namesExport = []

  claimNames.forEach((name) => {
    if (name.validFrom) {
      const fullName = []
      name.nameParts.forEach((namePart) => {
        fullName.push(namePart.value)
      })
      currentName.push(fullName.join(' '))
    }

    if (name.validUntil) {
      const fullName = []
      name.nameParts.forEach((namePart) => {
        fullName.push(namePart.value)
      })

      previousNames.push(fullName.join(' '))
    }
  })

  namesExport.push(currentName[0])
  namesExport.push(previousNames)

  return namesExport.flat()
}

function getPreviousNames (claimNames) {
  return claimNames.slice(1, claimNames.length)
}

function displayPreviousDIClaimNames (claimNames) {
  const previousNames = getPreviousNames(claimNames)
  const previousNamesHtml = []

  for (let index = 0; index < previousNames.length; index++) {
    const radioElementPrevious = `<div class="govuk-radios__item">
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
              </div>`

    previousNamesHtml.push(radioElementPrevious)
  }
  return previousNamesHtml
}

module.exports = {
  getClaimNames,
  getPreviousNames,
  displayPreviousDIClaimNames
}
