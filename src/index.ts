import "dotenv/config";
import { app } from "./app";
import { env } from "./config";
import { logger } from "./utils/logger";

const port = env.PORT || 4000;

app.get("/",(req,res)=>{
    res.send("AI resume analyser backend running 🚀")
})


app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});
