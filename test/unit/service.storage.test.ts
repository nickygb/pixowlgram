import { S3 } from 'aws-sdk';
import chai from 'chai';
const expect = chai.expect;
import S3rver from 's3rver';
import { makeUploadService } from '../../src/services/storage';
import fs from 'fs';

const s3rver = new S3rver({ directory: './.s3rver', silent: true });

const s3Client = new S3({
  s3ForcePathStyle: true,
  accessKeyId: 'S3RVER',
  secretAccessKey: 'S3RVER',
  endpoint: 'http://localhost:4568',
});
const bucket = 'my-bucket';
const folder = 'my-folder';
const uploadPhotoService = makeUploadService(s3Client, bucket, folder);

const existBucket = async (s3Client, bucketName) => {
  const { Buckets } = await s3Client.listBuckets().promise();
  const [bucket] = Buckets.filter((b) => b.Name === bucketName);
  return !!bucket;
};
const base64Encode = (jpgFile) => {
  const bitmap = fs.readFileSync(jpgFile);
  return Buffer.from(bitmap).toString('base64');
};

describe('Upload photos service', function () {
  before(async function () {
    await s3rver.run();
    if (!(await existBucket(s3Client, bucket))) await s3Client.createBucket({ Bucket: bucket }).promise();
  });
  after(async function () {
    await s3rver.close();
  });

  it('Should upload the photo to the bucket and return its url', async () => {
    const photo = base64Encode('assets/480.jpeg');
    const photoUrl = await uploadPhotoService(photo);
    expect(
      photoUrl.startsWith(`https://${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${bucket}/${folder}/`)
    ).to.be.equal(true);
  });
});
