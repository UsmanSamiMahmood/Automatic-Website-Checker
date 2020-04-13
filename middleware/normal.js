const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { db } = require("../database/handler");
let location = db.collection("data").doc("permissionCheck")
    .get().then((doc) => {
        let blackListedIPs = doc.data().blacklistedIPs
        let authip = doc.data().authip
    
router.get("/", (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split("::ffff:")[1]
    if (blackListedIPs.includes(ip)) {
        res.status(502)
        return res.send(`Your IP: ${ip} is blacklisted from using our services, have a good day.`)
    } else {
        res.status(200)

        return res.render("index", {
            "jonasMail": "jonas.tysbjerg@gmail.com",
            "jonasDiscord": "♰ R1zeN#0001",
            "usmanMail": "usmanmahmood2914@protonmail.com",
            "usmanDiscord": "MrShadow#0001"
        })
    }
})

router.get("/dashboard", (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split("::ffff:")[1]
    if (blackListedIPs.includes(ip)) {
        res.status(502)
        return res.send(`Your IP: ${ip} is blacklisted from using our services, have a good day.`)
    } else {
        res.status(200)
        return res.render("dashboard")
    }
})

router.get("/login", (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split("::ffff:")[1]
    if (blackListedIPs.includes(ip)) {
        res.status(502)
        return res.send(`Your IP: ${ip} is blacklisted from using our services, have a good day.`)
    } else {
        res.status(200)
        return res.render("login");
    }
})

router.post("/login", (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split("::ffff:")[1]
    if (blackListedIPs.includes(ip)) {
        res.status(502)
        var json = {}
        json.type = "error"
        json.title = "Error Encountered"
        json.message = `Your IP: ${ip} is blacklisted from using our services.`
        json.success = false

        return res.send(JSON.stringify(json))

        //return res.send(`Your IP: ${ip} is blacklisted from using our services, have a good day.`)
    } else {
        res.status(200)
        let citiesRef = db.collection('users');
        let query = citiesRef.where('email', '==', req.body.email).get()
        .then(snapshot => {
            if (snapshot.empty) {
                var json = {}
                json.type = "error"
                json.title = "Error Encountered"
                json.message = "This user isn't registered."
                json.success = false

                return res.send(JSON.stringify(json))
            }  

            snapshot.forEach(doc => {
                return bcrypt.compare(req.body.password, doc.data().password, function (err, result) {
                    if (result) {
                        res.redirect("/dashboard")
                    } else {
                        var json = {}
                        json.type = "error"
                        json.title = "Error Encountered"
                        json.message = "Incorrect email or password."
                        json.success = false

                        return res.send(JSON.stringify(json))
                    }
                });
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
    }
})

router.get("/register", (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split("::ffff:")[1]
    if (blackListedIPs.includes(ip)) {
        res.status(502)
        return res.send(`Your IP: ${ip} is blacklisted from using our services, have a good day.`)
    } else {
        res.status(200)
        return res.render("register");
    }
})

router.post("/register", async(req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split("::ffff:")[1]
    if (blackListedIPs.includes(ip)) {
        res.status(502); 
        return res.send(`Your IP: ${ip} is blacklisted from using our services, have a good day.`)
    } else {
        let citiesRef = db.collection('users');
        let query = await citiesRef.where('email', '==', req.body.email).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    console.log("Activated")
                    throw "found"
                }        
            })
            .catch(err => {
                    console.log("Activated 2")
                    var json = {}
                    json.type = "error"
                    json.title = "Account Exists."
                    json.message = "A user with this email already exists."
                    json.success = false

                    return res.send(JSON.stringify(json))
            })
        if (req.body.password !== req.body.passwordconfirm) {
            var json = {}
            json.type = "error"
            json.title = "Passwords do not match."
            json.message = "Please make sure passwords match before submitting."
            json.success = false

            return res.send(JSON.stringify(json))
        } else {
            let email = req.query.email
            let password = req.query.password
            var number = Math.random()
            number.toString(36)
            var id = number.toString(36).substr(2, 9)
            id.length >= 9;

            console.log(id);
            

            var json = {}
            json.type = "success";
            json.title = "Your account has been registered.";
            json.message = "Redirecting to login...";
            json.success = true

            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    db.collection("users").doc(id).set({
                        email: req.body.email,
                        password: hash,
                        admin: false,
                        premium: false
                    })
                });
            });

            console.log(`Email: ${req.body.email}. Password: ${req.body.password}.`)
        
            return res.end(JSON.stringify(json))
        }
        
    }
   
    
    // Note for tomorrow, make the database make a document with the id name and inside the document store the email and password(encrypted) and set premium to false, also create an array called monitoredUrls.
    // Collection for user and document containing urls.
})

function sendMail(email, subject, body, html="") {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'stressfreeuptime@gmail.com',
          pass: emailPassword
        },
        tls: {
            rejectUnauthorized: false
        }
      });
      
      var mailOptions = {
        from: 'stressfreeuptime@gmail.com',
        to: email,
        subject: subject,
        text: body,
        html: html
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    })
}
});

module.exports = router;