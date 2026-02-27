function getOutputFile(version, extension) {
  return (
    ['HeaderEditor', version].join(
      '-',
    ) +
    '.' +
    extension
  );
}

function getDistDir(browser) {
  return ['dist', browser].join('_');
}

module.exports = {
  getOutputFile,
  getDistDir,
};
