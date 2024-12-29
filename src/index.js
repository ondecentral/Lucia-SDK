import Lucia from "./lucia-sdk.js";

const LuciaSDK = {};

LuciaSDK.init = function (config) {
  if (typeof window === 'undefined') return;

  const userConfig = config || {};

  const instance = new Lucia(userConfig);
  LuciaSDK.authenticate = instance.authenticate;
  LuciaSDK.userInfo = instance.userInfo;
  LuciaSDK.pageView = instance.pageView;
  LuciaSDK.trackConversion = instance.trackConversion;
  LuciaSDK.buttonClick = instance.buttonClick;
  LuciaSDK.sendWalletInfo = instance.sendWalletInfo;
  LuciaSDK.checkMetaMaskConnection = instance.checkMetaMaskConnection;
};

LuciaSDK.getClientIP = function () {
  console.log("this is being called correctly");
  // async getClientIp() {
  //   try {
  //       const response = await fetch(this.baseURL + '/api/clip'); // Replace with your server endpoint
  //       if (!response.ok) {
  //           throw new Error(`Error fetching IP: ${response.statusText}`);
  //       }
  //       const data = await response.json();
  //       return data.ip; // Assuming the server returns { ip: "xxx.xxx.xxx.xxx" }
  //   } catch (error) {
  //       console.error('Failed to fetch client IP:', error);
  //       throw error;
  //   }
  // }
}

export default LuciaSDK;
