function getOutputFile(version, extension) {
  return ['NebulaShiftTab', version].join('-') + '.' + extension;
}

function getDistDir(browser) {
  return ['dist', browser].join('_');
}

module.exports = {
  getOutputFile,
  getDistDir,
};
