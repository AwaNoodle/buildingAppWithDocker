# -*- mode: ruby -*-
# vi: set ft=ruby :

$update = <<END
	sudo apt-get Update
	sudo apt-get upgrade -y
END

# Update to the latest Docker
$installLatestDocker = <<END
	 if hash docker 2>/dev/null; then
     echo 'Docker already installed'
   else
     curl -sSL https://get.docker.com/ | sh
	   usermod -aG docker vagrant
   fi
END

$pullDemoContainers = <<END

END

$runRegistry = <<END
    if [[ ! $(docker ps -a --filter='name=registry' -q) ]]
    then
      docker pull registry:2.1.1
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
     # Customize the amount of memory on the VM:
     vb.memory = "1024"
  end

	# nginx
  config.vm.network "forwarded_port", guest: 80, host: 9123

  # Registry
  config.vm.network "forwarded_port", guest: 5000, host: 5000

  config.vm.provision "shell", name: "Update Machine", inline: $update
  config.vm.provision "shell", name: "Install Docker", inline: $installLatestDocker
  #config.vm.provision "shell", name: "Install Demo Containers", inline: $pullDemoContainers
  config.vm.provision "shell", name: "Run Registry", inline: $runRegistry
end
