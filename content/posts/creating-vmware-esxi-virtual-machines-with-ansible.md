---
title: "Creating VMWare ESXi wirtual machines with Ansible"
date: 2020-09-03T10:02:19+02:00
draft: false
---

![](/images/creating-vmware-esxi-virtual-machines-with-ansible/DSC_2910.jpg)

Clicking the same buttons over and over again can be a little.. exhausting(?). It often feels like you can do something much more useful with your time. Well, using Ansible combined with a VM Template, you can easily automate the creation of a VM. For example; I recently used this in a project where I had to create 3 Ubuntu 20.04 VMs to host a load balanced site.

<!-- more -->

---

## Creating the template

This is something you'd probably customize to your own liking, but I'll show you how I did it. I'll be using Ubuntu 20.04 LTS for the template, but depending on what OS you want the VM to run there are different ways you have to prepare the template. 

### Preparing the template VM

In Windows there's a tool called [sysprep](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/sysprep--generalize--a-windows-installation) which generalizes your Windows installation. This means it gets rid of all the unique ID's (such as the SID) and gets the installation ready for cloning. This can be easily done by running the tool and checking the necessary boxes. In Linux there isn't a built-in tool you can use to prepare the machine. In order to do this I used a script I found on [github](https://github.com/philipsaad/linux-virt-sysprep/blob/master/prepare-ubuntu-18.04-template.sh). I execute this script before cloning the machine to a template. 

### Clone VM to template

This part is probably one of the easiest steps in the process of automating the creation of VM's. Creating a template based upon an VM is as easy as right-clicking the VM you want to clone and selecting Clone -> Clone to Template.. After that you just need to fill in some information about the template.

## Installing Ansible

Creating the VMs is done using Ansible. This is a piece of software from Red Hat. It's used for software provisioning, [Infrastructure as Code](https://en.wikipedia.org/wiki/Infrastructure_as_code) and configuration management. In this case we'll be using its Infrastructure as Code features. 

First, we need to install Ansible. I'm using Ubuntu 20.04 LTS as host for Ansible, but if you're using a different OS you can always look at the [documentation](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) for the right instructions. But before we can install Ansible, we need to add Ansible's repository. We can do this by executing the following commands.

```BASH
sudo apt install sotware-properties-common
sudo apt-add-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```

### But did the installation work?

To test if the installation was successful, we can execute the following command. It should give (more or less) the same output.

```BASH
vincent@ansible-machine:~$ ansible --version
ansible 2.9.11
  config file = None
  configured module search path = ['/home/vincent/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/local/lib/python3.8/dist-packages/ansible
  executable location = /usr/local/bin/ansible
  python version = 3.8.2 (default, Jul 16 2020, 14:00:26) [GCC 9.3.0]
```

The tool that we're actually going to be using 'ansible-playbook' is part of the ansible package so it should be installed too. If you're not sure or you're just as paranoid as I am you can always check it using the following command.

```BASH
vincent@ansible-machine:~$ ansible-playbook --version
ansible-playbook 2.9.11
  config file = None
  configured module search path = ['/home/vincent/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/local/lib/python3.8/dist-packages/ansible
  executable location = /usr/local/bin/ansible-playbook
  python version = 3.8.2 (default, Jul 16 2020, 14:00:26) [GCC 9.3.0]
```

## Combining the vSphere ESXi and Ansible

When you've gotten this far into this little tutorial you've created a template of a virtual machine and installed Ansible on a host. So far so good. Now we have two separate things that we want to get to communicating. Luckily for us, getting two these two to talk with each other isn't rocket science. We will have to write a playbook, you can compare this to a list of tasks that get executed. In this playbook we'll be using the [vmware_guest](https://docs.ansible.com/ansible/latest/modules/vmware_guest_module.html) module, this will connect to the ESXi host/vCenter server and do what we tell it to do. 

First of all, we need to define the task that connects to the ESXi host/vCenter server. In the example below you have to replace the host_ip, host_user and host_pass with the correct information (ESXi/vCenter IP, username and password). I've added the 'valdiate_certs: False' line because I didn't want to bother about installing the certificates of my own vCenter on the Ansible host. If you do want to validate the certificates, you'll have to [install the certificates](https://askubuntu.com/questions/73287/how-do-i-install-a-root-certificate).

```YAML
- name: Create VM based on Template
  vmware_guest:
    hostname: "host_ip"
    username: "host_user"
    password: "host_pass"
    validate_certs: False
```

Now that we have connection to the our ESXi/vCenter it's time to create the VM we can create the VM itself. This is done by defining a name and the template where you want to base the VM upon. You also have to define the datacenter when you're using a vCenter as target host. The folder parameter defines where the VM will be located. This starts with '/datacenter-name/vm/' when you're using vCenter and with '/vm/' when you're just using an ESXi. The cluster option is also only needed when working with a vCenter as target. 

```YAML
    name: WEB-01
    template: AWX-Template
    datacenter: "Lab"
    folder: /Lab/vm/
    state: poweredon
    cluster: "esx-host-1" 			# Only when using vCenter
```

So, we've got a task that just creates a VM, it's time to step it up a notch. With vCenter, you can customize the installation meaning you can change the hostname, ip address, gateway,.. as you can see in the example below. Note that this only when your target is a vCenter. 

```YAML
    networks:
    - name: VM Network 				# Portgroup name
      type: static				# Set static IP
      start_connected: true			# Connect this adapter when the VM starts
      ip: 10.0.0.2				# Static IP
      netmask: 255.255.255.0			# Netmaks (/24 in this case) of the network
      gateway: 10.0.0.1				# Default gateway of the adapted
    customization:
      domain: lab.local				# DNS domainname
      dns_servers:				# List of DNS servers
        - 8.8.8.8
        - 8.8.4.4
    wait_for_ip_address: yes			# Wait for the ip address changes before continuing
    wait_for_customization: yes			# Wait for customization changes before continuing
```

Putting this all together you get a playbook like the one below. While this is still just scratching the surface of what you can do with Ansible and the [vmware_guest](https://docs.ansible.com/ansible/latest/modules/vmware_guest_module.html) module, it's a good way to get started.

```YAML
- name: Create VM based on Template
  vmware_guest:
    hostname: "host_ip"
    username: "host_user"
    password: "host_pass"
    validate_certs: False
    name: WEB-02
    template: AWX-Template
    datacenter: "Lab"
    folder: /Lab/vm/
    state: poweredon
    cluster: "esx-host-1"
    networks:
    - name: VM Network
      type: static
      start_connected: true
      ip: 10.0.0.2
      netmask: 255.255.255.0
      gateway: 10.0.0.1
    customization:
      domain: lab.local
      dns_servers:
        - 8.8.8.8
        - 8.8.4.4
    wait_for_ip_address: yes
    wait_for_customization: yes
```

## What's next?

Well, Ansible is actually a really smart tool, it even allows you to loop through a list of variables. So maybe the next thing to do is create multiple VM's from a dictionary variable in Ansible? The options are almost endless!

## Conclusion

Creating VM's using Ansible is actually not that hard. Combined with some logic that Ansible offers you can really create some seriously cool playbooks with this. Ansible's power doesn't stop with creating a VM. You can do so much more with it, like configure the freshly created VM's to host a load balanced webserver or so. Let your creativity go lose.