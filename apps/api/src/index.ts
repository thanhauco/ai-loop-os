import { createApiApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const { app } = createApiApp();

app.listen(port, () => {
  console.log(`AI-Loop-OS API listening on http://localhost:${port}`);
});
