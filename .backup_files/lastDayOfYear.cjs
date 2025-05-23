"use strict";
exports.lastDayOfYear = lastDayOfYear;
var _index = require("./toDate.cjs");

/**
 * The {@link lastDayOfYear} function options.
 */

/**
 * @name lastDayOfYear
 * @category Year Helpers
 * @summary Return the last day of a year for the given date.
 *
 * @description
 * Return the last day of a year for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The last day of a year
 *
 * @example
 * // The last day of a year for 2 September 2014 11:55:00:
 * const result = lastDayOfYear(new Date(2014, 8, 2, 11, 55, 00))
 * //=> Wed Dec 31 2014 00:00:00
 */
function lastDayOfYear(date, options) {
  const date_ = (0, _index.toDate)(date, options?.in);
  const year = date_.getFullYear();
  date_.setFullYear(year + 1, 0, 0);
  date_.setHours(0, 0, 0, 0);
  return date_;
}
