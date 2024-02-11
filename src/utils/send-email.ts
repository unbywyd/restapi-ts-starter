import { appConfig } from "@base/config/app";
import * as sgMail from "@sendgrid/mail";
import logger from "./logger";

sgMail.setApiKey(appConfig.sendGridApiKey);

export async function sendEmailWithTemplate(
  templateId: string,
  recipientEmail: string,
  data: any
) {
  try {
    const msg = {
      to: recipientEmail,
      from: appConfig.sendGridSenderEmail,
      templateId: templateId,
      dynamicTemplateData: data,
    };

    await sgMail.send(msg);
    console.log("Email sent successfully to " + recipientEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendEmailWithHtml(
  recipientEmail: string,
  subject: string,
  html: string
) {
  try {
    const msg = {
      to: recipientEmail,
      from: appConfig.sendGridSenderEmail,
      subject: subject,
      html: html,
    };

    await sgMail.send(msg);
    logger.info("Email sent successfully to " + recipientEmail);
    console.log("Email sent successfully to " + recipientEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
