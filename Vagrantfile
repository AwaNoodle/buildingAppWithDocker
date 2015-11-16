# -*- mode: ruby -*-
# vi: set ft=ruby :

$update = <<END
	sudo apt-get update
	sudo apt-get upgrade -y
END

# Update to the latest Docker
$installLatestDocker = <<END
	 if hash docker 2>/dev/null; then
     echo 'Docker already installed'
   else
		 apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
		 echo deb https://apt.dockerproject.org/repo ubuntu-trusty main > /etc/apt/sources.list.d/docker.list
		 apt-get update
		 apt-get purge lxc-docker*
     sudo apt-get install docker-engine -y
	   usermod -aG docker vagrant
   fi
END

$pullDemoItems = <<END
    apt-get install node npm -y
    docker pull Kitematic/hello-world-nginx
    docker pull registry:2.1.1
    docker pull node:onbuild
END

$runRegistry = <<END
    if [[ ! $(docker ps -a --filter='name=registry' -q) ]]
    then
      sudo mkdir -p /opt/registry
      docker run -d -p 5000:5000 -v /opt/registry:/tmp/registry-dev --name registry registry:2.1.1
    else
      echo 'Registry already installed'
    fi
END

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
	config.vm.post_up_message = "Project files will be available at /vagrant on the VM"

  config.vm.provider "virtualbox" do |vb|
     vb.memory = "1024"
  end

	# exercise 1
  config.vm.network "forwarded_port", guest: 9123, host: 9123

	# exercise 2
	config.vm.network "forwarded_port", guest: 7788, host: 7788

  # Exercise 4
  config.vm.network "forwarded_port", guest: 5000, host: 5000

	# Exercise 5
	config.vm.network "forwarded_port", guest: 7788, host: 7789
	config.vm.network "forwarded_port", guest: 7788, host: 7790

  config.vm.provision "shell", name: "Update Machine", inline: $update
  config.vm.provision "shell", name: "Install Docker", inline: $installLatestDocker
  config.vm.provision "shell", name: "Install Demo Items", inline: $pullDemoItems
  config.vm.provision "shell", name: "Run Registry", inline: $runRegistry
end
