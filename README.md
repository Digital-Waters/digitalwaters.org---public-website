# digitalwaters.org---public-website
This repo is all about how digitalwaters.org displays data our devices collect and maintains all our public APIs. This is our gateway to the world, where we give the public access to all our work.

As a non-profit, we only exist if others see us as a positive force. We must always be transparent and our data accessible to ensure our data is of the highest quality. This is how we will foster trust. 

We want people to use our data to make important decisions, it's vital that our public websites, APIs, and any other services we offer serve these principles.

# Contribution Guidelines
There are plenty of issues that are open that represent work that needs to be done. You can choose something there to get started or create your own issues. There is nothing too small. If you see any spelling or grammar errors, or no documentation at all, please feel free to create an issues and submit a pull request. All contributions / pull requests will need to be approved by Digital Waters engineering.

Also, feel free to introduce yourself in a comment or in our repo Discussions board! We'd love to connect and collaborate with like-minded people. Don't be a stranger :D

# Our Architecture
Our backend services are currently being hosted by Heroku. We also use Amazon S3 to store our images. 

We are in the process of moving from Heroku to AWS and using AWS for all our backend services, including the automated analysis of our data. 

Our architecture right now is centered on one RESTful API to get a batch of our water data. It is what we use to display our data on our maps and what we make publicly available for anyone else who wants realtime access to our data. 
