import { appConfig } from "@base/config/app";
import axios from "axios";
import logger from "./logger";

const config = {
  senderName: appConfig.name,
  key: appConfig.inforuKey,
  token: appConfig.inforuTokenFuture,
  inforukey: "anyapp",
  inforutoken: appConfig.inforuToken,
  endpoint: "https://uapi.inforu.co.il/SendMessageXml.ashx?InforuXML=",
};

async function sendSms(to: string, text: string) {
  console.log("sending sms to number - " + to, text);
  const xmlBody = `<Inforu><User><Username>${config.inforukey}</Username><Password>${config.inforutoken}</Password></User><Content Type="sms"><Message>${text}</Message></Content><Recipients><PhoneNumber>${to}</PhoneNumber></Recipients><Settings><Sender>${config.senderName}</Sender></Settings></Inforu>`;
  try {
    const response = await axios.post(encodeURI(config.endpoint + xmlBody));

    if (response.status == 200) {
      logger.info("sms sent successfully to number - " + to);
      console.log("sms sent successfully to number - " + to);
    } else {
      console.log("failed to sent to number - " + to);
      throw new Error("failed to sent to number - " + to);
    }
  } catch (error) {
    console.log("error in sending sms to number - " + to + " - " + error);
  }
}

export default sendSms;
