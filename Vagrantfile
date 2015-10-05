# -*- mode: ruby -*-
# vi: set ft=ruby :

$update = <<END
	sudo apt-get Update	
	sudo apt-get upgrade -y 
END

# Update to the latest Docker
$installLatestDocker = <<END
	 curl -sSL https://get.docker.com/ | sh
	 usermod -aG docker vagrant 
END

$pullDemoContainers = <<END
END

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  
  config.vm.provider "virtualbox" do |vb|
     # Customize the amount of memory on the VM:
     vb.memory = "1024"
  end

  	config.vm.provision "shell", name: "Update Machine", inline: $update
	config.vm.provision "shell", name: "Install Docker", inline: $installLatestDocker
    config.vm.provision "shell", name: "Install Demo Containers", inline: $pullDemoContainers
end
