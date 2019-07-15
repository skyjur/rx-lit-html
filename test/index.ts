require('source-map-support').install();

mocha.setup("bdd");

import "./rxReplace.test";

mocha.run();
