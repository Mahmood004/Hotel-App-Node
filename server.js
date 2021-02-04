const express = require('express');
const Sequelize = require('sequelize');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const checkAuthentication = require('./middleware');

// Importing database models

const User = require('./models').User;
const Hotel = require('./models').Hotel;
const Category = require('./models').Category;
const Ad = require('./models').Ad;

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(cors(corsOptions));
app.use(fileUpload());
app.use(router);

router.get('/', function(req, res, next) {
    res.send({ "status": "welcome to the back-end" });
});

router.post('/hotel', checkAuthentication, function(req, res, next) {
    const { name, logo, address, email, phone, longitude, latitude, status } = req.body;
    console.log(req.user.id);
    Hotel.create({ userId: req.user.id, name, logo, address, email: email.join(','), phone: phone.join(','), longitude, latitude, status }).then(function(hotel) {
        res.status(200).send(hotel);
    });
});

router.get('/hotels', function(req, res, next) {
    
    Hotel.findAll({}).then(hotels => {
        res.status(200).send(hotels)
    })
});

router.delete('/hotel/:id', checkAuthentication, function(req, res, next) {
    
    Hotel.destroy({
        where: {
            id: req.params.id,
            userId: req.user.id
        }
    }).then(function(hotel) {
        res.status(200).send({success: true});
    });
});

router.patch('/hotel/:id', checkAuthentication, function(req, res, next) {
    const { name, logo, address, email, phone, longitude, latitude, status } = req.body;
    Hotel.update(
        {
            name,
            logo,
            address,
            email: email.join(','),
            phone: phone.join(','),
            longitude,
            latitude,
            status
        },
        {
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        }
    ).then(hotel => {
        res.status(200).send(hotel);
    })
})

router.post('/upload', checkAuthentication, function(req, res, next) {

    let dir = __dirname + '/public/assets';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    if (!req.files) {
        return res.status(400).send('No file was uploaded!');
    }

    let fileUpload = req.files.file;    
    
    fileUpload.mv(__dirname + '/public/assets/' + fileUpload.name, function(err) {
        if (err) {
            console.log('error', err);
            res.status(500).send(err);
        }
        res.send('File successfully uploaded!');
    });

});

router.post('/uploads', checkAuthentication, function(req, res, next) {

    const { files } = req;
    let err = false;

    let dir = __dirname + '/public/assets';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    for (let key in files) {

        const fileUpload = files[key];
        fileUpload.mv(__dirname + '/public/assets/' + fileUpload.name, function(err) {
            if (err) {
                console.log('error', err);
                err = true;
            }
        });
    }

    if (err) {
        console.log('error');
        res.status(500).send(err)
    } else {
        console.log('success');
        res.send('Files successfully uploaded!');
    }
});

router.post('/videos', checkAuthentication, function(req, res, next) {

    const { files } = req;
    let err = false;
    for (let key in files) {

        const fileUpload = files[key];
        fileUpload.mv(__dirname + '/public/assets/' + fileUpload.name, function(err) {
            if (err) {
                console.log('error', err);
                err = true;
            }
        });
    }

    if (err) {
        console.log('error');
        res.status(500).send(err)
    } else {
        console.log('success');
        res.send('Files successfully uploaded!');
    }
});

router.post('/category', checkAuthentication, function(req, res, next) {
    const { name, status } = req.body;
    
    Category.create({ userId: req.user.id, name, status }).then(function(category) {
        res.status(200).send(category);
    });
});

router.post('/subCategory', checkAuthentication, function(req, res, next) {
    const { parentId, name, status } = req.body;
    
    Category.create({ userId: req.user.id, parentId, name, status }).then(function(subCategory) {
        Category.findById(subCategory.id, {
            include: [{
                model: Category,
                as: 'category'
            }]
        }).then(function(subCategory) {
            res.status(200).send(subCategory);
        });
    });
    
});

router.get('/categories', function(req, res, next) {
    Category.findAll({
        where: {
            parentId: null
        }
    }).then(function(categories) {
        res.status(200).send(categories);
    });
});

router.get('/allCategories', function(req, res, next) {
    Category.findAll({}).then(function(categories) {
        res.status(200).send(categories);
    });
});

