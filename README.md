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

For this exercise, we are going to use the **Kitematic/hello-world-nginx** container to serve up some static content that we supply. What we will do is pull in the **hello-world-nginx** image as a base and then override the files that it was originally serving and supply our own. It's useful to know what the base image is doing so the Dockerfile that produced the **Kitematic/hello-world-nginx** image is supplied in (exercises/exercise1/reference/dockerfile). In this file, we can see that the image exposes a mount point at **/website_files** and can make an assumption that this is the location nginx is service files from.

'''
VOLUME ["/website_files"]
'''

We are going to place our 
