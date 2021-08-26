# GOOGLES APP ENGINE
App Engine is a fully managed, serverless platform for developing and hosting web applications at scale. You can choose from several popular languages, libraries, and frameworks to develop your apps, then let App Engine take care of provisioning servers and scaling your app instances based on demand.

# Google App Engine
Google App Engine [60] is a platform for developing and hosting web applications in Google-managed data centers. Rather than segregating each customer's data onto a single machine or set of machines, Google Apps data from all Google customers are distributed amongst a shared infrastructure composed of Google's many homogeneous machines and located across Google's many data centers. Google Apps uses a distributed file system designed to store large amounts of data across large numbers of cloud servers. Structured data are then stored in a large distributed database. Data are chunked and replicated over multiple systems, such that no one system is a single point of failure. To avoid a single point of failure, data is always chunked and replications are stored over multiple systems. To make the chunks not readable to a human, data chunks are coded and stored with random file names. To provide controls at various levels of data storage, access, and transmission, a multi-layered security strategy is adopted in Google App [63]. For example, Google provides service-to-service authentication based on X.509 certificates issued by Google's internal certificate authority. For deleted data, all the pointers to the data are deleted to make sure that the requested item is deleted from all the active servers. Google App also provides several additional security options that can be utilized by a customer's domain administrators. The security options include single sign-on, administrator-based single sign-out, policy-enforced secure mail transfer, secure browser connections, etc.

# Enable Cloud APIs
From Cloud Shell, enable the Cloud APIs for the components that will be used:


gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  cloudresourcemanager.googleapis.com \
  datastore.googleapis.com \
  gsuiteaddons.googleapis.com
This operation may take a few moments to complete.

Once completed, a success message similar to this one appears:


Operation "operations/acf.cc11852d-40af-47ad-9d59-477a12847c9e" finished successfully.
Create a datastore instance
Next, enable App Engine and create a Datastore database. Enabling App Engine is a prerequisite to use Datastore, but we won't use App Engine for anything else.


gcloud app create --region=us-central
gcloud datastore databases create --region=us-central
Create an OAuth consent screen
The add-on requires user permission to run and take action on their data. Configure the project's consent screen to enable this. For the codelab, you'll configure the consent screen as an internal application, meaning it's not for public distribution, to get started.

Open the Google Cloud Console in a new tab or window.
Next to "Google Cloud Console," click the Down arrow drop down arrow and select your project.
At the top-left corner, click Menu menu icon.
Click APIs & Services > Credentials. The credential page for your project appears.
Click OAuth consent screen. The "OAuth consent screen" screen appears.
Under "User Type," select Internal. If using an @gmail.com account, select External.
Click Create. An "Edit app registration" page appears.
Fill out the form:
In App name, enter "Todo Add-on".
In User support email, enter your personal email address.
Under Developer contact information, enter your personal email address.
Click Save and Continue. A Scopes form appears.
From the Scopes form, click Save and Continue. A summary appears.
Click Back to Dashboard.

# Proxy server
From Wikipedia, the free encyclopedia
Jump to navigationJump to search
For Wikipedia's policy on editing from open proxies, please see Wikipedia:Open proxies. For other uses, see Proxy.
Two computers connected via a proxy server. The first computer says to the proxy server: "ask the second computer what the time is".
Communication between two computers (shown in grey) connected through a third computer (shown in red) which acts as a proxy server. Bob does not know to whom the information is going, which is the reason that proxies can be used to protect privacy.
In computer networking, a proxy server is a server application that acts as an intermediary between a client requesting a resource and the server providing that resource.[1]

Instead of connecting directly to a server that can fulfill a requested resource, such as a file or web page, the client directs the request to the proxy server, which evaluates the request and performs the required network transactions. This serves as a method to simplify or control the complexity of the request, or provide additional benefits such as load balancing, privacy, or security. Proxies were devised to add structure and encapsulation to distributed systems.[2] A proxy server thus functions on behalf of the client when requesting service, potentially masking the true origin of the request to the resource server.

4. Create the initial add-on
Initialize the project
To begin, you'll create a simple "Hello world" add-on and deploy it. Add-ons are web services that respond to https requests and respond with a JSON payload that describes the UI and actions to take. In this add-on, you'll use Node.js and the Express framework.

To create this template project, use Cloud Shell to create a new directory named todo-add-on and navigate to it:


mkdir ~/todo-add-on
cd ~/todo-add-on
You'll do all the work for the codelab in this directory.

Initialize the Node.js project:


npm init
NPM asks several questions about the project configuration, such as name and version. For each question, press ENTER to accept the default values. The default entry point is a file named index.js, which we'll create next.

Next, install the Express web framework:


npm install --save express express-async-handler
Create the add-on backend
Time to start creating the app. Create a file named index.js with the following content:


