#!/bin/sh

git branch --delete --force gh-pages
git checkout --orphan gh-pages
# rm -rf docs/openui5/*
# rm -rf docs/fiori-elements/*
rm -rf docs/ui5-webcomponents/*
rm -rf docs/fundamental-library-styles/*
mkdir docs/ui5-webcomponents
mkdir docs/fundamental-library-styles
# cp -r apps/openui5/dist/* docs/openui5   
# cp -r apps/fiori-elements/dist/* docs/fiori-elements   
cp -r apps/ui5-webcomponents/dist/* docs/ui5-webcomponents   
cp -r apps/fundamental-library-styles/dist/* docs/fundamental-library-styles
git add -f docs*
git commit -m "Rebuild GitHub pages"
git filter-branch -f --prune-empty --subdirectory-filter docs && git push -f origin gh-pages && git checkout -