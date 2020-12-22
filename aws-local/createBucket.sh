BUCKET_PHOTOS=localstack-photos
echo "Creating bucket: ${BUCKET_PHOTOS} ..."
awslocal s3 mb s3://${BUCKET_PHOTOS}
