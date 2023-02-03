const PORT = process.env.PORT || 8000

const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

//Call the express package to initialize it
const app = express()

//Create an array of newspapers
const newspapers = [
    {
        name: 'thestar',
        address: 'https://www.the-star.co.ke/sports/football',
        base: 'https://www.the-star.co.ke',
    },
    {
        name: 'theguardian',
        address: 'https://www.theguardian.com/football',
        base: '',
    },
    {
        name: 'nation',
        address: 'https://nation.africa/kenya/sports/football',
        base: 'https://nation.africa',
    },
    {
        name: 'thetelegraph',
        address: 'https://www.telegraph.co.uk/football/',
        base: 'https://www.telegraph.co.uk',
    },
]

const articles = []

//Loop through the newspapers and get all the relevant elements
newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data

            //Give the returned response to cheerio to help with picking out what is needed
            const $ = cheerio.load(html)
            $('div[class="article-body"]>a[href*="football"],div[class^="fc"] a[href*="football"],section[class*="large-col"] a[href*="football"],div[class*="article-list"]>a[href*="football"],h2[class*="list-headline"]>a[href*="football"]', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name,
                })
            })
        })
        .catch((error) => console.log(error))
})

//Create a generic home path/route
app.get('/', (req,res) => {
    res.json('Welcome to my Football News API!')
})

//Create a route for the articles from all the newspapers returned by cheerio
app.get('/footballnews', (req,res) => {
    res.json(articles)    
})

//Create a route for articles from a specific newspaper
app.get('/footballnews/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId

    //Get an array with one element of the specific newspaper object from the newspapers array
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base
    

    //Get the articles from the specific newspaper only and pass them to cheerio 
    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('div[class="article-body"]>a[href*="football"],div[class^="fc"] a[href*="football"],section[class*="large-col"] a[href*="football"],div[class*="article-list"]>a[href*="football"],h2[class*="list-headline"]>a[href*="football"]', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId,
                })
            })
            res.json(specificArticles)
        })
        .catch((error) => console.log(error))
})

//Check if express is listening to the dedicated port.
app.listen(PORT, () => console.log(`server running on port ${PORT}`))