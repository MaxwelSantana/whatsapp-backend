import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: '1277041',
    key: '1ef8341e29de91db578b',
    secret: 'd8805a8ab6fa34a094fe',
    cluster: 'us2',
    useTLS: true,
});

app.use(express.json());
app.use(cors());

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

const db = mongoose.connection;
db.once('open', () => {
    console.log('DB CONNECTED');

    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log('Change', change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name: messageDetails.name,
                message: messageDetails.message,
            });
        } else {
            console.log('Error triggering Pusher');
        }
    });
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
