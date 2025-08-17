import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(event) {
  try {
    const query = event.queryStringParameters.text || '';
    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query parameter "text" is required' }),
      };
    }

    const baseUrl = 'https://col3negtelevision.com';
    const url = `${baseUrl}/${query}`;
    
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract data
    const status = response.status;
    const title = $('#col3neg-watch-video-title h2').text().trim();
    const imageLink = $('meta[property="og:image"]').attr('content');
    const videoUrl = $('#col3neg-player-holder iframe').attr('src');

    // Extract related episodes
    const episodes = [];
    $('.col3neg-watch-video-cell').each((i, element) => {
      const episodeTitle = $(element).find('.col3neg-watch-video-cell-title a').text().trim();
      const episodeLink = $(element).find('.col3neg-watch-video-cell-title a').attr('href');
      const episodeImage = $(element).find('.col3neg-video-thumb img').attr('src');
      episodes.push({
        title: episodeTitle,
        link: episodeLink ? `${baseUrl}${episodeLink}` : '',
        image: episodeImage,
      });
    });

    // Response data
    const data = {
      status,
      title,
      imageLink,
      videoUrl: videoUrl ? `${baseUrl}${videoUrl}` : '',
      relatedEpisodes: episodes,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to fetch or parse data', details: error.message }),
    };
  }
}
