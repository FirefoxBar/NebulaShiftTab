function getOutputFile(_, version, extension) {
  return `NebulaShiftTab-${version}.${extension}`;
}

function getDistDir(browser) {
  return ['dist', browser].join('_');
}

module.exports = {
  getOutputFile,
  getDistDir,
};
