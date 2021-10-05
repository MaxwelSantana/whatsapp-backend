import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());

const connection_url =
    'mongodb+srv://admin:tFfTxqV3X0na9NR2@cluster0.nach6.mongodb.net/whatsappdb?retryWrites=true&w=majority';
// mongoose.connect(connection_url, {
//     useCreateIndex: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.get('/', (req, res) => {
    res.status(200).send('hello');
});

app.get('/api/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) res.status(500).send(err);
        else res.status(200).send(data);
    });
});

app.post('/api/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if (err) res.status(500);
        else res.status(201).send(data);
    });
});

app.listen(port, () => console.log('listening on port: ' + port));
