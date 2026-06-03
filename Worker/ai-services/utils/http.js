'use strict';

function badRequest(res, error) {
  return res.status(400).json({ success: false, error });
}

function requireBodyField(res, value, error) {
  if (value) return false;
  badRequest(res, error);
  return true;
}

module.exports = { badRequest, requireBodyField };
