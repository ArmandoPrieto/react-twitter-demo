const Twitter = require('twitter');

module.exports = (app, io) => {
    let twitter = new Twitter({
        consumer_key: "",
        consumer_secret: "",
        access_token_key: "",
        access_token_secret: ""
    });

    let socketConnection;
    let twitterStream;

    app.locals.searchTerm = 'Guaido'; //Default search term for twitter stream.
    app.locals.showRetweets = false; //Default

   

    /*const stream = () => {
        console.log('Resuming for ' + app.locals.searchTerm);
        twitter.stream('statuses/filter', { track: app.locals.searchTerm }, (stream) => {
            stream.on('data', (tweet) => {
                sendMessage(tweet);
            });

            stream.on('error', (error) => {
                console.log(error);
            });

            twitterStream = stream;
        });
    }*/

    const stream = () => {
        console.log('Resuming for ' + app.locals.searchTerm);
        twitter.get('search/tweets', { q: app.locals.searchTerm }, (error, tweets,response) => {
            if (!error) {
                console.log(response);
                tweets.statuses.forEach(element => {
                    sendMessage(element);    
                    twitterStream = response;
                });
                
            }
        });
    }


    /**
     * Sets search term for twitter stream.
     */
    app.post('/setSearchTerm', (req, res) => {
        let term = req.body.term;
        app.locals.searchTerm = term;
        twitterStream.destroy();
        stream();
    });

    /**
     * Pauses the twitter stream.
     */
    app.post('/pause', (req, res) => {
        console.log('Pause');
        twitterStream.destroy();
    });

    /**
     * Resumes the twitter stream.
     */
    app.post('/resume', (req, res) => {
        console.log('Resume');
        stream();
    });

    //Establishes socket connection.
    io.on("connection", socket => {
        socketConnection = socket;
        stream();
        socket.on("connection", () => console.log("Client connected"));
        socket.on("disconnect", () => console.log("Client disconnected"));
    });

    /**
     * Emits data from stream.
     * @param {String} msg 
     */
    const sendMessage = (msg) => {
        if (msg.text.includes('RT')) {
            return;
        }
        socketConnection.emit("tweets", msg);
    }


};
