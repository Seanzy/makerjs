import decentralizedOasisWithoutProxies from './configs/decentralized-oasis-without-proxies.json';
import kovan from './configs/kovan.json';
import http from './configs/http.json';
import merge from 'lodash.merge';
import { mergeServiceConfig } from './config';

class ConfigPresetNotFoundError extends Error {
  constructor(message) {
    super('Cannot find configuration preset with name: ' + message);
  }
}

const serviceRoles = [
  'allowance',
  'cdp',
  'conversionService',
  'exchange',
  'gasEstimator',
  'log',
  'price',
  'smartContract',
  'timer',
  'token',
  'transactionManager',
  'web3'
];

function loadPreset(name) {
  if (typeof name == 'object') {
    return name; // for testing
  }

  let preset;
  switch (name) {
    case 'test':
    case 'decentralized-oasis-without-proxies':
      preset = decentralizedOasisWithoutProxies;
      break;
    case 'http':
      preset = http;
      break;
    case 'kovan':
      preset = kovan;
      break;
    default:
      throw new ConfigPresetNotFoundError(name);
  }
  // make a copy so we don't overwrite the original values
  return merge({}, preset);
}

export default class ConfigFactory {
  /**
   * @param {string} preset
   * @param {object} options
   */
  static create(preset, options = {}) {
    if (typeof preset !== 'string') {
      options = preset;
      preset = options.preset;
    }

    const config = loadPreset(preset);

    for (let role of serviceRoles) {
      if (!(role in options)) continue;
      if (!(role in config.services)) {
        config.services[role] = options[role];
        continue;
      }
      config.services[role] = mergeServiceConfig(
        role,
        config.services[role],
        options[role]
      );
    }

    // web3-specific convenience options
    if (config.services.web3) {
      const web3Settings = config.services.web3[1] || config.services.web3;
      if (!web3Settings.provider) web3Settings.provider = {};

      if (options.url) {
        web3Settings.provider.url = options.url;
      }

      if (options.privateKey) {
        web3Settings.privateKey = options.privateKey;
      }

      if (options.provider) {
        merge(web3Settings.provider, options.provider);
      }

      if (options.overrideMetamask) {
        web3Settings.usePresetProvider = !options.overrideMetamask;
      }
    }

    return config;
  }
}
