'use strict';

/**
 * Module dependencies
 */

// Public node modules.
const winston = require('winston');
const reportback = require('reportback')();

// Local dependencies.
const generate = require('./generate');

// Logger.
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'debug',
      colorize: 'level'
    })
  ]
});

/**
 * Generate module(s)
 *
 * @param {Object} scope
 * @param {Function} cb
 *
 * @return {[Type]}
 */

module.exports = function (scope, cb) {
  cb = cb || {};
  cb = reportback.extend(cb, {
    error: cb.error,
    success: function () {
      cb.log.info('Success: Generated!');
    },
    notStrapiApp: function () {
      cb.log.error('Error: Not a Strapi application.');
    },
    alreadyExists: function () {
      return cb.error();
    }
  });

  // Use configured module name for this `generatorType` if applicable.
  const module = 'strapi-generate-' + scope.generatorType;
  let generator;
  let requireError;

  function throwIfModuleNotFoundError(error, module) {
    const isModuleNotFoundError = error && error.code === 'MODULE_NOT_FOUND' && error.message.match(new RegExp(module));
    if (!isModuleNotFoundError) {
      logger.error('Invalid `' + scope.generatorType + '` generator.');
      throw error;
    } else {
      return error;
    }
  }

  // Try to require the module or throw if error.
  try {
    generator = require('../../' + module);
  } catch (error) {
    requireError = throwIfModuleNotFoundError(error, module);
  }

  if (!generator) {
    return logger.error('No generator called `' + scope.generatorType + '` found.');
  }

  generate(generator, scope, cb);
};
