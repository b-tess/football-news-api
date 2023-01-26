const PORT = 8000

const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

//Call the express package to initialize it
const app = express()

const articles = []

//Create a generic home path/route
app.get('/', (req,res) => {
    res.json('Welcome to my Football News API!')
})

//Create a route for the articles returned by cheerio
app.get('/footballnews', (req,res) => {
    axios.get('https://www.theguardian.com/football')
        .then((response) => {
            const html = response.data
            
            //Give the returned response to cheerio to help with picking out what is needed
            const $ = cheerio.load(html)

            $('a:contains("football")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url,
                })
            })
            res.json(articles)
        })
        .catch((error) => console.log(error))
})

//Check if express is listening to the dedicated port.
app.listen(PORT, () => console.log(`server running on port ${PORT}`))