const bcryptjs = require("bcryptjs");

const hashPassword = async (password) => {
  return await bcryptjs.hash(password, 12);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcryptjs.compare(password, hashedPassword);
};

const generatePassword = () => {
  return Math.random().toString(36).slice(-8) + "@1A";
};

module.exports = {
  hashPassword,
  comparePassword,
  generatePassword,
};
