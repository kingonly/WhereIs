function getLocation(name) {
    return new Promise((resolve, reject) => {
        // Create the path for the HTTP request to get the weather

        let icloud = require("./icloud");
        
        var people = [];
        people['john'] = {id: 'johndoe@gmail.com', pass: '123456'};
        people['jane'] = {id: 'janedoe@gmail.com', pass: '123456'};

        var person = people[name.toLowerCase()];

        if (!person) {
            reject("I don't know " + name);
        }

        icloud.apple_id = person.id;
        icloud.password = person.pass;

        icloud.getDevices(function (error, devices) {

            var device = null;

            if (error || !devices) {
                var err = "I have trouble locating " + name;
                if (error !== null) {
                    err += " " + error;
                }
                reject(err);
                return;
            }
            //pick a device with location and findMyPhone enabled
            devices.forEach(function (d) {
                if (device == undefined && d.location && d.lostModeCapable
                     && d.modelDisplayName.toLowerCase().indexOf("iphone") >= 0) {
                    device = d;
                }
            });

            if (device) {
                icloud.getLocationOfDevice(device, function (err, location) {
                    var response = null;
                    if (location) {
                        response = location.replace('St','Street').replace('Hwy','Highway');
                    }
                    if (!response) {
                        response = "I don't know where is " + name;
                    }
                    resolve(response);
                });
            }
        });
    });
}


exports.WhereIs = function WhereIs(req, res) {
    let name = '';
    if (req.body.result.parameters['name']) {
      name = req.body.result.parameters['name'];
      console.log('Name: ' + name);
    }

    if (name != '') {
        getLocation(name).then((output) => {
            // Return the results of the weather API to API.AI
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                'speech': output,
                'displayText': output
            }));
        }).catch((error) => {
            // If there is an error let the user know
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                'speech': error,
                'displayText': error
            }));
        });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            'speech': 'I don\'t know who to locate',
            'displayText': 'I don\'t know who to locate'
        }));
    }
    
};

/*getLocation('john').then((output) => {
    console.log(output);
    getLocation('jane').then((output) => {
        console.log(output);
    });
});*/

