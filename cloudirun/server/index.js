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

//   PROJECT_ID=$(gcloud config list --format='value(core.project)')
// PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
// gcloud projects add-iam-policy-binding $PROJECT_ID \
//     --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
//     --role=roles/run.admin
// gcloud iam service-accounts add-iam-policy-binding \
//     $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
//     --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
//     --role=roles/iam.serviceAccountUser