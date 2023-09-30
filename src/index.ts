import sequelize from "@/config/Sequalize";
import app from "@/server";
import config from "./config/config";

const port = config.port

app.listen(port, async () => {
  await sequelize.sync({});
  console.log("All models were synchronized successfully.");
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

