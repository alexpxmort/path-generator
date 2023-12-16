const extractStringImport = (str, moduleName) => {
  let strs = '';

  const escapedModuleName = moduleName.replace(
    /[-\/\\^$*+?.()|[\]{}]/g,
    '\\$&'
  ); // Escapa caracteres especiais

  const regexPattern = new RegExp(
    `import {([^}]+)} from '${escapedModuleName}'`
  );

  const matches = str.match(regexPattern);

  if (matches && matches.length > 1) {
    const contentInsideBraces = matches[1].trim();
    const extractedValues = contentInsideBraces
      .split(',')
      .map((value) => value.trim());

    strs = extractedValues.join(',');

    strs = `${strs},`;
  }
  return strs;
};

module.exports = {
  extractStringImport
};
