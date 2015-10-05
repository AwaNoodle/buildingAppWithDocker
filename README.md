# buildingAppWithDocker

A set of exercises to build a simple Docker application

## What You'll Need

- [Vagrant](https://www.vagrantup.com/downloads.html)
	- Vagrant requires an SSH client. Try [cmder (Windows)](http://cmder.net/) or installing [msysgit (Windows)](https://git-for-windows.github.io/) if you don't have on installed
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

## The Demo Environment

Make sure you've installed Vagrant and VirtualBox and then, from the a command line at the project folder, run:

```bash
> vagrant up
```

Test that the machine is running and that you can access it via:

```bash
> vagrant ssh -c "docker --version"
```

