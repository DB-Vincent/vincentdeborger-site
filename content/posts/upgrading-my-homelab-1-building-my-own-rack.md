---
title: "Upgrading my homelab 1: Building my own rack."
date: 2020-09-03T10:20:54+02:00
draft: false
---

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2925.jpg)

Because of COVID-19, I've been working (studying) from home the past few months. This means I have to use the server architecture at school over a VPN connection. This was especially frustrating knowing that we had to deploy vCenter appliances of that connection, let 3 students each deploy an appliance and the connection starts to throttle. Experiencing that multiple times made me realise that a homelab is such a nice thing to have, so I decided to do some upgrades. In this part I'll talk about how I built my own rack from scratch.

<!-- more -->

---

## Introduction

For the past months my 2 R620 servers have been living on the attic, right under our roof. This combined with a terrible airflow meant that the temperatures (and dust situation) weren't really healthy for my server. Building my own rack where I could mount my hardware (and put it somewhere better) quickly became the first thing to upgrade. 

## Preparation

First, I bought four (4) 20mm by 20mm aluminium profiles (each profile was 2m at our local hardware store). These I chopped up to 4 pieces of 860mm, 8 of 491mm and 8 of 30mm. They became the top and bottom of the rack. For the profiles to which the rack strips were attached, I used 20mm by 40mm profiles that I sawed on 360mm. At the same hardware store I found these corner-pieces which I could use to connect all the profiles together. For mounting the serverrails I used the [Adam Hall Heavy Duty Rack Strips](https://www.adamhall.com/shop/be-en/19-inch-rack-accessories/19-inch-rack-rails/932/61535-b-10) but in the 8u version.

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2913.jpg)

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2914.jpg)

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2916.jpg)

## Assembly

Once all the profiles were cut to the right length I started to fit all the pieces together. Using the plastic corners I first assembled the top and bottom before putting it all together using the 20mm by 40mm profiles. This process wasn't really hard but just took a while because I had to file all the edges of the profiles. Once this was all assembled the unit felt really sturdy.

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2919.jpg)

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2922.jpg)

As you can see in the right picture, there are pieces sticking out in the front and the back of the rack. This makes it easy to manage the cables if necessary, it als protects any sockets/cables from getting damaged.

After assembling the whole frame, I decided to paint it black because _Matte black everything_. This also made the frame look more as one rack instead of aluminium profiles connected to each other by plastic corner pieces. I've done about 3 layers of black spray paint to make sure it's fully covered.

Because this rack will live on the attic I've added wheels that van pivot. This makes it easy to move the rack if I ever need to. These wheels are mounted on the bottom of the rack using 3 screws. They're rated for 40kg each so they should be able to carry the weight of the rack just fine.

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2925.jpg)

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2926.jpg)

![](/images/upgrading-my-homelab-1-building-my-own-rack/DSC_2927.jpg)

## Conclusion

The rack turned out perfectly, it's exactly the way I imagined it. The rails I've got for my Dell R620's fit perfectly (I did measure the depth of the server based upon the length of the rack rails). One thing I was worried about was that the rack would tip over but as far as I've tested pulling one server doesn't tip over the whole rack, which is perfect.

The next thing up my list is putting everything in the rack and adding some new hardware so my [WFH](https://www.urbandictionary.com/define.php?term=WFH) lab is fully operational so that I can use it when the new academic year starts. But that's something for the next blogpost.