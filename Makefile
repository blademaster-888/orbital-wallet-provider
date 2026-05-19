.PHONY: build publish

build:
	npm run build

publish: build
	npm publish
