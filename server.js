import express from "express";
import cors from "cors";
import "dotenv/config";

const PORT = process.env.PORT;
const app = express();

let favorites = [{}];
let watchlist = [{}];

app.use(cors());
app.use(express.json());

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  },
};

app.get("/movies/trending", async (req, res) => {
  const url = "https://api.themoviedb.org/3/trending/movie/day?language=en-US";
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      throw new Error("Error response not okay");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
    console.error(error);
  }
});

app.get("/movies/search", async (req, res) => {
  const term = req.query.term;
  if (!term) {
    return res.status(400).json({ error: "Missing 'term' query parameter" });
  }
  const url = `https://api.themoviedb.org/3/search/movie?query=${term}&include_adult=false&language=en-US&page=1`;

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      throw new Error("Error response not okay");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
    console.error(error);
  }
});

app.get("/favorites", (req, res) => {
  return res.json(favorites);
});

app.get("/favorites/:id", (req, res) => {
  const favorite = favorites.find(
    (favorite) => favorite.id.toString() === req.params.id,
  );
  if (!favorite) {
    return res.status(404).json({
      error: "404 not found: The requested favorite ID does not exist",
    });
  } else {
    return res.status(200).json(favorite);
  }
});

app.post("/favorites", (req, res) => {
  idNums = favorites.map((fav) => fav.id);
  newID = idNums === 0 ? 1 : Math.max(...idNums) + 1;

  const newFavorite = {
    id: newID,
    tmdbId: req.body.tmdbId,
    title: req.body.title,
    poster: req.body.poster,
    genre: req.body.genre,
    rating: req.body.rating,
  };

  favorites.push(newFavorite);
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
