import axios from "axios";
import "dotenv/config";

async function testTeams() {
   try {
      const response = await axios.post(process.env.TEAMS_WEBHOOK_URL, {
         type: "message",
         attachments: [
            {
               contentType: "application/vnd.microsoft.card.adaptive",
               content: {
                  type: "AdaptiveCard",
                  version: "1.4",
                  body: [
                     {
                        type: "TextBlock",
                        text: "🚀 AtomQuest Teams notification working!",
                        weight: "Bolder",
                        size: "Medium",
                     },
                     {
                        type: "TextBlock",
                        text: "Employee submitted goals for approval.",
                        wrap: true,
                     },
                  ],
               },
            },
         ],
      });

      console.log("Notification sent");
      console.log(response.data);
   } catch (error) {
      console.error(error.response?.data || error.message);
   }
}

testTeams();
