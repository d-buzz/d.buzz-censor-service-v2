const functions = require('firebase-functions')
const express = require('express')
const admin = require('firebase-admin')
const cors = require('cors')

admin.initializeApp()
const db = admin.firestore()

const app = express()

// Define the domains you want to allow
const whitelist = [
    'http://localhost:3000',
    'https://d.buzz',
    'https://next.d.buzz',
    'https://staging.d.buzz',
    'https://lite.d.buzz'
]

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

// Use CORS middleware with the options
app.use(cors({origin: true}))


app.post('/add', async (req, res) => {
		const types = [
			{ id: 1, name: 'Pornography' },
			{ id: 2, name: 'Phishing' },
			{ id: 3, name: 'Scam' }
		]
    try {
        const { author, permlink, type } = req.body
        const newEntry = {
            author,
            permlink,
            type_id: type,
            created_at: admin.firestore.Timestamp.now(),
            updated_at: admin.firestore.Timestamp.now(),
						type: types.find((t) => t.id === type)?.name,
        }
        await db.collection('censoredPosts').add(newEntry)
        res.status(200).send('Added successfully.')
    } catch (error) {
        res.status(500).send(error.message)
    }
})

app.get('/types', (req, res) => {
    // Types based on your previous message
    const types = [
        { id: 1, name: 'Pornography' },
        { id: 2, name: 'Phishing' },
        { id: 3, name: 'Scam' }
    ]
    res.status(200).json(types)
})

app.get('/list', async (req, res) => {
    try {
        const snapshot = await db.collection('censoredPosts').get()
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
						author: doc.data()?.author,
						permlink: doc.data()?.permlink,
            type_id: doc.data()?.type_id,
            created_at: doc.data()?.created_at?.toDate()?.toISOString(),
            updated_at: doc.data()?.updated_at?.toDate()?.toISOString(),
						type: doc.data()?.type,
        }))
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

exports.censorAPI = functions.https.onRequest(app)