const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const api = require('./server/routes/api');
const publicApi = require('./server/routes/publicApi');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'dist/google-one-tap')));

app.use('/api', api);
app.use('/public', publicApi);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/google-one-tap/index.html')));

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`Running on localhost:${port}`));