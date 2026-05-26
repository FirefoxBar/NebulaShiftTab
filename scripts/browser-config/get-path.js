function getOutputFile(_, version, extension) {
  return `NebulaShiftTab-${version}.${extension}`;
}

function getDistDir(browser) {
  return `dist_${browser}`;
}

module.exports = {
  getOutputFile,
  getDistDir,
};
