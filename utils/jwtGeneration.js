var jwt = require("jsonwebtoken");
module.exports = async function (payload) {
  let token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};
