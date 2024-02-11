import "reflect-metadata";
import { fixModuleAlias } from "./utils/fix-module-alias";
fixModuleAlias(__dirname);

import { appConfig } from "@base/config/app";
import { glob } from "glob";
import path from "path";

(async () => {
  const initPath = __dirname + appConfig.installFilesDir;

  const files = await glob(initPath, {
    cwd: __dirname,
  });
  files.forEach((file) => {
    const absolutePath = path.isAbsolute(file)
      ? file
      : path.join(__dirname, file);
    require(absolutePath);
  });
})();
