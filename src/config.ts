interface Resources {
  bucketPhotos: string;
  folderPhotos: string;
}

export interface WebAppConfig {
  port: number;
  host: string;
  resources: Resources;
}

const config: WebAppConfig = {
  host: process.env.WEBAPP_HOST,
  port: parseInt(process.env.PORT) || 5000,
  resources: {
    bucketPhotos: process.env.BUCKET_PHOTOS || 'localstack-photos',
    folderPhotos: process.env.FOLDER_PHOTOS,
  },
};

export default config;
