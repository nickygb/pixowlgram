import fs from 'fs';

export const range = (n) => (n === 1 ? [0] : Array(...Array(n).keys()));

export const existBucket = async (s3Client, bucketName) => {
  const { Buckets } = await s3Client.listBuckets().promise();
  const [bucket] = Buckets.filter((b) => b.Name === bucketName);
  return !!bucket;
};

export const base64Encode = (jpgFile) => {
  const bitmap = fs.readFileSync(jpgFile);
  return Buffer.from(bitmap).toString('base64');
};
