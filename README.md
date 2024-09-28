# VisualCodeMOOC

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Installation](#installation)
    1. [VisualCodeMOOC](#visualcodemooc)
    2. [VisualCodeChat](#visualcodechat)
4. [Usage and Examples](#usage-and-examples)
5. [License](#license)
6. [Acknowledgements](#acknowledgements)

## Overview
This repository contains the source code for the project VisualCodeMOOC, as described in the paper "[Paper Title]", submitted to the SoftwareX journal. [**pending**]

VisualCodeMOOC is an interactive learning platform that integrates a conversational agent, VisualCodeChat, to help students understand algorithms and data structures. It offers personalized guidance within a MOOC environment by combining visualizations and hands-on exercises, enhancing the learning experience with interactive and engaging content.

Check our deployed version at [VisualCodeMOOC](https://visualcodemooc.herokuapp.com/) [**pending**]

## Key Features

- **Dynamic Visualizations**: Real-time interactive visualizations of algorithms and data structures based on randomly created examples during conversations, to help students understand the concepts better.
- **Personalized Guidance**: Conversational agent provides personalized guidance and support to students.
- **Hands-on Exercises**: Interactive exercises to practice and apply the concepts learned.
- **MOOC Integration**: Seamless integration with MOOC platforms to provide a complete learning experience.


## Installation
### VisualCodeMOOC

### VisualCodeChat
- Requirements
NodeJS >= 18
Docker >= 20

1. **Install Node.js and Yarn**
Ensure that both Node.js and Yarn are installed on your local machine. These tools are required to manage dependencies and run the development server.

2. **Configure Environment Variables**
Create and configure a .env.local file in the project root directory with the necessary environment variables. This file will store local configurations for development purposes.
    ```
    OPENAI_API_KEY=<your api key here>
    ```

3. **Install Dependencies and Start Development Server**
Run the following commands to install project dependencies and start the local development server:

    ```
    yarn install
    yarn dev
    ```
    This will initialize the project and launch the server in development mode.

## Usage and Examples

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgements



