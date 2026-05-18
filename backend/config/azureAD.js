import { ConfidentialClientApplication } from "@azure/msal-node";

function getMsalConfig() {
  return {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
      clientSecret: process.env.AZURE_CLIENT_SECRET
    }
  };
}

function getMsalClient() {
  return new ConfidentialClientApplication(getMsalConfig());
}

export { getMsalConfig, getMsalClient };