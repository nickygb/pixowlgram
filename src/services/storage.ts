import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

export const makeUploadService = (client: S3, bucket: string, folder: string) => {
  return async (photoBuffer: Buffer): Promise<string> => {
    const key = folder ? `${folder}/${uuid()}` : `${uuid()}`;
    // const buffer = Buffer.from(photo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    await client
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: photoBuffer,
        ContentEncoding: 'base64',
      })
      .promise();
    const photoUrl = `https://${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${bucket}/${key}`;
    return photoUrl;
  };
};
