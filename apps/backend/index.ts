import express from "express";
import routes from "./routes";
import cors from "cors"

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("/", routes);

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
