#!/bin/bash

# stop if we have some error
set -e

WS=`pwd`
D="${WS}/dependencies"

BRANCH=$GIT_BRANCH;
BRANCHID=`echo "$BRANCH"  | sed -r 's/origin\///g' | sed -r 's/\//-/'g`
echo "BRANCH: $BRANCH";
echo "BRANCHID: $BRANCHID";
echo "";

rm -rf public public-build
git reset --hard HEAD

git branch

git submodule update --init --recursive --remote

npm install --production

echo ${D}

rm -rf ${D}
mkdir ${D}

cd ${D}

git clone git://github.com/rappid/rAppid.js.git
cd rAppid.js
git checkout dev

npm install --production

cd ${WS}

gulp fonts

gulp sass

RAPPIDJS="${D}/rAppid.js/bin/rappidjs"
chmod +x ${RAPPIDJS}
VERSION="`${RAPPIDJS} version`-$BRANCHID-$BUILD_NUMBER";

echo "VERSION: $VERSION"

${RAPPIDJS} build --version ${VERSION}

cd public-build/${VERSION}
zip -r ${VERSION}.zip . > /dev/null

cd ../..

# fail if mvn fails, and grep doesn't fail
set -o pipefail
mvn deploy:deploy-file -DgroupId=net.sprd.hiptees -DartifactId=hiptees-frontend -Dpackaging=zip -Durl=https://repo.spreadomat.net/content/repositories/libs-qa/ -DrepositoryId=sprd-libs-releases -Dfile=public-build/${VERSION}/${VERSION}.zip -Dversion=${VERSION} | grep -v "KB"
