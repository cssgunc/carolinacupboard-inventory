#!/usr/bin/sh
node -e 'require("./db/db-util").dropTables()' && node -e 'require("./db/db-util").createTables()' && node -e 'require("./db/db-util").initAdmin()'