const express = require('express');
const asyncHandler = require('express-async-handler');

// Create and configure the app
const app = express();

// Trust GCPs front end to for hostname/port forwarding
app.set("trust proxy", true);
app.use(express.json());

// Initial route for the add-on
app.post("/", asyncHandler(async (req, res) => {
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

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
The server doesn't do much other than show the ‘Hello world' message and that's OK. You'll add more functionality later.

Deploy to Cloud Run
To deploy on Cloud Run, the app needs to be containerized.

Create the container
Create a Dockerfile named Dockerfile containing:


FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
# If you add a package-lock.json, speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN npm install --only=production

# Copy local code to the container image.
COPY . ./

# Run the web service on container startup.
CMD [ "node", "index.js" ]
Keep unwanted files out of the container
To help keep the container light, create a .dockerignore file containing:


Dockerfile
.dockerignore
node_modules
npm-debug.log
Enable Cloud Build
In this codelab you'll build and deploy the add-on several times as new functionality is added. Instead of running separate commands to build the container, push it to the container registery, and deploy it to Cloud Build, use Cloud Build to orchestrate the procedure. Create a cloudbuild.yaml file with instructions on how to build and deploy the application:


steps:
 # Build the container image
 - name: 'gcr.io/cloud-builders/docker'
   args: ['build', '-t', 'gcr.io/$PROJECT_ID/$_SERVICE_NAME', '.']
 # Push the container image to Container Registry
 - name: 'gcr.io/cloud-builders/docker'
   args: ['push', 'gcr.io/$PROJECT_ID/$_SERVICE_NAME']
 # Deploy container image to Cloud Run
 - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
   entrypoint: gcloud
   args:
   - 'run'
   - 'deploy'
   - '$_SERVICE_NAME'
   - '--image'
   - 'gcr.io/$PROJECT_ID/$_SERVICE_NAME'
   - '--region'
   - '$_REGION'
   - '--platform'
   - 'managed'
images:
 - 'gcr.io/$PROJECT_ID/$_SERVICE_NAME'
substitutions:
   _SERVICE_NAME: todo-add-on
   _REGION: us-central1
Run the following commands to grant Cloud Build permission to deploy the app:


PROJECT_ID=$(gcloud config list --format='value(core.project)')
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
    --role=roles/run.admin
gcloud iam service-accounts add-iam-policy-binding \
    $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
    --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
    --role=roles/iam.serviceAccountUser
Build and deploy the add-on backend
To start the build, in Cloud Shell, run:


gcloud builds submit
The full build and deploy may take a few minutes to complete, particularly the first time around.

Once the build completes, verify the service is deployed and find the URL. Run the command:


gcloud run services list --platform managed
Copy this URL, you'll need it for the next step – telling Google Workspace how to invoke the add-on.

Register the add-on
Now that the server is up and running, describe the add-on so Google Workspace knows how to display and invoke it.

Create a deployment descriptor
Create the file deployment.json with the following content. Make sure to use the URL of the deployed app in place of the URL placeholder.


{
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.addons.execute",
    "https://www.googleapis.com/auth/calendar.addons.execute"
  ],
  "addOns": {
    "common": {
      "name": "Todo Codelab",
      "logoUrl": "https://raw.githubusercontent.com/webdog/octicons-png/main/black/check.png",
      "homepageTrigger": {
        "runFunction": "URL"
      }
    },
    "gmail": {},
    "drive": {},
    "calendar": {},
    "docs": {},
    "sheets": {},
    "slides": {}
  }
}
Upload the deployment descriptor by running the command:


gcloud workspace-add-ons deployments create todo-add-on --deployment-file=deployment.json
Authorize access to the add-on backend
The add-ons framework also needs permission to call the service. Run the following commands to update the IAM policy for Cloud Run to allow Google Workspace to invoke the add-on:


SERVICE_ACCOUNT_EMAIL=$(gcloud workspace-add-ons get-authorization --format="value(serviceAccountEmail)")
gcloud run services add-iam-policy-binding todo-add-on --platform managed --region us-central1 --role roles/run.invoker --member "serviceAccount:$SERVICE_ACCOUNT_EMAIL"
Install the add-on for testing
To install the add-on in development mode for your account, in Cloud Shell, run:


gcloud workspace-add-ons deployments install todo-add-on
Open (Gmail)[https://mail.google.com/] in a new tab or window. On the right-hand side, find the add-on with a checkmark icon.

Installed add-on icon

To open the add-on, click the checkmark icon. A prompt to authorize the add-on appears.

Authorization prompt

Click Authorize Access and follow the authorization flow instructions in the popup. Once complete, the add-on automatically reloads and displays the ‘Hello world!' message.

Congratulations! You now have a simple add-on deployed and installed. Time to turn it into a task list application!