router.get('/subCategories', function(req, res, next) {
    
    if (req.query.cat_id != "undefined") {
        
        Category.findAll({
            where: {
                parentId: req.query.cat_id 
            },
            include: [{
                model: Category,
                as: 'category'
            }]
        }).then(function(subCategories) {
            res.status(200).send(subCategories);
        });

    } else {

        Category.findAll({
            where: {
                parentId: { $ne: null } 
            },
            include: [{
                model: Category,
                as: 'category'
            }]
        }).then(function(subCategories) {
            res.status(200).send(subCategories);
        });
    }
    
});

router.delete('/category/:id', checkAuthentication, function(req, res, next) {
    
    Category.destroy({
        where: {
            id: req.params.id,
            userId: req.user.id
        },
    })
    .then(function(category) {
        res.status(200).send({success: true});
    });
    
});

router.delete('/subCategory/:id', checkAuthentication, function(req, res, next) {
    
    Category.destroy({
        where: {
            id: req.params.id,
            userId: req.user.id
        }
    }).then(function(category){
        Category.findAll({
            where: {
                parentId: { $ne: null } 
            },
            include: [{
                model: Category,
                as: 'category'
            }]
        }).then(function(subCategories) {
            res.status(200).send(subCategories);
        });
    });
});

router.patch('/category/:id', checkAuthentication, function(req, res, next) {
    const { name, status } = req.body;
    Category.update(
        {
            name,
            status
        },
        {
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        }
    ).then(function(category) {
        res.status(200).send(category);
    })
});

router.patch('/subCategory/:id', checkAuthentication, function(req, res, next) {
    const { name, parentId, status } = req.body
    Category.update(
        {
            name,
            parentId,
            status
        },
        {
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        }
    ).then(function(subCategory) {
        res.status(200).send(subCategory);
    });
});

router.post('/signup', function(req, res, next) {
    
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(existingUser => {
        if (existingUser)
            return res.status(401).send({title: 'User with this email address has already been registered'});
        else {
            User.create({ firstName: req.body.first_name, lastName: req.body.last_name, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) }).then(function(user) {
                if (user) {
                    res.status(200).send(user);
                }
            });
        }
    });
});

router.post('/signin', function(req, res, next) {
    User.find({
        where: {
            email: req.body.email
        }
    }).then(function(user) {
        if (user) {
            console.log(user);
            if (bcrypt.compareSync(req.body.password, user.password)) {
                jwt.sign({user: user}, 'secret', {expiresIn: 3600 * 24}, function(err, token) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    }
                    res.status(200).send({ token: token, userId: user.id });
                });
            } else {
                return res.status(401).send({
                    title: 'Invalid Credentials'
                });
            }
        } else {
            return res.status(401).send({
                title: 'Invalid Credentials'
            });
        }
    })
});

router.post('/ad', checkAuthentication, function(req, res, next) {
    const { description, image, video, hotelId, categoryId, subCategoryId, type } = req.body;
    console.log(req.user.id, hotelId, categoryId, subCategoryId);
    Ad.create(
        {
            userId: req.user.id, 
            description, 
            image: image.join(','), 
            video: video.join(','), 
            hotelId, 
            categoryId, 
            subCategoryId, 
            type
        }
    ).then(function(ad) {
        res.status(200).send(ad);
    });

});

router.get('/ads', function(req, res, next) {
    Ad.findAll({
        include: [
            {
                model: User,
                as: 'user'
            },
            {
                model: Hotel,
                as: 'hotel'
            },
            {
                model: Category,
                as: 'category'
            },
            {
                model: Category,
                as: 'subCategory'
            }
        ]
    }).then(function(ads) {
        res.status(200).send(ads);
    });
});

router.delete('/ad/:id', checkAuthentication, function(req, res, next) {
    
    Ad.destroy({
        where: {
            id: req.params.id,
            userId: req.user.id
        }
    }).then(function(ad) {
        res.status(200).send({success: true});
    });
});

router.patch('/ad/:id', checkAuthentication, function(req, res, next) { 

    const { description, image, video, hotelId, categoryId, subCategoryId, type } = req.body;
    Ad.update(
        {
            description, image: image.join(','), video: video.join(','), hotelId, categoryId, subCategoryId, type
        },
        {
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        }
    ).then(function(ad) {
        res.status(200).send(ad);
    })
});

router.get('/getAds', (req, res, next) => {
    Ad.findAll({
        where: {
            type: 'active'
        }
    }).then(ads => {
        console.log(ads.length);
        console.log(ads);
        res.send(ads);
    });

});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('app is listening at port:', PORT);
});

