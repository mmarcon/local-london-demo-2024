# MongoDB Developer Tools Demos - .local London 2024

## How to use this repo

### Prerequisites

* Docker
* VS Code with MongoDB for VS Code installed
* IntelliJ Ultimate with MongoDB plugin installed

### Prepare for the demo

First of all, clone this repo.

#### Set up the environment

Run the `./bootstrap-demo-environment.sh` script. This will do the following:

* Remove all the local clusters
* Create a new local cluster named `local-london-ides` available on port `27027`, import the `demo/production-trips-w-reviews.archive` dataset, and create a Search index. **This is the cluster to be used for the IDE demos** so it's ready ready to go and VS Code and IntelliJ can be prepared connected to it ahead of time.
* Copy a clean `TripsRepository.java` into the IntelliJ project, so it's ready for the IntelliJ demo

#### Prepare for the CLI demo

Open a terminal, cd into the `demo` folder and you are good to go, ready to follow the demo script.

#### Prepare for the VS Code Copilot demo

* Open the `copilot-demo` folder in VS Code.
* Create a new connection, pointing to `mongodb://localhost:27027`. You can name the connection whatever you like, but if in the CLI demo you name your cluster e.g. `dot-local-paris` you may want to name the connection the same way.

#### Prepare for the IntelliJ demo

* Open IntelliJ and create a project from the `ride-share-api` folder.
* Open the Database panel and connect to `mongodb://localhost:27027`. You can name the data source whatever you like, but if in the CLI demo you name your cluster e.g. `dot-local-paris` you may want to name the connection the same way.
* Before the demo, make sure that in `TripRepository.java` the data source is connected.
