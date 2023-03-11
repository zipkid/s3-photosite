#!/bin/bash

export HOSTEDZONE_ID='Z2R4BVHU6K9P2B'
export BUCKET='devopsdays.zipkid.eu'
export STACK='devopsdays-zipkid-eu'
aws-vault exec zipkid -- aws cloudformation deploy \
    --template-file cfn/site.yaml \
    --stack-name ${STACK} \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides BucketName=${BUCKET} HostedZoneId=${HOSTEDZONE_ID}

npm run build &&

export BUCKET='devopsdays.zipkid.eu'
aws-vault exec zipkid -- aws s3 sync web/ s3://${BUCKET} --acl public-read

export BUCKET='devopsdays.zipkid.eu'
aws-vault exec zipkid -- aws s3 sync  ~zipkid/Pictures/DevOpsDays/publish/ s3://${BUCKET}/albums/ --acl public-read

export BUCKET='devopsdays.zipkid.eu'
aws-vault exec zipkid -- aws s3 --recursive mv s3://${BUCKET}/albums/<from> s3://${BUCKET}/albums/<to>
