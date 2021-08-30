---
title: "Deploying and managing EC2 instances with Terraform and Ansible"
date: 2021-07-01T15:03:40+02:00
draft: false
---

![](/images/deploying-and-managing-ec2-instances-with-terraform-and-ansible/DSC_3333.jpg)

The world of Infrastructure as Code is beautiful. Creating temporary architectures and easily scaling them up/down/in/out is what makes it as powerful as it is. Tools like Terraform, Ansible, Puppet, Chef and CloudFormation make it easy for us to use these features to our advantage. But how well do these different tools integrate into each other? Let's take a look at how you can easily create EC2 instances using Terraform and create an inventory file which our Ansible playbook can use to manage the EC2 instances. In this tutorial we'll be creating an EC2 instance using Terraform and install a webserver on it using Ansible.

<!-- more -->

---

## Creating an EC2 instance

Before we can start managing the EC2 instance, we'll have to create it first. In this tutorial I'll be using Terraform with the AWS provider. To start off, we'll create a file called 'main.tf' where all our Terraform logic will reside in. In this file we'll have to define what provider we'll be using, because we're working with EC2 instances, the provider is AWS. 

```HCL
terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 3.0"
        }
    }
}

provider "aws" {
    profile = "default"
    region  = "eu-west-1"
}
```

