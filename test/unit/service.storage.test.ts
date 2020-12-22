import { S3 } from 'aws-sdk';
import chai from 'chai';
const expect = chai.expect;
import S3rver from 's3rver';
import { makeUploadService } from '../../src/services/storage';
import { existBucket } from '../lib/utils';
import fs from 'fs';
import path from 'path';

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

describe('Upload photos service', function () {
  before(async function () {
    await s3rver.run();
    if (!(await existBucket(s3Client, bucket))) await s3Client.createBucket({ Bucket: bucket }).promise();
  });
  after(async function () {
    await s3rver.close();
  });

  it('--> Should upload the photo to the bucket and return its url', async () => {
    const buffer = fs.readFileSync(path.join(__dirname, '..', 'assets', '480.jpeg'));
    const photoUrl = await uploadPhotoService(buffer);
    expect(
      photoUrl.startsWith(`https://${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${bucket}/${folder}/`)
    ).to.be.equal(true);
  });
});
