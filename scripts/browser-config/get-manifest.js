const extensionConfig = require('../../extension.json');

const baseManifest = {
  name: '__MSG_extName__',
  description: '__MSG_description__',
  version: '1.0.0',
  background: {},
  chrome_url_overrides: {
    newtab: 'new-tab.html',
  },
  homepage_url: 'https://team.firefoxcn.net',
  icons: {
    16: 'icons/logo.png',
    32: 'icons/logo.png',
    64: 'icons/logo.png',
    128: 'icons/logo.png',
  },
  manifest_version: 3,
  permissions: ['storage', 'alarms', 'unlimitedStorage'],
  host_permissions: ['*://*/*'],
};

const firefoxDataCollection = {
  required: ['none'],
};

function getManifest(browser, options) {
  const { packer, version } = options || {};
  // copy
  const manifest = JSON.parse(JSON.stringify(baseManifest));

  if (browser === 'chrome') {
    manifest.background = {
      service_worker: 'background.js',
    };
  }

  if (browser === 'firefox') {
    manifest.background = {
      scripts: ['background.js'],
    };
    if (packer === 'xpi') {
      const id = extensionConfig.xpi.find(x => x.browser === browser).id;
      manifest.browser_specific_settings = {
        gecko: {
          id,
          data_collection_permissions: firefoxDataCollection,
          strict_min_version: '113.0',
          update_url:
            'https://ext.firefoxcn.net/nebula-shift-tab/install/update.json',
        },
      };
    } else {
      const id = extensionConfig.amo.find(x => x.browser === browser).id;
      manifest.browser_specific_settings = {
        gecko: {
          id,
          data_collection_permissions: firefoxDataCollection,
          strict_min_version: '113.0',
        },
      };
    }
  }

  if (version) {
    manifest.version = version;
  }

  return manifest;
}

module.exports = getManifest;
