import "dotenv/config";
import { syncContent } from "../src/lib/sync";

syncContent()
  .then(() => {
    console.log("Sync completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
