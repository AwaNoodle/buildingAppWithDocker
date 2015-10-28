# buildingAppWithDocker

A set of exercises to build a simple Docker application

## What You'll Need

- [Vagrant](https://www.vagrantup.com/downloads.html)
	- Vagrant requires an SSH client. Try [cmder (Windows)](http://cmder.net/) or installing [msysgit (Windows)](https://git-for-windows.github.io/) if you don't have on installed
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- Some knowledge on using Vim or a text editor which will let you alter line endings, such as Sublime

## The Demo Environment

Make sure you've installed Vagrant and VirtualBox and then, from the a command line at the project folder, run:

```bash
> vagrant up
```

Test that the machine is running and that you can access it via:

```bash
> vagrant ssh -c "docker --version"
```

The demo environment installs Docker and the Docker Registry.

## Exercises

For all exercises, you will need to remote into the virtual machine created by Vagrant. You can do this easily with

```
> vagrant ssh
```

### Exercise 1 - Adding Static Data using an Existing Image

A simple usage we might have for Docker is to provide some static content all bundled up which a mechanism for displaying it.

For this exercise, we are going to use the **Kitematic/hello-world-nginx** container to serve up some static content that we supply. What we will do is pull in the **hello-world-nginx** image as a base and then override the files that it was originally serving and supply our own. It's useful to know what the base image is doing so the Dockerfile that produced the **Kitematic/hello-world-nginx** image is supplied in (exercises/exercise1/reference/dockerfile). In this file, we can see that the image exposes a mount point at **/website_files** and can make an assumption that this is the location nginx is service files from:

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

Now we need a Dockerfile to tell Docker what base we are going to use and that we want to add in our files. Create a new file called **Dockerfile** (no extension) and place it in the root of the project. Add the following content:

```
FROM kitematic/hello-world-nginx

ADD ./content/index.html /website_files/index.html
```

And that's all we need. So what is Docker going to do here?

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

![Exercise 1 Demo](/exercises/exercise1/demoA.gif)

Once the build has completed, we can look in the images list, and see our new image (and it's base image):

```bash
> docker images
REPOSITORY                    TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
mynginx				                latest              1da448d0e9de        1 hour ago         	8.4 MB
kitematic/hello-world-nginx   latest              fa9a3bb406d3        4 months ago        7.913 MB
```

We can now start up our container:

```bash
> docker run -d -p 9123:80 --name testingChanges mynginx
mynginx
```

From the host machine, navigate to (http://localhost:9123) and you should see your new site.

![Exercise 1 Demo](/exercises/exercise1/demoB.gif)

### Exercise 2 - Creating a API with Node.JS and Docker

For this exercise we are going to create a new application and host it in a container. We will use Node.JS and Express.JS to create a simple API.

Normally, we would need to have provisioned a machine with Node to be able to run the application. We could do a similar process with Docker by taking a Linux base, like Busybox, an adding Node and then our application. More likely, we will choose one of the pre-built Node images and avoid the extra work. This would be similar to our previous example where we used the nginx base and added our files via Dockerfile.

However, we have an opportunity to reduce our workload further and use an **on-build** image. **On-build** images are base images that are set to perform an action only when they are built as part of another Dockerfile. This means we could create a base with a common functionality and then fill in the gaps later when we produce a new image. Since we're not really interested in sorting out installing and running Node, just interested in he files that make up the application, we are going to make use of one of this images.

We still need a Dockerfile to specify the base image that we want to build. Create a new folder and Dockerfile for the project:

```bash
> cd ~
> mkdir project2
> touch project2/Dockerfile
```

Note: we are using the **~** folder for this example because Node will try to alter the file permissions later on. This does not work so well on /vagrant as it's really a Windows folder.

The image we are going to use is the **Node onbuild official** so we need to add this as the base. We also need to add the port our application listens on. Firstly, open the new Dockerfile in your editor and add:

```
FROM node:onbuild
EXPOSE 7788
```

We now need to layout our application. If we look in the node:onbuild ([Dockerfile](https://github.com/nodejs/docker-node/blob/04df8682a438b0ced8f530ab562f5197595e0cbb/4.2/onbuild/Dockerfile)) we can see that it's expecting our application to have a **project.json** file next to the Dockerfile. This file, like a .csproj, lists information like version, name, dependencies, and scripts to execute. Thankfully, most of this is managed for us using Node Package Manager (NPM). On the VM:

```bash
> cd ~/project2
> npm init
```

You will be asked some details about your project. You can press enter for all of the questions to produce a default **project.json**.

To make it easier to develop our API, we can use Express.js to give us a mechanism to declare routes and handle calls into them. We will need to include some packages to do this and we do this via NPM. On the command line:

```bash
> npm install express --save
```

![Exercise 2 Demo A](/exercises/exercise2/demoA.gif)

**ADD AN APPLICATION GUIDE HERE!**

The base image is going to try starting our app using **npm** which requires that We modify **packages.json**. The important part is the **scripts** field as it will contain the script that will be used to start the app. Open the files and update it to:

```json
"scripts": {
	"start": "node app.js"
},
```

We can test everything is working by starting our application:

```bash
> cd ~/project2
> npm start
```

You can now navigate to (http://localhost:7788) and see the app running. Close the app with **ctrl-c**.

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
> docker run -d -rm -p 7788:7788 --name testingNode mynodeapp
```

Once again, you can now navigate to (http://localhost:7788) and see the app running. When you're finished, stop the container. It will clear itself up because we added the **-rm** switch to remove on exit:

```bash
> docker stop testingNode
```

### Exercise 3 - Registering our Container

### Exercise 4 - Updates and Versioning
