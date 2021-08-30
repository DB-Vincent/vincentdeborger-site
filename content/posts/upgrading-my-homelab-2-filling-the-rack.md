---
title: "Upgrading my Homelab 2: Filling the rack."
date: 2020-09-27T16:50:53+02:00
draft: false
---

![](/images/upgrading-my-homelab-2-filling-the-rack/DSC_3136.jpg)

In my previous blog post (click here if you haven't read it yet) I talked about how I built my very own DIY server rack. It's time to fill that rack with some equipment so I can put it to good use. Follow along to see what I put in my rack and what my plans are with it.

<!-- more -->

---

## Introduction

The goal with this rack is to create a relatively simple and clean "SFH"-lab (Study From Home). Because of COVID-19, a lot of assignments at school have to be done over a VPN connection on the infrastructure the school provides. They have a much better server infrastructure than I'll probably ever have at home, but the VPN connection throttles quickly. If there's 10 students deploying a vCenter appliance over the same connection, it start to throttle (a lot!) to the point you just get kicked off the VPN. Not an ideal situation.

Having these connection issues triggered me to start thinking about creating a homelab where I could work on assignments and test new subject matter. this means I'll need some networking equipment and some servers.

## The network

Because I'm working with Cisco IOS at school, it seemed pretty obvious I'd get some cisco gear for my SAH-lab. One aspect of the switch was very important for me, it had to be a switch with Layer 3 capabilities. After lurking a while on r/homelabsales and a Dutch/Belgian website called Tweakers I found someone who was selling his CCNA lab for a decent price. The lab consisted of a Cisco WS-C3750G-24TS-S1U and two Cisco WS-2960-24TT-L's. These are more or less the same models we use at school so this was my chance. I send the guy a message and he quickly responded that he liked to help a student out so a week later I picked the switches up and quickly went home to get them set up.

![](/images/upgrading-my-homelab-2-filling-the-rack/DSC_3134.jpg)

### Setting it all up

I tried to keep the switch set up as simple as possible while maintaining all the features I want the network to have because I know that networking isn't my strongest skill. As for now I've set up various VLANs for IoT, management (ESXi, vCenter, iDrac,..), provisioning (vMotion, storage), VPN and VM traffic. Using ACL's in combination with VLANs allows me to tell the switch which VLANs (or devices in VLAN) are able to talk to each other. My goal is to set up Port Aggregation for the VMs and between this switch and our house's core switch.

## The servers

Both the servers are the same servers as before. They have been upgraded to Intel Xeon E5 v2 CPU's so they're as efficient as possible and enabling me to cluster them together. The 10-bay server now has a Intel Xeon E5-2658v2 and the 8-bay now runs an Intel Xeon E5-2628Lv2. This makes my main server (the 10-bay) pretty powerful for all my main services and - when in need - I can turn on my second server which doesn't add a large amount of electrical power but still has some computing power. The top server runs 32GB DDR3 ECC 1333MHz and the bottom one runs 64GB DDR3 ECC 1333MHz ram, both plenty for my uses.

As for storage, the 10-bay server has 8x 300GB 10K disks in RAID 6 and 2x 146GB 15K disks in RAID 1, the 8-bay server runs 6x Dell 146GB 15K disks in RAID 5, 1x Dell 300GB 10K disk and a Samsung 256GB SSD. While this may seem like not as much as someone might need, it's plenty for my needs. I'm currently only using 10% of the storage because I'm not using this storage as a NAS.

![](/images/upgrading-my-homelab-2-filling-the-rack/DSC_3140.jpg)

![](/images/upgrading-my-homelab-2-filling-the-rack/DSC_3138.jpg)

## Mounting it all

A server doesn't get mounted like a switch or so. My R620 servers weigh way too much to get mounted using 4 screws. This is where the Dell A7 Sliding ReadyRails come in, these are adjustable rails you can mount in your rack where you can lay your server in. These also allow me to slide out the server in order to do maintenance. One issue I found while using the sliding rails was that I had to pull out all the cables in order to slide it out but that was easily fixed by adding a Dell 1u Cable Management Arm. This arm is mounted on the back of the rails and opens up when you pull out the server, all while keeping the cables neatly in the arm itself. 

![](/images/upgrading-my-homelab-2-filling-the-rack/DSC_3141.jpg)

![](/images/upgrading-my-homelab-2-filling-the-rack/DSC_3148.jpg)

![](/images/upgrading-my-homelab-2-filling-the-rack/DSC_3150.jpg)

## Conclusion

Now that everything is in place for my lab, it's time to start setting up all the software and using all of it. The servers can communicate with each other, the VLANs are being routed on the switches and everything is ready to be used. 