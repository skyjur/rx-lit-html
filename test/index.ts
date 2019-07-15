import { install as sourceMapSupport } from "source-map-support";

sourceMapSupport();

mocha.setup("bdd");

import "./rxAppend.test";
import "./rxReplace.test";

mocha.run();
