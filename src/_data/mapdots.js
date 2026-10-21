const fs = require("fs");
module.exports = fs.readFileSync(__dirname + "/mapdots.txt", "utf8");
