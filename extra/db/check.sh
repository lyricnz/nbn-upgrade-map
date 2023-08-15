#!/bin/bash -x

# check the latest release of the gnaf-loader
LAST_TAG=$(curl -s https://api.github.com/repos/minus34/gnaf-loader/releases/latest | jq -r .tag_name)

# check if we already have our derived image
IMG_NAME=lukeprior/nbn-upgrade-map-db
docker manifest inspect $IMG_NAME:xx$LAST_TAG

# exit code 0 means it exists, 1 means it doesn't
