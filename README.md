# PixowlGram

## deploy

To deploy the server you can run the following command:

    yarn start

It use docker-compose to create all the necesary services to get a local environment:

- MySQL:5.6 on port 3306
- S3 Bucket using localstack
- Webserver on http://localhost:5000

Once it finished you can access the route http://localhost:5000/api-docs to get the documentation of this API, and to learn how
to use it.

NOTE: If the endpoint http://localhost:5000/posts return error of ECCONREFUSED, you should wait until the database is ready.
NOTE: If you get an empty array of posts in http://localhost:5000/posts. You should wait until the database seeding finish it works (it takes some seconds)

## Tests

Note: To automate all the tests you will need two dependencies installed in your system:

- awslocal: to create S3 bucket to store the photos in localstack
- mysqladmin: it is used to ping to MySQL and wait until is ready to then run the tests

( In case you don't want to install those dependecies there is an alternative that is explained in the section: "JUST IN CASE YOU DONT WANT TO INSTALL THE DEPENDECIES IN YOUR SYSTEM TO RUN THE TESTS")

The app was tested with some unit testing on the Post model that interact with the database and with the S3 bucket,
in order to verify that all the SQL queries are correct and the photos are upload correctly to the S3 bucket.
You can run those tests using the following command:

    yarn test:unit

It also has been tested in integration to check that the server is fully functional and all the exposed api's work
as expected. Those tests uses docker-compose in order to create all the necessary services (mysql, s3 (localstack), webserver)
and then run the tests against the URL exposed by the webserver. You can run it using the following command:

    yarn test:docker
    yarn test:fresh:docker (is the same as above, but it first build the images from Dockerfile)

### JUST IN CASE YOU DONT WANT TO INSTALL THE DEPENDECIES IN YOUR SYSTEM TO RUN THE TESTS

No worries you can run the tests anyway. But you should do the following:

For the unit tests run the following commands

    docker-compose up -d mysql

And wait until MySQL is ready to receive connections, then run the tests using:

    npx ts-mocha test/unit/*.**.ts -R list --exit

For the integration tests:

    docker-compose up -d

Once the migration and seed of the database are ready you can launch the tests using the following commands

    npx ts-mocha test/integration/*.**.ts -R list

# Explaining the system

PixowlGram was designed using MySQL as a database and S3 as storage service for the photos of the posts.

## Why MySQL?

The first thing is to decide SQL or NoSQL. At first it might seem like a temptation the flexibility on the schema of NoSQL databases, but in my opinion having an schema is a benefit because it takes the burden off from the app to validate the items that are stored in the database and avoid that the database is full of items with random attributes.
The rigidity of MySQL can be overcomed using migrations tools and having defined all the migrations in our source code (for example using knex).

Evaluating the options for NoSQL databases in AWS you have DynamoDB and DocumentDB (implementation of mongodb). I only have experience using DynamoDB but it is very limited the way in you can query your data, so you need to know in advantage all the ways in which you would like to query it to design the indexes properly.

So I declined to MySQL due it allows to query data in a lot of different ways. It defines a clear schema of your data. And the rigidity of the schema can be overcomed using migration tools.

## Why S3?

Is the de facto storage service, so there is not much to say.

## What about authentication?

This implementation assumes that the authentication of the users cames from other layer, and the webserver receive some kind of JWT that has to verify the signature to get the current user information that is making the request. (I have implement a dummy authMiddleware that inject random users in the request object.)

For auth we can use for example Application Load Balancer (ALB) with Cognito.

## What about dbmigrations

The database migrations are implemented using knex and the scripts can be found in the folder db/migrations. This script contains the definition of database schema.
