---
title: "How did I build my homelab?"
date: 2021-08-26T14:17:20+02:00
draft: false
---

Let's take a look at how I build my personal homelab, how I got to building my homelab and what gear I have running.
<!--  more -->

![](/images/how-did-i-build-my-homelab/DSC2899.jpg)

As a 19-year-old Security, Systems & Services student, getting hands-on experience with servers while I'm not on campus helps me get some experience. Besides that, a homelab makes it possible to implement subjects seen in class in a lab environment. Having some servers at home was the ultimate start of this project. Even before I got my own set of servers, I was lucky enough to have access to server-grade equipment at home. My father - who is also active in IT - had started his own homelab and that is where I found my love for IT.

----

## Where to start?

Everyone's homelab is different, because it's made to fit your needs. But it all starts from the same situation; _You're into IT and want to try a lot of things out._ That is what inspired my homelab, I'm a curious student.

It all started a few years back when my father bought our first server, an HP ML350p Gen8. Back when we bought it, it was the second oldest generation of the HP ML350p series. That ML350p Gen8 is now still running 90% of our shared homelab, it runs our Microsoft AD DC's, webservers, NAS, SCCM, VEEAM, Plex, Unifi Controller,..

A few months of fiddling and testing things out I decided it was time for me to y my own server, a small HP Microserver Gen8. It was perfect for what I needed to do - and what does a 16 year old do I hear you ask? Host game servers, duh -. All jokes aside, it really was the start of my passion for servers and networking. I had the chance to try out various Operating Systems such as OpenSuse, CentOS, Windows Server,.. and really get a feel for the more advanced things. Coming from using Ubuntu on a VM on my Desktop PC, it really opened some doors. This also gave me the opportunity to try iLO.

## Well, what's next?

That's actually a good question, that's the question I'm asking myself at this very moment. Already having a great homelab with the possibility to try anything out seems like the endgame, but it isn't since a few months.

Some time ago I had the chance to get my hands on 2 barebones Dell R620 servers, which got me thinking about starting my own homelab, separated from the shared one. I picked the server up and after searching in the renowned box of 'things we might need in the future' - read: [Pandora's box](https://en.wikipedia.org/wiki/Pandora%27s_box) -, I got 2 CPU's and some RAM to get it all started up. Over the course of 3 months I managed to give one of the servers 64GB DDR3 1333MHz RAM and the other 32GB DDR3 1333MHz RAM and upgrade the CPU's to an [Intel Xeon E5-2660](https://ark.intel.com/content/www/us/en/ark/products/64584/intel-xeon-processor-e5-2660-20m-cache-2-20-ghz-8-00-gt-s-intel-qpi.html) and an [Intel Xeon E5-2650L](https://ark.intel.com/content/www/us/en/ark/products/64585/intel-xeon-processor-e5-2650l-20m-cache-1-80-ghz-8-00-gt-s-intel-qpi.html) respectively.

Both servers are currently running the latest version of VMware vSphere (7.0), enabling me to virtualize all my services. They are both managed by a single VMware vCenter 7.0 server.

### The second network

We already have a whole network set up where all our devices are connected on, but to achieve true separation of the two homelabs I utilized the second public IP address we got from our ISP. Using some VLANs I managed to get the link coming from the RJ-45 jack on our ISP's modem to both of the Dell R620 servers. This makes it possible for me to virtualize a PfSense installation.

| |
:-------------------------:|:-------------------------:|:-------------------------:
![](/images/how-did-i-build-my-homelab/DSC2894.jpg)  |  ![](/images/how-did-i-build-my-homelab/DSC2895.jpg) | ![](/images/how-did-i-build-my-homelab/DSC2897.jpg)

As you can see in the 3rd picture above, we're also running an Unifi Security Gateway 3, this handy router runs our house and handles it like a champ. Both our servers (from the shared homelab) as well as our clients' traffic to the outside is routed by this piece of kit. Combined with a Unifi AP-AC-LR it serves us a stable internet connection which is manageable from one control panel.

For all the VLANs and internal routing we're using an HPE V1910-16G switch. While allowing us to seperate our devices into different VLANs and giving the option to connect different VLANs to eachother in case I want the devices in them to communicate.

## Current projects

Approximately 70% of our shared homelab is based upon Windows virtual machines. Because of this, working with Windows-based technologies wasn't really a problem or a challenge anymore. That is why I decided to take on the challenge and create my whole homelab in just linux virtual machines.

### The core

At the core of my homelab is the PfSense VM making sure all the other VMs can connect to the internet. This VM also makes sure I can make the services available from outside my own internal network besides that, it also serves as a DHCP although that might change in the future. Because my own homelab is on a VLAN of it's own I decided to set up the OpenVPN service, this makes it possible for me to reach the VMs inside my homelab.

> Whoever says internet, says DNS.

Because DNS is such a big - and awfully handy - system used for browsing the internet, it was almost a no-brainer for me to install my own DNS server(s). Since I don't have an impressive amount of knowledge about the possible packages providing DNS services, I decided to go with the easy option and install BIND. With BIND, I created both a forward lookup and reverse lookup zone. After that it's as easy as restarting the service and configuring the clients. 

### Management

Deep down, all the machines are managed from the vSphere Web Client. But this doesn't allow me to change things in the OS of a VM, that's where [AWX](https://github.com/ansible/awx) comes in. AWX is a piece of software that allows a user to deploy Ansible playbooks on various machines (in so-called jobs). Combined with a great web-based user interface it created the perfect replacement for SCCM. There's still a long learning curve ahead of me but my first impressions have been good so far.

## To be continued..?

As probably anyone with a homelab would tell you, a homelab is never finished. Neither will my homelab be. Because I'm partially using this as a playground to try out things I've seen in class there will always be something new to implement/try out. 

![](https://vincentdeborger.be/content/images/2020/07/tobecontinued.gif)