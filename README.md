# LightBnB

## Project Summary
Lighthouse BnB is an app that will revolutionize the travel industry. It will allow homeowners to rent out their homes to people on vacation, creating an alternative to hotels and bed and breakfasts...There’s nothing else like it! Users can view property information, book reservations, view their reservations, and write reviews. We'll be creating the first ever application to do something like this and we will call it LighthouseBnB.

![LightBnB home page](https://github.com/sl-nair/LightBnB/blob/master/img/LightBnB-home.PNG?raw=true)

![LightBnb create-listing page](https://github.com/sl-nair/LightBnB/blob/master/img/LightBnB-Create-Listing.PNG?raw=true)
## Setup
``` npm install ```

## Server startup
``` cd LightBnB_WebApp/LightBnB_WebApp-master/ ```

``` npm run local ```

## Running database
``` startpostgres```
``` psql -h localhost -p 5432 -U labber lightbnb ```
The password is 123.

### Dependencies
    "bcrypt": "^3.0.6",
    "cookie-session": "^1.3.3",
    "express": "^4.17.1",
    "nodemon": "^1.19.1",
    "pg": "^8.11.0"

