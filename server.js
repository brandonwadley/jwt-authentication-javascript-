const express = require('express');
const app = express();
const server = require('http').createServer(app);
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
require("dotenv").config();

PORT = process.env.PORT || 3000;
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/api/', require('./routers/routes'));

app.get('*', (req, res) => {
    res.status(404).json({'404': 'Page Not Found'});
});  

server.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = server;