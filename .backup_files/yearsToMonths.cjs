"use strict";
exports.yearsToMonths = yearsToMonths;
var _index = require("./constants.cjs");

/**
 * @name yearsToMonths
 * @category Conversion Helpers
 * @summary Convert years to months.
 *
 * @description
 * Convert a number of years to a full number of months.
 *
 * @param years - The number of years to be converted
 *
 * @returns The number of years converted in months
 *
 * @example
 * // Convert 2 years into months
 * const result = yearsToMonths(2)
 * //=> 24
 */
function yearsToMonths(years) {
  return Math.trunc(years * _index.monthsInYear);
}
