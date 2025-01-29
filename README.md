# Lucia-SDK
Ad Attribution SDK

**index.js** module contains the required abstraction for clients to use on their websites. This module allows users to create a Lucia object reference to use its functions:
1. authenticate - authenticate a client using the api-key provided by Lucia
2. userInfo - provide basic information regarding the users visiting the web page
3. pageView- track page views
4. trackConversion - provide any conversion events taking place
5. updateUserId - update the user ID for a user.

**test.js** gives an example of the module's application


The following screenshots show how the module can be imported for use:

<img width="597" alt="image" src="https://github.com/ondecentral/Lucia-SDK/assets/91156430/6a920ee1-4099-4762-b9f9-7d63fefe9919">



**script.js**  


![scriptjs](https://github.com/ondecentral/Lucia-SDK/assets/91156430/fc86dd1b-a2f6-46d9-89f1-80193dc3665d)


**backend service console log**


![backendservicelog](https://github.com/ondecentral/Lucia-SDK/assets/91156430/fc86dd1b-a2f6-46d9-89f1-80193dc3665d)

Welcome.html and use of sdk in its script script

<img width="710" alt="image" src="https://github.com/ondecentral/Lucia-SDK/assets/91156430/b5f293c9-91a5-474d-9bf9-a06c24899b5f">

<img width="779" alt="image" src="https://github.com/ondecentral/Lucia-SDK/assets/91156430/c8944145-613d-4069-9a15-041ec2bc84db">


backend service console log for welcome page:

<img width="1457" alt="image" src="https://github.com/ondecentral/Lucia-SDK/assets/91156430/00d59e43-57cd-4c7c-a37a-b4433a5ab37e">


## Troubleshooting

### Why aren't my updates going through? 

```zsh
npm run build
npm publish
```

if you forget the step to build 


### I pushed my updated NPM package to version 1.X.Y but its giving me an error on `npm i`

Thats because sometimes it takes 30 seconds to 2 minutes for npm cache on npmjs.org to update
