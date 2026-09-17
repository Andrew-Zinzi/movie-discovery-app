import express from "express";
import cors from "cors";
import "dotenv/config";

const PORT = process.env.PORT;
const app = express();

let favorites = [];
let watchlist = [];

const movieLookup = new Map();
const genres = new Map();

app.use(cors());
app.use(express.json());

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  },
};

async function getGenres() {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/genre/movie/list?language=en",
      options,
    );
    const data = await response.json();
    data.genres.forEach((genre) => genres.set(genre.id, genre.name));
  } catch (error) {
    console.log(error);
  }
}

getGenres();

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
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(term)}&include_adult=false&language=en-US&page=1`;

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      data.results.forEach((movie) => {
        movieLookup.set(movie.id, movie);
      });
      res.status(200).json(Array.from(movieLookup.values()));
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

// ------------------------------------
// favorites routes

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
  const idNums = favorites.map((fav) => fav.id).filter(Boolean);
  const newID = idNums.length === 0 ? 1 : Math.max(...idNums) + 1;

  const rawMovie = movieLookup.get(Number(req.body[0]?.id));
  // console.log(movieLookup);
  // console.log(rawMovie);
  if (!rawMovie) {
    return res.status(404).json({ error: "404 movie not found" });
  } else {
    const newFavorite = {
      id: newID,
      tmdbId: rawMovie.id,
      title: rawMovie.title,
      releaseDate: rawMovie.release_date,
      genre: rawMovie.genre_ids.map((key) => genres.get(key) || "Unknown"),
      poster: rawMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${rawMovie.poster_path}`
        : null,
      rating: 0,
    };

    favorites.push(newFavorite);
    return res.status(201).json(newFavorite);
  }
});

app.put("/favorites/:id", (req, res) => {
  const favorite = favorites.find(
    (favorite) => favorite.id.toString() === req.params.id,
  );

  if (!favorite) {
    return res.status(404).json({
      error: "404 not found: The requested favorite ID does not exist",
    });
  } else {
    const { rating = 0 } = req.body

    favorite.rating = rating;
    return res.status(200).json(favorite);
  }
});

app.delete("/favorites/:id", (req, res) => {
  const favorite = favorites.find(
    (favorite) => favorite.id.toString() === req.params.id,
  );

  if (!favorite) {
    return res.status(404).json({
      error: "404 not found: The requested favorite ID does not exist",
    });
  } else {
    favorites = favorites.filter((favorite) => favorite.id.toString() !== req.params.id)
    return res.status(200).json(favorite);
  }
});

// ------------------------------------
// watchlist routes

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
