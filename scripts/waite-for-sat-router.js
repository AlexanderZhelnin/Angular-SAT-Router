const fs = require("fs");

const pathToLib = "./dist/sat-router";

function waitFor(path) {
  if (!fs.existsSync(path)) setTimeout(() => waitFor(path), 500);
}

waitFor(pathToLib);
