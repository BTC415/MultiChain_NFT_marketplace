const axios = require('axios');
const twit = require('twit');

// const twitterConfig = {
//     consumer_key: 'iDstsciPU9Bh6LPybGcNDxdAM',
//     consumer_secret: '902xOLKsOr9HEsfJE6zDGmleV0ugSzxdjkmdHSXstDPhLaRp9u',
//     access_token: '1505941202084175873-FfiJYlb4GzaRuXqD7L4AZsnrXijdC4',
//     access_token_secret: 'FgSCAEXeTCclhTNgFEF0IsSde2OPaGMRtZZwPa1GOck6S',
// };

const twitterConfig = {
    consumer_key: 'iDstsciPU9Bh6LPybGcNDxdAM',
    consumer_secret: '902xOLKsOr9HEsfJE6zDGmleV0ugSzxdjkmdHSXstDPhLaRp9u',
    access_token: '1478135251268423685-VL2RdkygDrhO0aLfCmIbgpGz24rZOb',
    access_token_secret: 'qATDevi2gHM5XGvZmjspYLM8KmG8rjD8BG8H8yfF9pNqf',
};
// {
//     oauth_token: '1478135251268423685-VL2RdkygDrhO0aLfCmIbgpGz24rZOb',
//     oauth_token_secret: 'qATDevi2gHM5XGvZmjspYLM8KmG8rjD8BG8H8yfF9pNqf',
//     user_id: '1478135251268423685',
//     screen_name: 'PeterPa35439196'
// }
const twitterClient = new twit(twitterConfig);

// Tweet a text-based status
async function tweet(tweetText) {
    const tweet = {
        status: tweetText,
    };

    twitterClient.post('statuses/update', tweet, (error, tweet, response) => {
        if (!error) {
            console.log(`Successfully tweeted: ${tweetText}`);
        } else {
            console.error(error);
        }
    });
}

// OPTIONAL - use this method if you want the tweet to include the full image file of the OpenSea item in the tweet.
async function tweetWithImage(tweetText, imageUrl) {
    // Format our image to base64
    const processedImage = await getBase64(imageUrl);

    // Upload the item's image to Twitter & retrieve a reference to it
    const mediaPromise = await new Promise((resolve, reject) => {
        twitterClient.post('media/upload', { media_data: processedImage }, (error, media, response) => {
            if (!error) {
                twitterClient.post('statuses/update',
                    {
                        status: tweetText,
                        media_ids: [media.media_id_string]
                    },
                    (error, tweet, response) => {
                        if (!error) {
                            resolve(tweet)
                        } else {
                            reject(error)
                        }
                    });
            } else {
                reject(error)
            }
        })
    });
    // console.log("tweet: ", media);
    return mediaPromise;
}

// Format a provided URL into it's base64 representation
function getBase64(url) {
    return axios.get(url, { responseType: 'arraybuffer' }).then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

export default {
    tweet: tweet,
    tweetWithImage: tweetWithImage
};