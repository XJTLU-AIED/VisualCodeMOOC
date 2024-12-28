# VisualCodeMOOC

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Installation](#installation)
    1. [VisualCodeMOOC](#visualcodemooc-1)
    2. [VisualCodeChat](#visualcodechat)
4. [Usage and Examples](#usage-and-examples)
5. [Modification and Customization](#modification-and-customization)
6. [Contributors](#contributors)
7. [License](#license)
8. [Acknowledgements](#acknowledgements)

## Overview
This repository contains the source code for the project VisualCodeMOOC, as described in the paper "VisualCodeMOOC: A Course Platform for Algorithms and Data Structures Integrating a Conversational Agent for Enhanced Learning Through Dynamic Visualizations", submitted to the SoftwareX journal.

VisualCodeMOOC is an interactive learning platform that integrates a conversational agent, VisualCodeChat, to help students understand algorithms and data structures. It offers personalized guidance within a MOOC environment by combining visualizations and hands-on exercises, enhancing the learning experience with interactive and engaging content.

Check our deployed version at [VisualCodeMOOC](https://duuan.github.io/visualcodemooc/) 

<img src="https://github.com/XJTLU-AIED/VisualCodeMOOC/blob/main/public/MOOC.png" alt="description" width="600"> 

## Key Features

- **Dynamic Visualizations**: Real-time interactive visualizations of algorithms and data structures based on randomly created examples during conversations, to help students understand the concepts better.
- **Personalized Guidance**: Conversational agent provides personalized guidance and support to students.
- **Hands-on Exercises**: Interactive exercises to practice and apply the concepts learned.
- **MOOC Integration**: Seamless integration with MOOC platforms to provide a complete learning experience.


## Installation
### VisualCodeMOOC
1. **Install Material for MkDocs**      
You may install Material for MkDocs with `pip` (recommended), ideally using a virtual environment.
    ```
    pip install mkdocs-material
    ```
    You can also use [docker](https://squidfunk.github.io/mkdocs-material/getting-started/#with-docker) or [git](https://squidfunk.github.io/mkdocs-material/getting-started/#with-git) to download Material for MkDocs.

2. **Run the site on local machine**       
Open the code file, switch to your virtual environment, you can run the site on your local machine with:
    ```
    mkdocs serve
    ```
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
### OpenAI API
There is a publicly available URL provided by an open-source initiative that offers free OpenAI API access. This requires only a GitHub account to obtain the API key, making it easy for anyone to access.
* The GitHub open-source project that provides a free GPT-3.5 API key for each GitHub account: https://github.com/chatanywhere/GPT_API_free/tree/main. 
* The direct link to acquire the key is: https://api.chatanywhere.org/v1/oauth/free/render.


## Usage and Examples
### Usage guide
You can learn algorithms in VisualCodeMOOC by following the below procedure:
1. Start with tutorial and short video lecture to get basic understanding of a topic
2. Chat with VisualCodeChat
    VisualCodeChat will give:
    - English explanation
    - Step-by-step explanation with visualization
    - Code learning
    - Practice testing
3. Try extra exercises
## Scenarios 
While chatting with VisualCodeChat, user may meet the following four phases. Example scenarios are shown in the screenshots: 
1. VisualCodeChat welcome
2. Adaptive teaching
<img src="https://github.com/XJTLU-AIED/VisualCodeMOOC/blob/main/public/screenshot1.png" alt="description" width="500">  

<img src="https://github.com/XJTLU-AIED/VisualCodeMOOC/blob/main/public/screenshot_adaptive.png" alt="description" width="600">

4. Interactive learning
<img src="https://github.com/XJTLU-AIED/VisualCodeMOOC/blob/main/public/screenshot_hint1.jpg" alt="description" width="500">
5. Completion of the learning


## Modification and Customization
### Customize Visualizations
To modify the visualizations, you need to use the files in the visualcodechat/app/visual, select the visualization you want to modify, and modify the const property in the file.
To add new visualizations, you need to use the cn.tsx in the visualcodechat/app/masks to define the visualization name in the animation property. Then, design your own new visualization by creating a new file in the visualcodechat/app/visual and add the content according to the same way as the existing visualizations. After that, you need to employ the new visualization in the visualcodechat/app/components/chat.tsx. Add the new visualization const in the div element: className={styles["chat-message-item"]}. With the suitable condition setting accoriding to the animation property, you can use the new visualization in the chatbot. 
### Customize Courses
To modify the courses, you need to use the cn.tsx in the visualcodechat/app/masks. Specifically, if you want to modify the existing content, you can check the mask name first then modify the content in the corresponding mask component. If you want to add a new course, you can create a new mask file in the CN_MASKS and add the content according to the same way as the existing masks. For example, you can set the difficulty level of the exercise or customize the algorithm of the course.

## Contributors
- Mingyuan Li
- Duan Wang
- Erick Purwanto
- Thomas Selig
- Qing Zhang
- Hai-Ning Liang

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgements
This work is supported by the research funds XJTLU RDF-22-01-062, TDF2223-R26-219, TDF2324-R27-230, RC4AIED202406, and AoFE Implementing Computational Thinking Education in K‑12 and Higher Education Special Interest Group. We would like to thank the STEAM Centre, Ulink College of Suzhou Industrial Park for their support.


