# buildingAppWithDocker

A set of exercises to build a simple Docker application

## What You'll Need

- [Vagrant](https://www.vagrantup.com/downloads.html)
	- Vagrant requires an SSH client. Try [cmder (Windows)](http://cmder.net/) or installing [msysgit (Windows)](https://git-for-windows.github.io/) if you don't have one installed
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- Some knowledge on using Vi or a text editor which will let you alter line endings, such as [Sublime](https://www.sublimetext.com/)
- A tool like [Postman](https://www.getpostman.com/) will be really handy

## The Demo Environment

The demo environment installs Docker, the Docker Registry, some base Docker images we will be using, and NodeJS. To use the environment, make sure you've installed Vagrant and VirtualBox and then, from a command line at the project folder, run:

```bash
> vagrant up
```

Test that the machine is running and that you can access it via:

```bash
> vagrant ssh -c "docker --version"
```

You should see the current Docker version displayed.

## Exercises

For all exercises, you will need to remote into the virtual machine created by Vagrant. You can do this easily with

```
> vagrant ssh
```

You can exit back out by typing **exit** at the console.

### Exercise 1 - Adding Static Data using an Existing Image

A simple usage we might have for Docker is to provide some static content all bundled up with a mechanism for displaying it.

For this exercise, we are going to use the **Kitematic/hello-world-nginx** container to serve up some static content that we supply. What we will do is pull in the **hello-world-nginx** image as a base, override the files that it was originally serving, and supply our own. It's useful to know what the base image is doing so the Dockerfile that produced the **Kitematic/hello-world-nginx** image is supplied in (exercises/exercise1/reference/dockerfile). In this file, we can see that the image exposes a mount point at **/website_files** and can make an assumption that this is the location nginx is serving files from:

```
VOLUME ["/website_files"]
```

We are going to place our own content in this location. Firstly create a new folder for your project. Inside, create a **content** folder and add a **index.html** file:

```bash
> cd /vagrant
> mkdir -p project1/content
> touch project1/content/index.html
```

You will be able to see the project folder on your host or your VM. Open **index.html** in an editor. Lets modify **index.html** so that it shows something simple:

```html
<body>
  <h1>It's not much but it is ours</h1>
</body>
```

Now we need a Dockerfile to tell Docker which base we are going to use and that we want to add in our files. Create a new file called **Dockerfile** (no extension) and place it in the root of the project. Add the following content:

```
FROM kitematic/hello-world-nginx

ADD ./content/index.html /website_files/index.html
```

That's all we need. So what is Docker going to do here?

The **FROM** keyword instructs Docker to locate the image specified, and use it as a base. Anything we do further will be added on top of this image. We dont need to pull the image down ourselves; Docker will handle that when we build the image.

The **ADD** keyword is telling Docker to bring in files at the specified location and add a layer to our image with these files. The layer added will roughly be the size of the files added. As it is a layer, and layers are immutable, these files will always be part of the full image. Even if we were to delete the files in a subsequent command, the layer and therefor the files would still be brought down and included, you just would be able to access them from layers after they were deleted. The Dockerfile can be viewed as creating a series of states which we view at the end as the culmination of all of the changes.

You can learn about more Docker's keywords [here](https://docs.docker.com/reference/builder/).

Now we've created the Dockerfile we need to build it and then use it. Inside of your VM, move you the folder containing the exercise. We then need to tell Docker to build the image:

```bash
> cd /vagrant/project1
> docker build -t mynginx .
```

We've told Docker to:
- **build** : Tells Docker that it needs to build the supplied Dockerfile
- **-t mynginx** : Tells Docker to tag the resulting image, in this case with mynginx. This is the name we will use to start the image
- **.** : The path to look at for the Dockerfile to build

![Exercise 1 Demo A](/exercises/exercise1/demoA.gif)

Once the build has completed, we can look in the images list and see our new image (and it's base image):

```bash
> docker images
REPOSITORY                    TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
mynginx                       latest              1da448d0e9de        1 hour ago          8.4 MB
kitematic/hello-world-nginx   latest              fa9a3bb406d3        4 months ago        7.913 MB
```

Let's start up our container:

```bash
> docker run -d -p 9123:80 --name testingChanges mynginx
```

From the host machine, navigate to (http://localhost:9123) and you should see your new site.

![Exercise 1 Demo B](/exercises/exercise1/demoB.gif)

### Exercise 2 - Creating a API with Node.JS and Docker

For this exercise we are going to create a new application and host it in a container. We will use Node.JS and Express.JS to create a simple API.

Normally, we would need to have provisioned a machine with Node to be able to run the application. We could do a similar process with Docker by taking a Linux base, like Busybox, an adding Node and then our application. Easier still, we will choose one of the pre-built Node images and avoid the extra work. This would be similar to our previous example where we used the nginx base and added our files via Dockerfile.

However, we have an opportunity to reduce our workload further and use an **on-build** image. **On-build** images are base images that are set to perform an action only when they are built as part of another Dockerfile. This means we could create a base with a common functionality and then fill in the gaps later when we produce a new image. Since we're not really interested in sorting out installing and running Node, just interested in he files that make up the application, we are going to make use of one of these images.

**Note**: If you get stuck or want a reference, the example application files are in **exercises/exercise2/example**.

### Setting Up

We still need a Dockerfile to specify the base image that we want to build. Create a new folder and Dockerfile for the project:

```bash
> cd ~
> mkdir project2
> touch project2/Dockerfile
```

Note: we are using the **~** folder for this example because Node will try to alter the file permissions later on. This does not work so well on /vagrant if you're on Windows.

The image we are going to use is the **Node onbuild official** so we need to add this as the base. We also need to add the port our application listens on. Firstly, open the new Dockerfile in your editor and add:

```
FROM node:onbuild
EXPOSE 7788
```

We now need to create our application. If we look in the node:onbuild ([Dockerfile](https://github.com/nodejs/docker-node/blob/04df8682a438b0ced8f530ab562f5197595e0cbb/4.2/onbuild/Dockerfile)) we can see that it's expecting our application to have a **project.json** file next to the Dockerfile. This file, like a .csproj, lists information like version, name, dependencies, and scripts to execute. Thankfully, most of this is managed for us using Node Package Manager (NPM):

```bash
> cd ~/project2
> npm init
```

You will be asked some details about your project. You can press enter for all of the questions to produce a default **package.json**.

To make it easier to develop our API, we can use Express.js to give us a mechanism to declare routes and handle calls into them. We will need to include some packages to do this which we do via NPM. On the command line:

```bash
> npm install express --save
```

The command is telling NPM to bring down the Express.JS package, it's dependencies (if any), and save them locally to the project. You can look in the **node_modules** folder  thats just appeared in your project to see what's been installed. This is really useful to keep all of our modules next to our app rather than install somewhere on our machine.

![Exercise 2 Demo A](/exercises/exercise2/demoA.gif)

## Creating the App

We're going to define a controller to handle calls into our API. Create a new folder called **controllers** and add a file in it called **whereIsController.js**. Edit the file to show:

```bash
> cd ~/project2
> mkdir controllers
> touch controllers/whereIsController.js
```

```js
var whereIsController = function() {
  var get = function(req, res) {
    if(req.params.person.toUpperCase() == 'LUKE') {
      res.status(404).send("No sign of Luke. Have you tried his desk?");
    } else {
      res.status(302).send();
    }
  };

  return {
    get: get
  }
}

module.exports = whereIsController;
```

The controller is pretty simple. We are creating a function that will return an object containing a **get** function. The **get** is checking for a parameter, **person**, and providing a response based on the value. To get the value, we need to define a route.

From the root of your project, create a new folder called **routes** and add a file called **whereIsRoutes.js**. Add the following to the file:

```bash
> cd ~/project2
> mkdir routes
> touch routes/whereIsRoutes.js
```

```js
var express = require('express');

var routes = function() {
  var whereIsController = require('../controllers/whereIsController.js')();
  var whereIsRouter = express.Router();
  whereIsRouter.route('/:person')
    .get(whereIsController.get);

  return whereIsRouter;
};

module.exports = routes;
```

The route is also creating a function which is returning the definition of a Express.js route. We've set the route for **/:person** which defines that we are expecting the last part of the URI to be the person name. **:person** will be available to the handler as the **person** parameter. We've told the route that we want the **get** to be handled by our controller. Notice that we've not defined a whole route, just a part of it. We'll let our main app decide where it wants to use us.

Lastly, lets define the entry point for our application. Create a file called **app.js** and place it next to **package.json**. Edit the file so that it reads:

```bash
> cd ~/project2
> touch app.js
```

```js
var express = require('express');
var app = express();

var whereIsRoute = require('./routes/whereIsRoutes.js')();
app.use('/api/whereis', whereIsRoute);

app.get('/', function(req, res){
  res.send('Welcome to my API');
})

var port = 7788;
app.listen(port, function() {
  console.log('Running API on port ' + port)
});

module.exports = app;
```

App.js sets up our base URI at **/api/whereis** and attaches the route handler we created to it. This will give us a handler for **/api/whereis/someNameHere**. We've also added a handler on **/** mostly as a quick sanity check that the app is up and running. We've also told Express.js to listen to port 7788. That's all there is to it.

The base Docker image is going to try starting our app using the **npm** command. NPM lets you define scripts to perform actions such as testing and running. We need to update our **package.json** to define what action we want when the **start** script is run. Open the **package.json** file and update it to:

```json
"scripts": {
	"start": "node app.js"
},
```

Using our test environment, we can test the application before we create the container:

```bash
> cd ~/project2
> npm install
> npm start
```

You can now navigate to (http://localhost:7788) and see the app running with our base message. You can use a tool like Postman or cURL to navigate to our API and check that it is working. Try navigating to (http://localhost:7788/api/whereis/tim) and (http://localhost:7788/api/whereis/luke) and check the response codes.

![Exercise 2 Demo B](/exercises/exercise2/demoB.gif)

Close the app with **ctrl-c** when you've finished testing.

## Dockerizing the App

Getting the application into a container is now simple:

```bash
> cd ~/project2
> docker build -t mynodeapp .
```

Once it's built you should be able to see the new image:

```bash
> docker images
```

Now we run it as any other container:

```bash
> docker run -d -p 7788:7788 --name testingNode mynodeapp
```

Once again, you can now navigate to (http://localhost:7788) and see the app running. 

![Exercise 2 Demo C](/exercises/exercise2/demoC.gif)

When you're finished, stop and remove the container:

```bash
> docker stop testingNode
> docker rm testingNode
```

### Exercise 3 - Container Naming and Versioning

If we are going to produce more than a single container, we will need to think about how to version them. Docker lets us tag images with strings to advertise the container name and versions. We've been doing this already via the **-t** operator when we've been building. If we left this out, our image would be a user-unfirendly UUID. So the tag is essentially a string pointer to a UUID of our image. As it's just a pointer, we can also have multiple tags on a single image:

```bash
> docker tag Kitematic/hello-world-nginx newnginx
> docker tag Kitematic/hello-world-nginx othernginx
> docker images
REPOSITORY                    TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
kitematic/hello-world-nginx   latest              fa9a3bb406d3        4 months ago        7.909 MB
newnginx                      latest              fa9a3bb406d3        4 months ago        7.909 MB
othernginx                    latest              fa9a3bb406d3        4 months ago        7.909 MB
```

You will see the new entries in the images list. You can also see is that the UUID for the image is the same for all of the entries.

![Exercise 3 demo A](/exercises/exercise3/demoA.gif)

Things aren't quite as simple as they seem however. The way we tag the image actually composes between one and four parts: the registry location (optional), the user account (optional), the registry name, and the version tag (optional):

```
[<registry location>/][<author name>/]<image name>:<version tag>
```

- **Registry** is the location of the registry to store the image. The field is optional and by default it will be omitted and the registry will be set to Docker Hub (unless you have set an alternative default via Docker). It can also be the location of another registry (i.e. localhost:5000).
- **Username** is the name of the account in the registry to store the image under. Commonly this will be the same as an account you are using on the registry you are using. The field is optional.
- **Name** is the container name
- **Tag** is the version information. If this isn't specified then it will be 'latest'

So:
- **mark/nginx:0.0.2** would represent a container on Docker Hub that is authored by the account **mark**, is for the **nginx** container, and is for version **0.0.2**
- **localhost:5000/nginx** would represent a container in a registry at **localhost:5000**, called **nginx**, and is for version **latest**

Docker operates a somewhat open approach to versioning. Legitimate version tags could be:

- 0.0.1
- v0.0.1
- JumpingJaguar
- jhlkjhjgi7t673w

This means you have quite a lot of freedom to use which ever scheme you prefer to version your images. Generally it's easier to follow [SemVer](http://www.semver.org) but since you can have more than one tag per image, you can be creative. For example, the **node** container we have been using is tagged **onbuild** which refers to the latest on-build version of the image, not always the latest overall image. It could be version 2.0, 2.1, or 55.1 under the hood but you have an easy reference point to go and get the latest version of the **onbuild** versions. This is similar to the **latest** tag where it essentially floats to the latest uploaded version that either specifies latest or doesn't specify a tag. You do need to put some thought into how you are going to use these tags as not considering what happens with **latest** etc may have bad consequences for your consumers when they get unexpected versions.

If you're consuming a container and you don't want to risk changes between pulls, it's best to fix the version of an image that you want. You would do this in your Dockerfile:

```
FROM node:4.2.2-onbuild
```

The registry you're pulling the image from should list the tags you can pull from.

### Exercise 4 - Registering our Container

To make use of our container we need to have a way of moving it off our box. We could ask users to clone the application repository and build the container on their machine but that risks introducing change and adds a few irritating steps for the user. Our alternative is to use a Docker Registry to store the image and let use retrieve it when we need it. We've already been using a registry in the form of the **Docker Hub**, Docker's online Registry that stores all of the containers we've been pulling down.

There is a good chance we don't want to use a public Registry if we're working on private projects We could pay for private storage of course, and there is a lot of benefit to this. It may not fall under your security policy, however. For this, we can use Docker's Registry container and run a version locally. This has already been installed on the VM and should be listening on port 5000. Lets have a look:

```bash
> docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED            STATUS			PORTS                   NAMES
b77b86b52c35        registry:2.1.1      "/bin/registry /etc/d"   6 days ago         Up 6 days	  0.0.0.0:5000->5000/tcp  registry
```

We can see the Registry respond if we navigate to (http://localhost:5000) on our host machine (we're exposing the port via Vagrant). As we covered in **exercise 3**, this gives us a registry name of **localhost:5000**.

We are going to use the container that we made during exercise 2 (so, if you deleted it, you need to go back a step.) and add it into our registry. At present, the container is in our local images list (and can be seen via **docker images**) and should be called **mynodeapp**. The first thing we will do is tag it so it's associated with our local registry:

```bash
> docker tag mynodeapp localhost:5000/mynodeapp
```
This will create the **latet** tag for the image. We should also add a version number:

```bash
> docker tag mynodeapp localhost:5000/mynodeapp:0.0.1
```

We only then need to tell Docker to push the images. We need to push both tags but as they point to the same image we are only uploading the image once. We have already indicated where the image is going (by prepending **localhost:5000**) and we don't need to log in to a service, pushing is as simple as:

```bash
> docker push localhost:5000/mynodeapp
> docker push localhost:5000/mynodeapp:0.0.1
```

To demonstrate the process of using the registry, we need to remove our local copies of the image:

```bash
> docker rmi mynodeapp
> docker rmi localhost:5000/mynodeapp
> docker rmi localhost:5000/mynodeapp:0.0.1
```

**Note:** If Docker complains that the image is in use, check the process list (**docker ps -a**) and then remove the offending container (**docker rm <name of container instance>**) before trying again.

We can then pull the image from the Registry almost the same as we do with any other image:

```bash
> docker run -d -p 7788:7788 --name testingRegistry localhost:5000/mynodeapp
```

Navigating to (http://localhost:7788) will again show you your app. If you look in the local images (**docker images**), you will see your image. If we were to run **localhost:5000/mynodeapp:0.0.1** we would end up with the same result. You can stop and remove your app as normal.

### Exercise 5 - Container Updates

Let's put all of this together an create a new version of our application.

We forgot to add a friendly message to the 302 response in our app. Open up your **whereIsController** and add a message to the 302 response:

```js
res.status(302).send("Found " + req.params.person);
```

Once complete, follow the same build process as in exercise 2. This will result in a new **mynodeapp** image. We now need to tag this image with the new version number, to tag the image as the latest, and then to upload them to our registry:

```bash
> docker build -t mynodeapp .
> docker tag mynodeapp localhost:5000/mynodeapp
> docker push localhost:5000/mynodeapp
> docker tag mynodeapp localhost:5000/mynodeapp:0.0.2
> docker push localhost:5000/mynodeapp:0.0.2
```

Let's clean up our images:

```bash
> docker rmi mynodeapp
> docker rmi localhost:5000/mynodeapp
> docker rmi localhost:5000/mynodeapp:0.0.2
```

...and test out the old and new versions:

```bash
> docker run -d -p 7788:7788 --name testingRegistry_latest localhost:5000/mynodeapp
> docker run -d -p 7789:7788 --name testingRegistry_old localhost:5000/mynodeapp:0.0.1
> docker run -d -p 7790:7788 --name testingRegistry_new localhost:5000/mynodeapp:0.0.2
```

You can make a call to each of the containers to see if it's worked:
- [Current Latest](http://localhost:7788/api/whereis/tim)
- [Old](http://localhost:7789/api/whereis/tim)
- [New](http://localhost:7790/api/whereis/tim)