As you can see in the code block above, I'm using the 'default' profile. This is because I'm using the default AWS CLI which is created when you execute the `aws configure` command. For more information about this you can always visit [AWS' documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html). Besides the profile, it's also defining which region I want to deploy the AWS Services in. Because I live in Belgium I'm using eu-west-1, but you can change this to your prefered [region](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints). 

## Creating a key pair

Once we've set up our provider, we can start creating the EC2 instance. In this tutorial I'll be creating an Ubuntu instance so we'll start off by creating a key pair. A key pair is a set of security credentials consisting of a public and a private key. The purpose of using these keys is to be able to log in without a password. Something that is much more secure than logging in with a password that can be guessed. The private key will be saved on our own device, while the public key will be stored on AWS. 

Before we can create the key pair, we'll need to create an SSH key. This can be done by executing `ssh-keygen` on Windows, Linux or Mac. When you've executed this command, you'll be asked to enter a directory where it can store the public and private key. Once you've given it a directory where it can store the SSH keys, you can enter a passphrase but I'd leave this empty for the sake of this tutorial.

![](/images/deploying-and-managing-ec2-instances-with-terraform-and-ansible/Screenshot_8.jpg)

After we've created an SSH key, we can start writing the Terraform code for creating a key pair. In this code we'll have to define what we want the key pair to be called and what our public SSH key is. Retrieving the public SSH key is easy, you'll just have to copy the contents of the .pub file the above-mentioned command created. As you'll see in the code in my repository, I've worked with variables so I didn't have to share my own keys publicly.

```HCL
resource "aws_key_pair" "keypair" {
    key_name    = "TerraformAnsible-Keypair"
    public_key  = "public-key-here"
}
```

## Creating a security group

Security groups are virtual firewalls we can use to allow/deny traffic to/from EC2 instances. The default security group blocks all inbound traffic , so we'll have to create one which allows us to SSH into the machine and browse the webserver we'll be hosting on it.

To allow incoming traffic over TCP into port 80 (HTTP), we'll have to create an ingress (incoming) rule. This rule kind of works like NAT, you'll have to define a port where the traffic will come from (the one you type in your browser for example) and the port it'll go to on the machine itself. Because we'll just be using port 80 for HTTP, we can just fill in 80 in both fields. After that we'll have to define which protocol the traffic will be using (which is TCP in our case). Once that's filled in we need to specify from which CIDR blocks the traffic will come. Because we don't know for sure which IP will be accessing our site, we'll just use a sort of wildcard (0.0.0.0/0). For SSH we need to do the same but with the port SSH uses (22). To allow outgoing traffic, we need to define an egress (outgoing) rule which allows all traffic to any port (0), any protocol (-1) and to any destination (0.0.0.0/0).

```HCL
resource "aws_security_group" "sg-ec2" {
    name        = "TutorialSG"

    ingress {
        description = "HTTP from everywhere"
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "SSH from everywhere"
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "TutorialSG"
    }
}
```

## Creating the instance

Now that we've created our key pair and a security group, it's time to actually create the instances. Terraform has a resource for this called [aws_instance](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/instance). Using this resource we'll be able to easily create a simple Ubuntu instance in the AWS cloud. 

First things first, we need to decide which AMI (Amazon Machine Image) we'll need to use. For Ubuntu machines, there's [a nice tool](https://cloud-images.ubuntu.com/locator/ec2/) we can use to search which AMI we can use in the Region we'll use. Using this site, we can search for specific versions of Ubuntu and select the right AMI for our region. For example; I want to use Ubuntu 20.04 with an AMD64 architecture in the eu-west-1 region, so the AMI I'll have to use will be _ami-0da36f7f059b7086e_. 

Once we've selected which AMI we'll use, we can proceed to defining the instance in Terraform. Because I want this to be quite flexible I'm including the 'count' argument. This allows me to define how many instances I want to deploy. While this is not necessary, it's something I like to use so I can easily enter a different amount and it'll launch that amount of instances. After that we need to enter the AMI we selected using the Ubuntu AMI tool, the instance type, the name of the key pair we created in a previous step and the security group we want to use. 

```HCL
resource "aws_instance" "servers" {
    count               = 1
    ami                 = "ami-0da36f7f059b7086e"
    instance_type       = "t2.micro"
    key_name            = "TerraformAnsible-Keypair"

    security_groups = [aws_security_group.sg-ec2.name]

    tags = {
        Name = "Server${count.index}"
    }
}
```

## Let Terraform create an Ansible inventory

In order to let Ansible manage our newly created EC2 instance(s), we'll have to create an inventory file which Ansible can use. In this inventory file, there'll be an entry for each host. This entry will define the IP of the machine, the username we need to use to log in (this is 'ubuntu' on the Ubuntu images AWS provides) and the private key (we used the public key in the key pair, now we need to use the other file, without an extension). Because I don't want to SSH into the instance(s) every time before I can execute the Ansible playbook, I added an SSH argument that disables host key checking.

First, we'll create a hosts template file. This file will be used by Terraform to create the inventory file. 

```INI
[servers]
${instance_name}
```

Once we have the hosts template file, we can go back to our main.tf file and start using the [template_file](https://registry.terraform.io/providers/hashicorp/template/latest/docs/data-sources/file) data source. In this data source we'll have to define a template (our hosts template file) and variables which will fill the inventory file. For this variable, I'm using a join which joins the public IP of the EC2 instance(s) with the Ansible inventory arguments. Once the variables are set in the template, we can output the rendered template into a file that Ansible can use. For that I'm using the [local_file](https://registry.terraform.io/providers/hashicorp/local/latest/docs/data-sources/file) resource in Terraform.

```HCL
data "template_file" "hosts" {
    template = file("./hosts.tpl")
    vars = {
        instance_name = join(" ansible_user=ubuntu ansible_ssh_private_key_file=./ssh-key ansible_ssh_common_args='-o StrictHostKeyChecking=no'\n", concat(aws_instance.servers.*.public_ip, [""]))
    }
}

resource "local_file" "hosts_file" {
    content  = data.template_file.hosts.rendered
    filename = "./ansible/hosts"
}
```

Beware that in the template I set the 'ansible_ssh_private_key_file' variable to './ssh-key'. In order for this to work, change this to the (absolute) path of the SSH key you'll be using.

## Creating an Ansible playbook

Because I don't want to go too far in depth with this post, I'll be installing a simple web server with a webpage on each EC2 instance. So, to start I'll install NGINX (purely personal preference, you can use Apache too) and make sure the '/var/www/html' directory is empty. Once that's done we can create an 'index.html' file which will say 'Hello World!' and then the public IP of our instance.

```YAML
---

- name: Deploy webserver
  hosts: servers
  become: yes
  tasks:
    - name: Update repositories cache and install nginx
      apt:
        name: nginx
        update_cache: yes
    - name: Remove /var/www/html directory
      file:
        path: "/var/www/html"
        state: absent
    - name: Recreate /var/www/html directory
      file:
        path: "/var/www/html"
        state: directory
    - name: Create index file
      file: 
        path: "/var/www/html/index.html"
        state: touch
    - name: Put "Hello World!" in index.html
      shell: echo "<h1>Hello World!</h1><br>" >> /var/www/html/index.html
    - name: Put public ip in index.html
      shell: curl http://169.254.169.254/latest/meta-data/public-ipv4 >> /var/www/html/index.html
```

## Running the Terraform configuration file and the Ansible playbook

Running Terraform and Ansible is fairly easily. First, we'll need to create a file called 'terraform.tfvars' in the root of the repository. In this file you need to create a single variable called 'public_key' which has the content of your public ssh key as as its value.

From there, it's as easy as executing both the 'terraform apply --auto-approve' and 'ansible-playbook ansible/deploy_webserver.yml -i ansible/hosts' in the repository (in that sequence).

## Conclusion

Creating a simple infrastructure consisting of 3 webservers and installing them in an automated manner isn't hard. Especially not when you're presented with tools like Terraform and Ansible which make our lives a lot easier.

You can find all the code used in this tutorial in [my github repository](https://github.com/DB-Vincent/Terraform-Ansible-Playbook).