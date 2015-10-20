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

### Exercise 1 - Adding Static Data to Existing container

A simple usage we might have for Docker is to provide some static content all bundled up which a mechanism for displaying it.

For this exercise, we are going to use the **Kitematic/hello-world-nginx** container to serve up some static content that we supply. What we will do is pull in the **hello-world-nginx** image as a base and then override the files that it was originally serving and supply our own. It's useful to know what the base image is doing so the Dockerfile that produced the **Kitematic/hello-world-nginx** image is supplied in (exercises/exercise1/reference/dockerfile). In this file, we can see that the image exposes a mount point at **/website_files** and can make an assumption that this is the location nginx is service files from:

'''
VOLUME ["/website_files"]
'''

We are going to place our own content in this location. Inside the **content** folder is an **index.html** file. Lets modify **index.html** so that it shows something simple:

```html
<body>
  <h1>It's not much but it is ours</h1>
</body>
```

Now we need a Dockerfile to tell Docker what base we are going to use and that we want to add in our files. Create a new file called **dockerfile** (no extension) and place it in the root of the **excercise1** (you can do this on your host machine if you prefer). Add the following content:

```
FROM kitematic/hello-world-nginx

ADD ./content/index.html /website_files/index.html
```

And that's all we need. So what is Docker going to do here?

The **FROM** keyword instructs Docker to locate the image specified, and use it as a base. Anything we do further will be added on top of this image. We dont need to pull the image down ourselves; Docker will handle that when we build the image.

The **ADD** keyword is telling Docker to bring in files at the specified location and add a layer to our image with these files. The layer added will roughly be the size of the files added. As it is a layer, and layers are immutable, these files will always be part of the full image. Even if we were to delete the files in a subsequent command, the layer and therefor the files would still be brought down and included, you just would be able to access them from layers after they were deleted. The Dockerfile can be viewed as creating a series of states which we view at the end as the culmination of all of the changes.

You can learn about more Docker's keywords here **ADD LINK!**.

now we've created the Dockerfile we need to build it and then use it. Inside of your VM, move you the folder containing the exercise. We then need to tell Docker to build the image:

```bash
> cd /vagrant/exercises/exercise1
> docker build -t mynginx .
```

We've told Docker to:
- **build** : Tells Docker that it needs to build the supplied dockerfile
- **-t mynginx** : Tells Docker to tag the resulting image, in this case with mynginx. This is the name we will use to start the image
- **.** : The path to look at for the dockerfile to build

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


### Exercise 2 - Creating a API with Node.JS and Docker
