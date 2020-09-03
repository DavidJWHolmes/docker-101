# Docker 101
### Learn Docker by containerising a Node.js app

---
## What is Docker?
A way to package software so that it can run on any hardware.

## What problem does Docker solve?
In our case we need a server that is running the version of Node we want as well as the installed dependencies.

If I just sent you the src/index.js file there is no reason to believe it would run on your machine as you may not have the required Node version or dependencies.

Docker allows you to reproduce the exact environment you want to run on the target hardware.

The developer who creates the software can define the environment with a Dockerfile. 

Any other developer can then use the Dockerfile to rebuild the environment as an immutable snapshot, also known as an Image. 

Images can be shared publically or privately via cloud registries. 

Any developer who wants to use the Image can pull it down to create a running process of that Image called a Container. 

One Image file can be used to spawn multiple Containers in multiple places which is where Docker Swarm or Kubernetes come into play to help orchestrate and scale Containers. 

Swarm and Kubernetes are advanced concepts and not within the scope of this tutorial. 

## Key concepts: Dockerfile, Images, Containers
A *Dockerfile* is a blueprint for building an Image.

An *Image* is a template for running a Container.

A *Container* is a running process.

## Installation & Tooling
Begin by installing the Docker Desktop application. This installs everything you need, including the CLI, and gives you a friendly GUI to inspect your running Containers.

You should also install the VSCode Docker extension.

To view all of the running Containers on your system run `docker ps` or use Docker Desktop.

## The Dockerfile

Now open the Dockerfile.

**FROM** - Selects a base Image. We could select Ubuntu and install Node, but instead we will start with the prebuilt node:12 Image.

**WORKDIR** - Similar to when we `cd` into a directory on Mac or Linux. All subsequent instructions will start from this directory. 

**COPY** - Add dependency info in package.json to Image. Each step is a layer that Docker will attempt to cache if nothing has changed, which is why we copy these over and install packages before source code is copied.

**RUN** - Like running a terminal command. Installs our dependencies. Shell form.

**COPY** - Copy source code into the Image. We ignore local node_modules folder with .dockerignore.

**ENV** - Set environment variables.

**EXPOSE** - Exposes the port so that the Container is publically available.

**CMD** - Only one allowed per Dockerfile. Tells Container how to run application. Exec form (doesn't start a shell session).

## Building an Image

Make sure you've setup a profile on Docker Hub.

To build, use the following suggested format: 

`docker build -t {username}/{app-name}:{semver} {path-to-dockerfile}`

Eg. `docker build -t davidjwholmes/docker101:1.0.0 .`

Docker will run through and execute each of the steps listed in the Dockerfile. Remember that each layer is cached. 

Once built, you will now have an Image you can use to create other Images, or to run Containers.

At the conclusion of the build Docker will supply you with a Image ID and the tag (human friendly) name.

*Successfully built 994842b8ee5a*
*Successfully tagged davidjwholmes/docker101:1.0.0*

In practice, you will usually push this Image to a Container registry somewhere eg. Docker Hub or a cloud provider (AWS ECR, GCP Container Registry etc.)

You would do this with the `docker push` command.

A developer or server (eg. GCP Cloud Build CI server) could then `docker pull` to pull the Image down.

## Running a Container

Use `docker run {image-id || tag-name}` to run a Container from the Image.

Eg. `docker run davidjwholmes/docker101:1.0.0`

You should now be able to view your running Container in the Docker Desktop GUI or with the `docker ps` command.

## Port Forwarding
The app should start, however if you go to localhost:8080 in your browser you will not be able to view the app because by default port forwarding is not enabled for port 8080. You must explicitly allow this or else running a Container could expose any ports it wanted.

Use `docker run -p 5000:8080 davidjwholmes/docker101:1.0.0` to map your local 5000 port to port 8080 in the Container.

## Volumes

When you kill a Container process any state contained within is lost. There may be situations where you want to share and persist data across multiple Containers. The way you do this is with Volumes. 

A Volume is a dedicated folder on the host machine inside which a Container can create files that can be remounted into future Containers or multiple Containers at the same time.

Create a Volume by running `docker volume create {volume-name}`

eg. `docker volume create shared-files`

You can mount the Volume somewhere in your Container when you run it like so `docker run --mount source=shared-files,target=/stuff -p 5000:8080 davidjwholmes/docker101:1.0.0`        

## Debugging a Container

You can inspect logs by clicking on the running Container in Docker Desktop.

You can get into the Container and interact with the command line by clicking the CLI button. Try doing this and running `ls` to view all source files in root that we copied before when we were building the Image.

## Manage multiple Containers with Docker Compose

To keep your Containers healthy make sure to write simple, maintainable microservices. Each Container should only run one process. If your app runs multiple processes it should use multiple Containers.

Docker Compose is a tool for running multiple Docker Containers at the same time.

We have a Dockerfile for our Node.js app, but let's imagine that the app needs to access a MySQL database and we'll also likely want a Volume to persist the database across multiple Containers.

Ensure you have a docker-compose.yml file in local root. Each key in the 'services' object of this file represents a different Container we want to run.

eg. 
- 'web' points 'build' to '.' where the Dockerfile is, and also defines the port forwarding configuration.
- 'db' uses the 'mysql' image and requires a password supplied as an environment variable.
- 'volumes' defines the specified volumes we want to use and which Containers they are mounted in.

Run `docker-compose up` to run all the Containers together and `docker-compose down` to shut them down at once.