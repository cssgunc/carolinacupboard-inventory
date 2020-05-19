#!/usr/bin/sh
node -e 'require("./db/db-util").dropTables(true)' && node -e 'require("./db/db-util").createTables(true)' && node -e 'require("./db/db-util").initAdmin(true)'