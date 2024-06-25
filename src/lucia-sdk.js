import {
  udata,
  getLidData,
  getSessionData,
  storeSessionID,
  init,
  getUser,
} from "./data.js";

export default class Lucia {
  constructor(options) {
    this.clientId = options.clientId;
    this.baseURL = options.baseURL;
    this.api_key = options.api_key;
    //this.data= await udata();
    this.user = options.username;
    this.pollingInterval = null;
    this.pollingFrequency = 5000;
    storeSessionID();
    init(options.api_key, options.baseURL);
  }

  async authenticate() {
    const headers = {
      "Content-Type": "application/json",
      "X-API-KEY": this.api_key,
    };
    const req = {
      user: this.clientId,
      key: this.api_key,
    };
    await fetch(this.baseURL + "/api/key/auth/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(req),
    })
      .then((response) => {
        //console.log(response);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  async userInfo(user, userInfo) {
    //console.log("adding user information");
    try {
      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": this.api_key,
      };
      const lid = getLidData();
      console.log("lid", lid);
      const session = getSessionData();
      const req = {
        client: this.clientId,
        user: { name: user, data: await udata(), userInfo: userInfo },
        lid: lid,
        session: session,
      };
      if (user && user.length > 0)
        localStorage.setItem("luc_uid", JSON.stringify(user));
      this.user = user;
      await fetch(this.baseURL + "/api/sdk/user/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(req),
      })
        .then((response) => {
          //console.log(response);
        })
        .catch((error) => {
          console.error(error.message);
        });
    } catch (e) {
      console.log(e.message);
    }
  }

  async pageView(page) {
    try {
      const lid = getLidData();
      console.log("lid", lid);
      const session = getSessionData();
      if (!this.user) {
        this.user = getUser();
      }
      const request = {
        client: this.clientId,
        page: page,
        user: { name: this.user, data: await udata() },
        lid: lid,
        session: session,
      };
      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": this.api_key,
      };
      await fetch(this.baseURL + "/api/sdk/page/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(request),
      })
        .then((response) => {
          //console.log(response);
        })
        .catch((error) => {
          console.error(error.message);
        });
    } catch (e) {
      console.log(e.message);
    }
  }

  async trackConversion(event_tag, amount, event_details) {
    try {
      const lid = getLidData();
      const session = getSessionData();
      if (!this.user) {
        this.user = getUser();
      }
      const request = await {
        client: this.clientId,
        tag: event_tag,
        amount: amount,
        event: event_details,
        user: { name: this.user, data: await udata() },
        lid: lid,
        session: session,
      };

      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": this.api_key,
      };

      await fetch(this.baseURL + "/api/sdk/conversion/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(request),
      })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (e) {
      console.log(e.message);
    }
  }

  async buttonClick(button) {
    try {
      const lid = getLidData();
      console.log("lid", lid);
      const session = getSessionData();
      if (!this.user) {
        this.user = getUser();
      }
      const request = {
        client: this.clientId,
        button: button,
        user: { name: this.user, data: await udata() },
        lid: lid,
        session: session,
      };
      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": this.api_key,
      };
      await fetch(this.baseURL + "/api/sdk/click/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(request),
      })
        .then((response) => {
          //console.log(response);
        })
        .catch((error) => {
          console.error(error.message);
        });
    } catch (e) {
      console.log(e.message);
    }
  }

  async sendWalletInfo(walletAddress) {
    try {
      const lid = getLidData();
      const session = getSessionData();
      if (!this.user) {
        this.user = getUser();
      }
      const request = {
        client: this.clientId,
        walletAddress: walletAddress,
        user: {
          name: this.user,
          data: await udata(),
        },
        lid: lid,
        session: session,
      };
      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": this.api_key,
      };
      await fetch(this.baseURL + "/api/sdk/wallet/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(request),
      })
        .then((response) => {
          //console.log(response);
        })
        .catch((error) => {
          console.error(error.message);
        });
    } catch (error) {}
  }

  async walletConnection() {
    const pollingInterval = setInterval(async () => {
      const isConnected = this.checkMetaMaskConnection();
      if (isConnected) {
        await this.sendWalletInfo(window.ethereum.selectedAddress);
        clearInterval(pollingInterval); // Clear interval when connected
        console.log("Interval cleared");
      } else {
        console.log("MetaMask not connected yet..");
      }
    }, this.pollingFrequency);
  }

  checkMetaMaskConnection() {
    // Check if MetaMask is installed and connected
    if (
      window.ethereum &&
      window.ethereum.isConnected() &&
      window.ethereum.selectedAddress
    ) {
      return true;
    } else {
      return false;
    }
  }
}
