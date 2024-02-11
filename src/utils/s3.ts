import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { createHash } from "crypto";
import moment from "moment";
import {
  getSignedUrl,
  S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import { appConfig } from "@base/config/app";

const bucketNamePub = appConfig.s3BucketNamePub;
const bucketNamePriv = appConfig.s3BucketNamePriv;
const region = appConfig.s3Region;
const accessKeyId = appConfig.s3AccessKeyId;
const secretAccessKey = appConfig.s3SecretAccessKey;

export const s3 = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKeyId as string,
    secretAccessKey: secretAccessKey as string,
  },
});

export async function getPresignedUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketNamePub,
    Key: fileKey,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}

export async function getPrivatePresignedUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketNamePriv,
    Key: fileKey,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}
export async function uploadBufferToS3(
  buffer: any,
  mimetype: string,
  originalname: string,
  bucket = bucketNamePub
): Promise<{
  url: string;
  key: string;
}> {
  const fileName = `${moment().format("YYYY-MM-DD")}/${createHash("sha1")
    .update(Date.now().toString())
    .digest("hex")}/${createHash("md5")
    .update(originalname)
    .digest("hex")}.${originalname.split(".").pop()}`;

  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
    ServerSideEncryption: "AES256",
  };

  return new Promise((resolve, reject) => {
    const command = new PutObjectCommand(params as any);
    s3.send(command as any, async (error: any, data: any) => {
      if (error) {
        reject(error);
      } else {
        const url = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;

        resolve({
          url:
            bucket == bucketNamePriv
              ? await getPrivatePresignedUrl(fileName)
              : url,
          key: fileName,
        });
      }
    });
  });
}
export async function uploadToS3(
  file: any,
  bucket = bucketNamePub
): Promise<{
  url: string;
  key: string;
}> {
  const fileBuffer = file.buffer;
  const mimetype = file.mimetype;

  const fileName = `${moment().format("YYYY-MM-DD")}/${createHash("sha1")
    .update(Date.now().toString())
    .digest("hex")}/${createHash("md5")
    .update(file.originalname)
    .digest("hex")}.${file.originalname.split(".").pop()}`;

  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
    ServerSideEncryption: "AES256",
  };

  return new Promise((resolve, reject) => {
    const command = new PutObjectCommand(params as any);
    s3.send(command as any, async (error: any, data: any) => {
      console.log(error);
      if (error) {
        reject(error);
      } else {
        const url = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;

        resolve({
          url:
            bucket == bucketNamePriv
              ? await getPrivatePresignedUrl(fileName)
              : url,
          key: fileName,
        });
      }
    });
  });
}

export const uploadPrivateFiles = async (files: any[]) => {
  let res: any[] = [];
  for (const file of files) {
    let data = await uploadToS3(file, bucketNamePriv);
    res.push(data);
  }
  return res;
};

export const uploadFiles = async (files: any[]) => {
  let res: any[] = [];
  for (const file of files) {
    let data = await uploadToS3(file);
    res.push(data);
  }
  return res;
};

export const checkFielsIsImages = (files: any[]) => {
  for (const file of files) {
    if (!file.mimetype.startsWith("image")) {
      throw new Error("File is not an image");
    }
  }
};
