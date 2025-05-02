
const express = require('express')
const path = require('path');

const app = express();
const PORT = 3000;

const { Telegraf } = require('telegraf');

// Replace 'YOUR_BOT_API_TOKEN' with the token from BotFather
const bot = new Telegraf('7431478791:AAGtfL5jljLACknHrJcwtKuDLWSrTXdT8jY');

// Start command to open the Monetag mini-app link
bot.start((ctx) => {
  ctx.reply('Welcome! Click the link below to visit the Monetag Mini App:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Open Monetag Mini App', url: 'https://3401-157-38-47-242.ngrok-free.app' }]
      ]
    }
  });
});


bot.launch();
console.log("Run");

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser for form POST
app.use(express.urlencoded({ extended: true }));

//! ANIME
app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12;

  try {
    const response = await fetch(`https://api.jikan.moe/v4/seasons/now?page=${page}&limit=${limit}`);
    const data = await response.json();
    let animes = data.data;

    animes = animes.sort((a, b) => {
      const dateA = new Date(a.aired.from || 0);
      const dateB = new Date(b.aired.from || 0);
      return dateB - dateA;
    });

    res.render('index', {  pageType: 'anime', animes, page });

  } catch (error) {
    console.error(error);
    res.send('Error fetching anime.');
  }
});

app.get('/anime/:id', async (req, res) => {
  const animeId = req.params.id;

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
    const data = await response.json();

    if (!data || !data.data) {
      return res.send('Anime not found.');
    }

    const anime = data.data;

    res.render('animeDetails', { anime });

  } catch (error) {
    console.error('Error fetching anime details:', error);
    res.send('Error fetching anime details.');
  }
});

app.get('/search', async (req, res) => {
  const animeName = req.query.animeName?.trim().toLowerCase();

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&sfw=true`);
    const data = await response.json();
    let animes = data.data;

    // Filter exact or close title match
    animes = animes.filter(anime =>
      anime.title?.toLowerCase().includes(animeName) ||
      anime.title_english?.toLowerCase().includes(animeName)
    );

    res.render('index', { pageType: 'anime',animes, page: 1 });

  } catch (err) {
    console.error(err);
    res.render('index', { pageType: 'anime',animes: [], page: 1 });
  }
});

app.get('/anime/:id/videos', async (req, res) => {
  const animeId = req.params.id;

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/videos`);
    const data = await response.json();
    const videos = data.data;

    res.render('videos', { videos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching anime videos.');
  }
});

app.get('/anime/:id/recommendations', async (req, res) => {
  const animeId = req.params.id;

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/recommendations`);
    
    // Ensure we correctly parse the response JSON and handle errors
    const data = await response.json(); 

    // Check if data and recommendations are present before rendering
    if (data && data.data && Array.isArray(data.data)) {
      const recommendations = data.data;
      res.render('recommendations', { recommendations });
    } else {
      // Handle case when data or recommendations are not available
      res.send('No recommendations found for this anime.');
    }
  } catch (error) {
    console.error(error);
    res.send('Error fetching recommendations.');
  }
});


app.get('/anime/:id/pictures', async (req, res) => {
  const animeId = req.params.id;

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/pictures`);
    const data = await response.json();
    const pictures = data.data;

    res.render('pictures', {
      pictures
    });
  } catch (error) {
    console.error(error);
    res.send('Error fetching pictures.');
  }
});


app.get('/top-anime', async (req, res) => {
  try {
    const response = await fetch('https://api.jikan.moe/v4/top/anime');
    const data = await response.json();
    
    const topAnime = data.data;

    res.render('index', { pageType: 'top-anime',animes: topAnime });
  } catch (error) {
    console.error('Error fetching top anime:', error);
    res.send('Failed to load top anime.');
  }
});
app.get('/recommendations', async (req, res) => {
  try {
    const response = await fetch('https://api.jikan.moe/v4/recommendations/anime');
    const data = await response.json();

    // Option 1: Render to EJS template
    res.render('index', {pageType: 'recommendation', recommendations: data.data });

    // Option 2: Return raw JSON
    // res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch anime recommendations');
  }
});

//! MANGA

app.get('/manga', async (req, res) => {
  try {
    const response = await fetch('https://api.jikan.moe/v4/manga?page=1');
    const data = await response.json();

    res.render('manga', { mangaList: data.data });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching manga data');
  }
});





// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
