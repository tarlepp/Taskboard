VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "precise32"
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"
  config.vm.hostname = "taskboard-dev-box"
  config.vm.network :forwarded_port, guest: 1337, host: 1337
  config.vm.synced_folder ".", "/home/vagrant/Taskboard"
  config.vm.provision :shell, :path => "./vagrant/bootstrap.sh"
end
