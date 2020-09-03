const app = require("express")();

app.get("/", (req, res) => {
  res.send({ message: "Docker is actually not that difficult 🐳" });
});

const port = process.env.PORT || 8080;

app.listen(port, () =>
  console.log(`App listening on http://localhost:${port}`)
);
