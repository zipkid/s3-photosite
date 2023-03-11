#!/bin/bash

npm run build

export HOSTEDZONE_ID='Z2R4BVHU6K9P2B'
export BUCKET='devopsdays.zipkid.eu'
export STACK='devopsdays-zipkid-eu'
aws-vault exec zipkid -- aws cloudformation deploy \
    --template-file cfn/site.yaml \
    --stack-name ${STACK} \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides BucketName=${BUCKET} HostedZoneId=${HOSTEDZONE_ID}

export BUCKET='devopsdays.zipkid.eu'
aws-vault exec zipkid -- aws s3 sync web/ s3://${BUCKET} --acl public-read
