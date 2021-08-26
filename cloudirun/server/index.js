const express = require('express');
const asyncHandler = require('express-async-handler');
const PORT = process.env.PORT || 5000
// initial your express app
const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.post('/', asyncHandler(async(req, res, next)=> {
    const card = {
        sections: [{
            widgets: [
                {
                    textParagraph: {
                        text: `Hello world!`
                    }
                },
            ]
        }]
    };
    const renderAction = {
        action: {
            navigations: [{
                pushCard: card
            }]
        }
    };
    res.json(renderAction);
}));
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });